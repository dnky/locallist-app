// pages/api/admin/sync.js
import { google } from 'googleapis';
import prisma from '../../../lib/prisma';

// Helper to safely cast spreadsheet strings to DB types
function castValue(key, value) {
  // 1. Handle Integers (grid_w, grid_h)
  if (['grid_w', 'grid_h'].includes(key)) {
    if (value === undefined || value === null || value === '') return 1;
    const parsed = parseInt(value);
    return isNaN(parsed) ? 1 : parsed;
  }

  // 2. Handle Booleans
  if (['isActive', 'displayPhone', 'displayEmail', 'displayOnMap'].includes(key)) {
    if (value === undefined || value === null || value === '') {
        // Defaults: isActive=false, others=true
        return key !== 'isActive'; 
    }
    return String(value).toUpperCase() === 'TRUE';
  }

  // 3. Handle Floats (lat, lng)
  if (['lat', 'lng'].includes(key)) {
    if (value === undefined || value === null || value === '') return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }

  // 4. Default Handle Strings
  if (value === undefined || value === null) return '';
  return String(value);
}

// Helper: Convert 0-based column index to A1 notation letter (e.g., 0 -> A, 26 -> AA)
function getColumnLetter(colIndex) {
  let temp, letter = '';
  while (colIndex >= 0) {
    temp = (colIndex) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    colIndex = Math.floor((colIndex) / 26) - 1;
  }
  return letter;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (authHeader !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { action } = req.body;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const SHEET_NAME = 'SupabaseAds'; // Centralized sheet name var

    // ==========================================
    // ACTION: PUSH (DB -> SHEET)
    // ==========================================
    if (action === 'push') {
      const ads = await prisma.ad.findMany({
        include: {
          tenant: true,
          images: { orderBy: { createdAt: 'asc' } }
        },
        orderBy: { createdAt: 'desc' }
      });

      let rows = [];
      let headers = [];

      if (ads.length > 0) {
        const flatAds = ads.map(ad => {
          const rowObj = {};
          
          rowObj['tenantDomain'] = ad.tenant?.domain || '';
          rowObj['imageUrls'] = ad.images ? ad.images.map(img => img.url).join(', ') : '';

          Object.keys(ad).forEach(key => {
            // Exclude keys we definitely don't want in the sheet
            if (['tenant', 'images', 'tenantId', 'createdAt', 'updatedAt'].includes(key)) return;
            
            const val = ad[key];
            rowObj[key] = (val === null || val === undefined) ? '' : val;
          });

          return rowObj;
        });
        
        headers = Object.keys(flatAds[0]);
        rows = flatAds.map(ad => headers.map(key => ad[key]));
      } 

      const values = [headers, ...rows];
      await sheets.spreadsheets.values.clear({ spreadsheetId, range: SHEET_NAME });
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });

      return res.status(200).json({ success: true, message: `Pushed ${ads.length} ads.` });
    }

    // ==========================================
    // ACTION: PULL (SHEET -> DB)
    // ==========================================
    if (action === 'pull') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: SHEET_NAME,
      });

      const allRows = response.data.values;
      if (!allRows || allRows.length < 2) {
        return res.status(400).json({ error: 'Sheet is empty or missing data.' });
      }

      const headers = allRows[0].map(h => h.trim()); 
      const dataRows = allRows.slice(1);
      
      // Find where the ID column is so we can write back to it
      const idColIndex = headers.indexOf('id');
      const idColLetter = idColIndex !== -1 ? getColumnLetter(idColIndex) : null;

      let updatedCount = 0;
      let createdCount = 0;
      const sheetUpdates = []; // To store ID updates for batch writing

      const tenants = await prisma.tenant.findMany();
      const tenantMap = {};
      tenants.forEach(t => tenantMap[t.domain] = t.id);

      // Iterate using index so we know which Excel row we are on
      for (let i = 0; i < dataRows.length; i++) {
        const rowValues = dataRows[i];
        
        const rowData = {};
        headers.forEach((header, index) => {
            rowData[header] = rowValues[index];
        });

        // Skip rows without critical info
        if (!rowData.businessName || !rowData.tenantDomain) continue;

        const tenantId = tenantMap[rowData.tenantDomain];
        if (!tenantId) {
            console.warn(`Skipping ${rowData.businessName}: Unknown tenant ${rowData.tenantDomain}`);
            continue;
        }

        const imageUrlList = rowData.imageUrls 
          ? rowData.imageUrls.split(',').map(s => s.trim()).filter(s => s.length > 0)
          : [];

        // 1. Build Payload
        const basePayload = {};

        headers.forEach(key => {
          // EXCLUSION LIST
          if (['id', 'tenantDomain', 'imageUrls', 'tenantId', 'images', 'imageSrc', 'tenant', 'createdAt', 'updatedAt'].includes(key)) return;
          basePayload[key] = castValue(key, rowData[key]);
        });
        
        // 2. FORCE DEFAULTS
        basePayload.tenantId = tenantId;
        basePayload.imageSrc = imageUrlList[0] || '/placeholder.png';
        if (!basePayload.type) basePayload.type = 'BASIC';
        
        if (basePayload.grid_w === undefined || basePayload.grid_w === null) basePayload.grid_w = 1;
        if (basePayload.grid_h === undefined || basePayload.grid_h === null) basePayload.grid_h = 1;

        if (basePayload.displayPhone === undefined || basePayload.displayPhone === null) basePayload.displayPhone = true;
        if (basePayload.displayEmail === undefined || basePayload.displayEmail === null) basePayload.displayEmail = true;
        if (basePayload.displayOnMap === undefined || basePayload.displayOnMap === null) basePayload.displayOnMap = true;
        if (basePayload.isActive === undefined || basePayload.isActive === null) basePayload.isActive = false;

        delete basePayload.tenant; 
        delete basePayload.images;

        // 4. Determine ID
        const adId = rowData.id && rowData.id.length > 10 ? rowData.id : null;

        if (adId) {
          // --- UPDATE EXISTING ---
          await prisma.ad.update({
            where: { id: adId },
            data: {
              ...basePayload,
              images: {
                deleteMany: {},
                create: imageUrlList.map(url => ({ url }))
              }
            }
          });
          updatedCount++;
        } else {
          // --- CREATE NEW ---
          if (!basePayload.slug) {
             basePayload.slug = (rowData.businessName || 'biz')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000);
          }

          const newAd = await prisma.ad.create({ 
            data: {
              ...basePayload,
              images: {
                create: imageUrlList.map(url => ({ url }))
              }
            } 
          });
          createdCount++;

          // Prepare to write the new ID back to the sheet
          if (idColLetter) {
            // Row index in sheet: Header (1) + Previous Data (i) + 1 (1-based index) -> i + 2
            const sheetRowNumber = i + 2; 
            sheetUpdates.push({
              range: `${SHEET_NAME}!${idColLetter}${sheetRowNumber}`,
              values: [[newAd.id]]
            });
          }
        }
      }

      // 5. Batch Update Google Sheet with new IDs
      if (sheetUpdates.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId,
          resource: {
            valueInputOption: 'USER_ENTERED',
            data: sheetUpdates
          }
        });
      }

      return res.status(200).json({ 
        success: true, 
        message: `Sync complete. Created: ${createdCount} (IDs updated), Updated: ${updatedCount}` 
      });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Sheet Sync Error:', error);
    return res.status(500).json({ error: error.message || 'Server Error' });
  }
}
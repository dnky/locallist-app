// pages/api/admin/sync.js
import { google } from 'googleapis';
import prisma from '../../../lib/prisma';

/**
 * 1. TRANSFORMER
 * Flattens a Prisma Ad object into a flat object suitable for a spreadsheet row.
 * This implicitly defines your column structure.
 */
function flattenAd(ad) {
  return {
    id: ad.id || '',
    tenantDomain: ad.tenant?.domain || '', // Flatten relationship
    businessName: ad.businessName || '',
    type: ad.type || 'BASIC',
    slug: ad.slug || '',
    description: ad.description || '',
    phone: ad.phone || '',
    email: ad.email || '',
    web: ad.web || '',
    address: ad.address || '',
    lat: ad.lat || '',
    lng: ad.lng || '',
    tags: ad.tags || '',
    isActive: ad.isActive, // Keep as boolean, sheet will handle it
    displayPhone: ad.displayPhone,
    displayEmail: ad.displayEmail,
    displayOnMap: ad.displayOnMap,
    grid_w: ad.grid_w || 1,
    grid_h: ad.grid_h || 1,
    adminNotes: ad.adminNotes || '',
    // Convert array of objects to comma-separated string
    imageUrls: ad.images ? ad.images.map(img => img.url).join(', ') : '' 
  };
}

/**
 * 2. TYPE CASTER
 * Converts string values from Google Sheets back into correct DB types.
 */
function castValue(key, value) {
  if (value === undefined || value === null) return null;
  
  // Handle Booleans
  if (['isActive', 'displayPhone', 'displayEmail', 'displayOnMap'].includes(key)) {
    return String(value).toUpperCase() === 'TRUE';
  }

  // Handle Integers
  if (['grid_w', 'grid_h'].includes(key)) {
    return parseInt(value) || 1;
  }

  // Handle Floats
  if (['lat', 'lng'].includes(key)) {
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }

  // Handle Strings (Default)
  return String(value);
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
    // Auth with Google
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // ==========================================
    // ACTION: PUSH (DB -> SHEET)
    // ==========================================
    if (action === 'push') {
      const ads = await prisma.ad.findMany({
        include: {
          tenant: true,
          images: { orderBy: { createdAt: 'asc' } }
        },
        orderBy: { createdAt: 'desc' } // Newest first
      });

      let rows = [];
      let headers = [];

      if (ads.length > 0) {
        // 1. Convert all DB objects to Flat objects
        const flatAds = ads.map(flattenAd);
        
        // 2. Generate Headers dynamically from the first record
        headers = Object.keys(flatAds[0]);
        
        // 3. Create the data rows matching the header order
        rows = flatAds.map(ad => headers.map(key => ad[key]));
      } else {
        // Fallback if DB is empty: Create a dummy object to generate headers
        const dummyAd = flattenAd({});
        headers = Object.keys(dummyAd);
      }

      // Add Headers to the top
      const values = [headers, ...rows];

      // Clear and Write
      await sheets.spreadsheets.values.clear({ spreadsheetId, range: 'Sheet1' });
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });

      return res.status(200).json({ success: true, message: `Pushed ${ads.length} ads. Headers generated: ${headers.join(', ')}` });
    }

    // ==========================================
    // ACTION: PULL (SHEET -> DB)
    // ==========================================
    if (action === 'pull') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Sheet1', // Fetch the whole sheet
      });

      const allRows = response.data.values;
      if (!allRows || allRows.length < 2) {
        return res.status(400).json({ error: 'Sheet is empty or missing data.' });
      }

      // 1. Get Headers dynamically from Row 1
      const headers = allRows[0]; 
      const dataRows = allRows.slice(1);

      let updatedCount = 0;
      let createdCount = 0;

      // Cache tenants
      const tenants = await prisma.tenant.findMany();
      const tenantMap = {};
      tenants.forEach(t => tenantMap[t.domain] = t.id);

      for (const rowValues of dataRows) {
        // 2. Map row array to an object using the headers
        const rowData = {};
        headers.forEach((header, index) => {
            rowData[header] = rowValues[index]; // value or undefined
        });

        // Skip invalid rows
        if (!rowData.businessName || !rowData.tenantDomain) continue;

        const tenantId = tenantMap[rowData.tenantDomain];
        if (!tenantId) {
            console.warn(`Skipping ${rowData.businessName}: Unknown tenant ${rowData.tenantDomain}`);
            continue;
        }

        // 3. Prepare Images
        const imageUrlList = rowData.imageUrls 
          ? rowData.imageUrls.split(',').map(s => s.trim()).filter(s => s.length > 0)
          : [];

        // 4. Build Prisma Payload dynamically
        // We construct the object using keys from the sheet, but exclude special handling keys
        const adPayload = {
          tenantId: tenantId,
          images: {
             deleteMany: {},
             create: imageUrlList.map(url => ({ url }))
          },
          // Ensure mandatory internal field has a value
          imageSrc: imageUrlList[0] || '/placeholder.png', 
        };

        // Transfer simple fields with type casting
        headers.forEach(key => {
          // Skip fields we handled manually or don't want to sync blindly
          if (['id', 'tenantDomain', 'imageUrls', 'tenantId', 'images', 'imageSrc'].includes(key)) return;
          
          adPayload[key] = castValue(key, rowData[key]);
        });

        // Ensure defaults if Sheet didn't have these columns
        if (!adPayload.type) adPayload.type = 'BASIC';
        
        // Handle ID for Upsert
        const adId = rowData.id && rowData.id.length > 10 ? rowData.id : null;

        if (adId) {
          await prisma.ad.update({
            where: { id: adId },
            data: adPayload
          });
          updatedCount++;
        } else {
          // Generate Slug if missing
          if (!adPayload.slug) {
             adPayload.slug = (rowData.businessName || 'biz')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000);
          }
          await prisma.ad.create({ data: adPayload });
          createdCount++;
        }
      }

      return res.status(200).json({ 
        success: true, 
        message: `Sync complete using headers: [${headers.join(', ')}]. Created: ${createdCount}, Updated: ${updatedCount}` 
      });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Sheet Sync Error:', error);
    return res.status(500).json({ error: error.message || 'Server Error' });
  }
}
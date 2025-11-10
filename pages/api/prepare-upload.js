// pages/api/prepare-upload.js

import { supabase } from '../../lib/supabase'; // The server-side client with the SERVICE_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName, tenantDomain } = req.body;

    if (!fileName || !tenantDomain) {
      return res.status(400).json({ error: 'File name and tenant domain are required.' });
    }
    
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-._]/g, '');
    const filePath = `${tenantDomain}/${Date.now()}-${sanitizedFileName}`;

    // --- THIS IS THE FIX ---
    // Change from `createSignedUrl` back to `createSignedUploadUrl`.
    // `createSignedUrl` is for DOWNLOADING files and throws an "Object not found" error
    // if the file doesn't already exist.
    // `createSignedUploadUrl` is the correct method for creating a temporary URL
    // that grants permission to UPLOAD a new file.
    const { data, error } = await supabase.storage
      .from('ad-photos')
      .createSignedUploadUrl(filePath, {
        upsert: false, // `upsert: false` is safer as file paths include a timestamp.
      });

    if (error) {
      console.error('Error creating signed URL:', error);
      throw new Error('Could not create signed URL.');
    }

    // The shape of the returned data is the same, so the rest of the function is fine.
    // The data object from `createSignedUploadUrl` correctly contains both `signedUrl` and `path`.
    // The frontend relies on both of these properties.
    res.status(200).json({
      signedUrl: data.signedUrl,
      path: data.path,
    });

  } catch (error) {
    console.error('Prepare Upload API Error:', error);
    res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
}
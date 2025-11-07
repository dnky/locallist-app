import { formidable } from 'formidable';
import { supabase } from '../../lib/supabase';
import prisma from '../../lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function verifyCaptcha(token) {
  const secret = process.env.HCAPTCHA_SECRET_KEY;
  const response = await fetch('https://api.hcaptcha.com/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `response=${token}&secret=${secret}`,
  });
  const data = await response.json();
  return data.success;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({ multiples: true, maxFileSize: 5 * 1024 * 1024 }); // 5MB limit per file

    const [fields, files] = await form.parse(req);
    
    const captchaToken = fields['h-captcha-response']?.[0];
    if (!captchaToken || !(await verifyCaptcha(captchaToken))) {
      return res.status(400).json({ error: 'CAPTCHA verification failed.' });
    }

    const tenantDomain = fields.tenantDomain?.[0];
    const tenant = await prisma.tenant.findUnique({ where: { domain: tenantDomain } });
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found.' });
    }

    const uploadedImageUrls = [];
    const imageFiles = files.images ? (Array.isArray(files.images) ? files.images : [files.images]) : [];

    for (const file of imageFiles) {
      const fileBuffer = await fs.readFile(file.filepath);
      const fileName = `${Date.now()}-${file.originalFilename}`;
      const filePath = `${tenant.domain}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('ad-images')
        .upload(filePath, fileBuffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw new Error(`Storage error: ${error.message}`);

      const { data: { publicUrl } } = supabase.storage.from('ad-images').getPublicUrl(data.path);
      uploadedImageUrls.push(publicUrl);
    }

    const newAd = await prisma.ad.create({
      data: {
        tenantId: tenant.id,
        businessName: fields.businessName?.[0],
        description: fields.description?.[0],
        phone: fields.phone?.[0],
        email: fields.email?.[0],
        web: fields.web?.[0],
        address: fields.address?.[0],
        tags: fields.tags?.[0],
        isActive: false, // Default to inactive
        grid_h: 1, // Default values
        grid_w: 1,
        imageSrc: uploadedImageUrls[0] || '/placeholder.png', // Use first image as cover
        images: {
          create: uploadedImageUrls.map(url => ({ url })),
        },
      },
    });

    res.status(201).json({ success: true, message: 'Submission successful! Your ad is pending review.', adId: newAd.id });

  } catch (error) {
    console.error('Signup API Error:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
}
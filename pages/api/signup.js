import prisma from '../../lib/prisma';

// We no longer need formidable, fs, or the server-side supabase client.

// We can remove the special config. The default Next.js body parser will handle JSON.
// export const config = { ... };

async function verifyCaptcha(token) {
  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret) {
      throw new Error("HCAPTCHA_SECRET_KEY is not set.");
  }
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
    const { captchaToken, tenantDomain, imageUrls, ...adData } = req.body;

    if (!captchaToken || !(await verifyCaptcha(captchaToken))) {
      return res.status(400).json({ error: 'CAPTCHA verification failed.' });
    }

    const tenant = await prisma.tenant.findUnique({ where: { domain: tenantDomain } });
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found.' });
    }

    // The image URLs are already uploaded and provided in the request body.
    const newAd = await prisma.ad.create({
      data: {
        tenantId: tenant.id,
        businessName: adData.businessName,
        description: adData.description,
        phone: adData.phone,
        email: adData.email,
        web: adData.web,
        address: adData.address,
        tags: adData.tags,
        isActive: false, // Default to inactive
        grid_h: 1, // Default values
        grid_w: 1,
        imageSrc: imageUrls?.[0] || '/placeholder.png', // Use first image as cover
        images: {
          create: imageUrls.map(url => ({ url })),
        },
      },
    });

    res.status(201).json({ success: true, message: 'Submission successful! Your ad is pending review.', adId: newAd.id });

  } catch (error) {
    console.error('Signup API Error:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
}
import prisma from '../../lib/prisma';
import { Resend } from 'resend'; // <-- 1. Import Resend

const resend = new Resend(process.env.RESEND_API_KEY); // <-- 2. Initialize Resend

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

    const newAd = await prisma.ad.create({
      data: {
        tenantId: tenant.id,
        type: adData.type || 'PREMIUM',
        businessName: adData.businessName,
        description: adData.description,
        phone: adData.phone,
        email: adData.email,
        web: adData.web,
        address: adData.address,
        tags: adData.tags,
        isActive: false, 
        grid_h: 1, 
        grid_w: 1,
        imageSrc: imageUrls?.[0] || '/placeholder.png',
        images: {
          create: imageUrls.map(url => ({ url })),
        },
        displayPhone: adData.displayPhone,
        displayEmail: adData.displayEmail,
        displayOnMap: adData.displayOnMap,
        adminNotes: adData.adminNotes,
      },
    });

    // --- 3. SEND ADMIN NOTIFICATION EMAIL ---
    try {
      await resend.emails.send({
        from: 'LocalList Signup <onboarding@resend.dev>',
        to: ['m@ttmorgan.com'], // <-- IMPORTANT: Your admin email address
        subject: `New Signup for ${tenant.name}: ${adData.businessName}`,
        html: `
          <h1>New Business Submission</h1>
          <p>A new business has signed up and is ready for review.</p>
          <ul>
            <li><strong>Directory:</strong> ${tenant.name} (${tenant.domain})</li>
            <li><strong>Listing Type:</strong> ${adData.type}</li> 
            <li><strong>Business Name:</strong> ${adData.businessName}</li>
            <li><strong>Email:</strong> ${adData.email || 'N/A'}</li>
            <li><strong>Phone:</strong> ${adData.phone || 'N/A'}</li>
            <li><strong>Address:</strong> ${adData.address || 'N/A'}</li>
            <li><strong>Website:</strong> ${adData.web || 'N/A'}</li>
          </ul>
          <h2>Display Preferences:</h2>
          <ul>
            <li><strong>Display Phone:</strong> ${adData.displayPhone ? 'Yes' : 'No'}</li>
            <li><strong>Display Email:</strong> ${adData.displayEmail ? 'Yes' : 'No'}</li>
            <li><strong>Display on Map:</strong> ${adData.displayOnMap ? 'Yes' : 'No'}</li>
          </ul>
          <h2>Admin Notes from User:</h2>
          <p>${adData.adminNotes || 'None provided.'}</p>
          <p>You can review and activate this listing in the Supabase dashboard.</p>
        `,
      });
    } catch (emailError) {
      // Log the email error but don't fail the user's request
      // The signup was successful, only the admin notification failed.
      console.error("Failed to send admin notification email:", emailError);
    }
    // -----------------------------------------

    res.status(201).json({ success: true, message: 'Submission successful! Your ad is pending review.', adId: newAd.id });

  } catch (error) {
    console.error('Signup API Error:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
}
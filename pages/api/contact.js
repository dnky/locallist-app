import { Resend } from 'resend';

// Initialize Resend with the API key from your environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { name, businessName, email, message } = req.body;

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>', // This is a required field, Resend's default
      to: ['m@ttmorgan.com'], // <-- IMPORTANT: REPLACE WITH YOUR ACTUAL EMAIL ADDRESS
      subject: `New Inquiry from ${businessName} via LocalList`,
      html: `
        <h2>New Business Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Business Name:</strong> ${businessName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message || 'No message provided.'}</p>
      `,
    });

    if (error) {
      console.error({ error });
      return res.status(400).json({ message: 'Error sending email.' });
    }

    // Redirect to a success page after successful submission
    return res.redirect(302, '/thank-you');

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
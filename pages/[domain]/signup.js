import { useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import prisma from '../../lib/prisma';
import SharedHeader from '../../components/SharedHeader';
import styles from '../../styles/SignupPage.module.css';
import { supabase } from '../../lib/supabase-client'; // <-- USE THE NEW CLIENT-SIDE HELPER

const HCaptcha = dynamic(() => import('@hcaptcha/react-hcaptcha'), {
  ssr: false,
});

export default function SignupPage({ tenant }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    phone: '',
    email: '',
    web: '',
    address: '',
    tags: '',
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, success: null, message: '' });
  const captchaRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setStatus({ ...status, error: "You can upload a maximum of 5 images." });
      return;
    }
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaToken) {
      setStatus({ ...status, error: 'Please complete the CAPTCHA.' });
      return;
    }
    setStatus({ loading: true, error: null, success: null, message: 'Starting submission...' });

    try {
      // Step 1: Upload images directly to Supabase
      const uploadedImageUrls = [];
      for (const image of images) {
        const fileName = `${Date.now()}-${image.name}`;
        const filePath = `${tenant.domain}/${fileName}`;
        
        setStatus(s => ({ ...s, message: `Uploading ${image.name}...` }));

        const { data, error } = await supabase.storage
          .from('ad-images')
          .upload(filePath, image);

        if (error) {
          throw new Error(`Failed to upload ${image.name}: ${error.message}`);
        }

        const { data: { publicUrl } } = supabase.storage.from('ad-images').getPublicUrl(data.path);
        uploadedImageUrls.push(publicUrl);
      }

      // Step 2: Send text data and image URLs to our API
      setStatus(s => ({ ...s, message: 'Finalizing submission...' }));
      const payload = {
        ...formData,
        imageUrls: uploadedImageUrls,
        captchaToken: captchaToken,
        tenantDomain: tenant.domain,
      };

      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json(); // Now this should always receive JSON
      if (!res.ok) {
        throw new Error(result.error || 'An unknown error occurred during final submission.');
      }
      
      setStatus({ loading: false, success: true, message: result.message, error: null });
      router.push(`/${tenant.domain}/thank-you-signup`);

    } catch (error) {
      setStatus({ loading: false, error: error.message, success: false, message: '' });
      if (captchaRef.current) {
        captchaRef.current.resetCaptcha();
      }
    }
  };

  return (
    <div className={styles.signupPage}>
      <Head>
        <title>Get Listed - {tenant.title}</title>
      </Head>
      <SharedHeader title={tenant.title} />
      <main className={styles.container}>
        <h1>Get Your Business Listed on {tenant.name}</h1>
        <p>Fill out the form below to submit your business for review. Once approved, your ad will appear in our directory.</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
            {/* All form groups remain the same */}
            <div className={styles.formSection}>
            <h2>Business Details</h2>
            <div className={styles.formGroup}>
              <label htmlFor="businessName">Business Name *</label>
              <input type="text" id="businessName" name="businessName" value={formData.businessName} onChange={handleInputChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="description">Description / About Us</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows="5"></textarea>
            </div>
             <div className={styles.formGroup}>
              <label htmlFor="tags">Category / Tags (comma-separated, e.g., Plumber, Emergency, Local)</label>
              <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleInputChange} />
            </div>
          </div>
          
          <div className={styles.formSection}>
            <h2>Contact Information</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="web">Website (e.g., https://example.com)</label>
              <input type="url" id="web" name="web" value={formData.web} onChange={handleInputChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="address">Full Address</label>
              <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} />
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Images</h2>
            <p>Upload up to 5 images for your listing (max 5MB each). The first image will be your main cover photo.</p>
            <div className={styles.formGroup}>
              <input type="file" id="images" name="images" onChange={handleImageChange} multiple accept="image/png, image/jpeg, image/gif" />
            </div>
            {imagePreviews.length > 0 && (
              <div className={styles.imagePreviewContainer}>
                {imagePreviews.map((src, index) => (
                  <img key={index} src={src} alt={`Preview ${index + 1}`} className={styles.imagePreview} />
                ))}
              </div>
            )}
          </div>

          <HCaptcha
            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
            onVerify={setCaptchaToken}
            ref={captchaRef}
          />
          
          {status.message && <p className={styles.info}>{status.message}</p>}
          {status.error && <p className={styles.error}>{status.error}</p>}
          {status.success && <p className={styles.success}>Submission successful!</p>}

          <button type="submit" className={styles.submitBtn} disabled={status.loading}>
            {status.loading ? 'Submitting...' : 'Submit for Review'}
          </button>
        </form>
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  // ... this function remains unchanged
  const { domain } = context.params;
  const tenant = await prisma.tenant.findUnique({
    where: { domain },
  });

  if (!tenant) {
    return { notFound: true };
  }

  return {
    props: {
      tenant: JSON.parse(JSON.stringify(tenant)),
    },
  };
}
// pages/[domain]/signup.js

import { useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import prisma from '../../lib/prisma';
import SharedHeader from '../../components/SharedHeader';
import styles from '../../styles/SignupPage.module.css';

const HCaptcha = dynamic(() => import('@hcaptcha/react-hcaptcha'), {
  ssr: false,
});

/**
 * Resizes an image file to fit within max dimensions.
 */
function resizeImage(file, maxWidth, maxHeight) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const { width, height } = img;

        if (width <= maxWidth && height <= maxHeight) {
          resolve(file);
          return;
        }

        const ratio = Math.min(maxWidth / width, maxHeight / height);
        const newWidth = Math.round(width * ratio);
        const newHeight = Math.round(height * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: file.type, lastModified: Date.now() }));
        }, file.type, 0.9);
      };
    };
  });
}

export default function SignupPage({ tenant }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    phone: '',
    email: '',
    web: '',
    address: '',
    // tags: '', // REMOVED: Managed manually by admin
    displayPhone: true,
    displayEmail: true,
    displayOnMap: true,
    adminNotes: '',
    type: 'BASIC', // Default to Basic
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, success: null, message: '' });
  const captchaRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
    }));
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
      const uploadedImageUrls = [];
      
      // --- ONLY PROCESS IMAGES IF PREMIUM ---
      if (formData.type === 'PREMIUM' && images.length > 0) {
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 800;
        const supabasePublicUrlBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ad-photos/`;

        for (const image of images) {
            setStatus(s => ({ ...s, message: `Resizing ${image.name}...` }));
            const resizedImage = await resizeImage(image, MAX_WIDTH, MAX_HEIGHT);

            setStatus(s => ({ ...s, message: `Preparing to upload ${resizedImage.name}...` }));
            const presignRes = await fetch('/api/prepare-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fileName: resizedImage.name,
                tenantDomain: tenant.domain
            }),
            });
            const { signedUrl, path, error: presignError } = await presignRes.json();
            if (presignError) throw new Error(`Could not get upload URL for ${image.name}: ${presignError}`);
            
            setStatus(s => ({ ...s, message: `Uploading ${resizedImage.name}...` }));
            const uploadRes = await fetch(signedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': resizedImage.type },
            body: resizedImage,
            });
            if (!uploadRes.ok) {
            const errorBody = await uploadRes.text();
            console.error("Upload failed with body:", errorBody);
            throw new Error(`Failed to upload ${resizedImage.name}.`);
            }
            
            const finalUrl = `${supabasePublicUrlBase}${path}`;
            uploadedImageUrls.push(finalUrl);
        }
      }

      setStatus(s => ({ ...s, message: 'Finalizing submission...' }));
      
      // Construct payload (description is empty if Basic)
      const payload = { 
          ...formData, 
          description: formData.type === 'PREMIUM' ? formData.description : '',
          imageUrls: uploadedImageUrls, 
          captchaToken, 
          tenantDomain: tenant.domain 
      };

      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'An unknown error occurred.');
      
      setStatus({ loading: false, success: true, message: result.message, error: null });
      router.push(`/${tenant.domain}/thank-you-signup`);

    } catch (error) {
      setStatus({ loading: false, error: error.message, success: false, message: '' });
      if (captchaRef.current?.resetCaptcha) captchaRef.current.resetCaptcha();
    }
  };
  
  return (
    <div className={styles.signupPage}>
      <Head>
        <title>{`Get Listed - ${tenant.title}`}</title>
      </Head>
      <SharedHeader title={tenant.title} />
      <main className={styles.container}>
        <h1>Get Your Business Listed on {tenant.name}</h1>
        <p>Fill out the form below to submit your business for review.</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
            
            {/* --- PRICING / TYPE SELECTION --- */}
            <div className={styles.pricingSection}>
                <h2 style={{fontSize: '1.2rem', marginBottom: '15px'}}>Choose your Listing Tier</h2>
                
                {/* Basic Option */}
                <div style={{marginBottom: '15px', display: 'flex', alignItems: 'flex-start', gap: '10px'}}>
                    <input 
                        type="radio" 
                        id="typeBasic" 
                        name="type" 
                        value="BASIC" 
                        checked={formData.type === 'BASIC'} 
                        onChange={handleInputChange} 
                        style={{marginTop: '5px', transform: 'scale(1.2)'}}
                    />
                    <label htmlFor="typeBasic" style={{cursor: 'pointer'}}>
                        <strong>Basic Listing</strong>
                        <p style={{fontSize: '0.9rem', margin: '5px 0 0', color: '#666'}}>
                            Name, contact info. Full-width list entry.
                        </p>
                    </label>
                </div>

                {/* Premium Option */}
                <div style={{marginBottom: '0', display: 'flex', alignItems: 'flex-start', gap: '10px'}}>
                    <input 
                        type="radio" 
                        id="typePremium" 
                        name="type" 
                        value="PREMIUM" 
                        checked={formData.type === 'PREMIUM'} 
                        onChange={handleInputChange} 
                        style={{marginTop: '5px', transform: 'scale(1.2)'}}
                    />
                    <label htmlFor="typePremium" style={{cursor: 'pointer'}}>
                        <strong>Premium Listing</strong>
                        <p style={{fontSize: '0.9rem', margin: '5px 0 0', color: '#666'}}>
                            Includes photos, dedicated details page, map priority, description, and website link.
                        </p>
                    </label>
                </div>
            </div>

            <div className={styles.formSection}>
            <h2>Business Details</h2>
            <div className={styles.formGroup}>
              <label htmlFor="businessName">Business Name *</label>
              <input type="text" id="businessName" name="businessName" value={formData.businessName} onChange={handleInputChange} required />
            </div>
            
            {/* --- CONDITIONALLY RENDER DESCRIPTION (Premium Only) --- */}
            {formData.type === 'PREMIUM' && (
                <div className={styles.formGroup}>
                    <label htmlFor="description">Description / About Us</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows="5"></textarea>
                </div>
            )}
            
            {/* TAGS REMOVED */}

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

            <h3 className={styles.subheading}>Display Preferences</h3>
            <div className={styles.formGroupCheck}>
                <input type="checkbox" id="displayPhone" name="displayPhone" checked={formData.displayPhone} onChange={handleInputChange} />
                <label htmlFor="displayPhone">Display my phone number on my ad</label>
            </div>
            <div className={styles.formGroupCheck}>
                <input type="checkbox" id="displayEmail" name="displayEmail" checked={formData.displayEmail} onChange={handleInputChange} />
                <label htmlFor="displayEmail">Display my email address on my ad</label>
            </div>
            <div className={styles.formGroupCheck}>
                <input type="checkbox" id="displayOnMap" name="displayOnMap" checked={formData.displayOnMap} onChange={handleInputChange} />
                <label htmlFor="displayOnMap">Show my business location on the map (requires full address)</label>
            </div>
          </div>

          {/* --- CONDITIONALLY RENDER IMAGES (Premium Only) --- */}
          {formData.type === 'PREMIUM' && (
            <div className={styles.formSection}>
                <h2>Images</h2>
                <p>Upload up to 5 images for your listing. The first image will be your main cover photo.</p>
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
          )}
          
          <div className={styles.formSection}>
            <h2>Any additional comments for us?</h2>
            <p>This information is for admin review only and will <strong>not</strong> be published on your ad.</p>
            <div className={styles.formGroup}>
              <label htmlFor="adminNotes">Your comments</label>
              <textarea id="adminNotes" name="adminNotes" value={formData.adminNotes} onChange={handleInputChange} rows="4"></textarea>
            </div>
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
  const { domain } = context.params;
  const tenant = await prisma.tenant.findUnique({ where: { domain } });
  if (!tenant) return { notFound: true };
  return { props: { tenant: JSON.parse(JSON.stringify(tenant)) } };
}
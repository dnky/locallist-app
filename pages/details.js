// pages/details.js

import Head from 'next/head';
import dynamic from 'next/dynamic';
import prisma from '../lib/prisma';
import { useRouter } from 'next/router';
import styles from '../styles/DetailsPage.module.css';
import SharedHeader from '../components/SharedHeader';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const DynamicMap = dynamic(() => import('../components/DynamicMap'), {
  ssr: false
});

export default function AdDetailPage({ ad, tenant }) {
  const router = useRouter();
  
  // --- ADD LIGHTBOX STATE ---
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // --- ADD LIGHTBOX HANDLERS ---
  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const showNextImage = (e) => {
    e.stopPropagation(); // Prevent closing lightbox when clicking button
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % ad.images.length);
  };

  const showPrevImage = (e) => {
    e.stopPropagation(); // Prevent closing lightbox when clicking button
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + ad.images.length) % ad.images.length);
  };

  // --- ADD USEEFFECT FOR BODY SCROLL AND KEYBOARD NAV ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') {
        closeLightbox();
      }
      // Only allow arrow navigation if there's more than one image
      if (ad.images && ad.images.length > 1) {
        if (e.key === 'ArrowRight') {
          showNextImage(e);
        }
        if (e.key === 'ArrowLeft') {
          showPrevImage(e);
        }
      }
    };

    if (isLightboxOpen) {
      document.body.classList.add('modal-open');
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup function to remove event listener and body class
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, ad.images]); // Re-run effect if lightbox state or ad data changes

  if (!ad || !tenant) {
    return (
      <main style={{ textAlign: 'center', paddingTop: '20vh' }}>
        <h1>Ad Not Found</h1>
        <p>The ad you are looking for does not exist.</p>
        <Link href="/">Go back to the directory</Link>
      </main>
    );
  }

  const mapAds = [ad];

  return (
    <div className={styles.detailPage}>
      <Head>
        <title>{ad.businessName} - {tenant.title}</title>
      </Head>

      <SharedHeader 
        title={tenant.title} 
        subheading="Your trusted local business directory"
      />

      <main className={styles.detailMainContainer}>
        <div className={styles.stickyHeaderWrapper}>
          <div className={styles.detailHeader}>
            <h1>{ad.businessName}</h1>
          </div>
          <div className={styles.categoryWrapper}>
            {ad.tags && <p className={styles.detailCategory}>{ad.tags.split(',')[0].trim()}</p>}
          </div>
        </div>

        <div className={styles.detailActionsMobile}>
          {ad.phone && (
            <a href={`tel:${ad.phone}`} className={styles.btnActionIcon} aria-label="Call">
              <i className="fa-solid fa-phone"></i>
              <span>Call</span>
            </a>
          )}
          {ad.email && (
            <a href={`mailto:${ad.email}`} className={styles.btnActionIcon} aria-label="Email">
              <i className="fa-solid fa-envelope"></i>
              <span>Email</span>
            </a>
          )}
          {ad.web && (
            <a href={ad.web} target="_blank" rel="noopener noreferrer" className={styles.btnActionIcon} aria-label="Website">
              <i className="fa-solid fa-globe"></i>
              <span>Website</span>
            </a>
          )}
          {ad.lat && ad.lng && (
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${ad.lat},${ad.lng}`} target="_blank" rel="noopener noreferrer" className={styles.btnActionIcon} aria-label="Directions">
              <i className="fa-solid fa-diamond-turn-right"></i>
              <span>Directions</span>
            </a>
          )}
        </div>
        
        <div className={styles.detailContentWrapper}>
          <div className={styles.detailMainContent}>
            {ad.images && ad.images.length > 0 && (
              <div className={styles.photoGallery}>
                {ad.images.map((image, index) => (
                  <img 
                    key={image.id} 
                    src={image.url} 
                    alt={image.altText || `Photo for ${ad.businessName}`} 
                    onClick={() => openLightbox(index)}
                  />
                ))}
              </div>
            )}

            <h2>About {ad.businessName}</h2>
            <p className={styles.detailDescription}>
              {ad.description || 'No description provided.'}
            </p>
            
            {(ad.phone || ad.email || ad.web) && (
              <div className={styles.detailContactInfo}>
                {ad.phone && (
                  <div className={styles.contactRow}>
                    <i className="fa-solid fa-phone"></i>
                    <a href={`tel:${ad.phone}`}>{ad.phone}</a>
                  </div>
                )}
                {ad.email && (
                  <div className={styles.contactRow}>
                    <i className="fa-solid fa-envelope"></i>
                    <a href={`mailto:${ad.email}`}>{ad.email}</a>
                  </div>
                )}
                {ad.web && (
                  <div className={styles.contactRow}>
                    <i className="fa-solid fa-globe"></i>
                    <a href={ad.web} target="_blank" rel="noopener noreferrer">{ad.web}</a>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className={styles.detailSidebar}>
            <div className={styles.sidebarActions}>
              {ad.web && <a href={ad.web} target="_blank" rel="noopener noreferrer" className={`${styles.btnAction} ${styles.btnWebsite}`}><i className="fa-solid fa-globe"></i> Website</a>}
              {ad.phone && <a href={`tel:${ad.phone}`} className={`${styles.btnAction} ${styles.btnPhone}`}><i className="fa-solid fa-phone"></i> Call</a>}
              {ad.email && <a href={`mailto:${ad.email}`} className={`${styles.btnAction} ${styles.btnEmail}`}><i className="fa-solid fa-envelope"></i> Email</a>}
            </div>
            <div className={styles.sidebarMap}>
              {ad.lat && ad.lng ? (
                <DynamicMap 
                  ads={mapAds} 
                  initialZoom={13}
                  scrollWheelZoom={false}
                />
              ) : (
                <div className={styles.mapPlaceholder}>
                  <p>No location provided</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* --- ADD LIGHTBOX MARKUP --- */}
      {isLightboxOpen && ad.images && ad.images.length > 0 && (
        <div className={styles.lightboxOverlay} onClick={closeLightbox}>
          <button className={`${styles.lightboxBtn} ${styles.lightboxClose}`} onClick={closeLightbox} aria-label="Close lightbox">
            &times;
          </button>
          
          {ad.images.length > 1 && (
            <button className={`${styles.lightboxBtn} ${styles.lightboxPrev}`} onClick={showPrevImage} aria-label="Previous image">
              &#10094;
            </button>
          )}

          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <img 
              src={ad.images[currentImageIndex].url} 
              alt={ad.images[currentImageIndex].altText || `Photo for ${ad.businessName}`} 
              className={styles.lightboxImage}
            />
          </div>

          {ad.images.length > 1 && (
            <button className={`${styles.lightboxBtn} ${styles.lightboxNext}`} onClick={showNextImage} aria-label="Next image">
              &#10095;
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ... getServerSideProps remains unchanged
export async function getServerSideProps(context) {
  const { id } = context.query;
  if (!id) {
    return { notFound: true };
  }
  try {
    const ad = await prisma.ad.findUnique({
      where: { id: String(id) },
      include: { 
        tenant: true,
        images: true
      },
    });
    if (!ad) {
      return { notFound: true };
    }
    return {
      props: {
        ad: JSON.parse(JSON.stringify(ad)),
        tenant: JSON.parse(JSON.stringify(ad.tenant)),
      },
    };
  } catch (error) {
    console.error("Failed to fetch ad details:", error);
    return { notFound: true };
  }
}
// pages/[domain]/[slug].js

import Head from 'next/head';
import dynamic from 'next/dynamic';
import prisma from '../../lib/prisma'; 
import { useRouter } from 'next/router';
import styles from '../../styles/DetailsPage.module.css'; 
import SharedHeader from '../../components/SharedHeader'; 
import SharedFooter from '../../components/SharedFooter'; 
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

const DynamicMap = dynamic(() => import('../../components/DynamicMap'), {
  ssr: false
});

export default function AdDetailPage({ ad, tenant }) {
  const router = useRouter();
  
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };
  const closeLightbox = () => setIsLightboxOpen(false);
  const showNextImage = useCallback((e) => {
    e?.stopPropagation(); // Optional chaining just in case
    setCurrentImageIndex((prev) => (prev + 1) % ad.images.length);
  }, [ad]); // Depend on 'ad' (or ad.images)

  const showPrevImage = useCallback((e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + ad.images.length) % ad.images.length);
  }, [ad]);
  const handlePrevClick = () => setVisibleStartIndex((prev) => Math.max(0, prev - 1));
  const handleNextClick = () => setVisibleStartIndex((prev) => Math.min(ad.images.length - 2, prev + 1));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (ad.images?.length > 1) {
        if (e.key === 'ArrowRight') showNextImage(e);
        if (e.key === 'ArrowLeft') showPrevImage(e);
      }
    };
    if (isLightboxOpen) {
      document.body.classList.add('modal-open');
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, ad.images]);

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (!ad || !tenant) {
    return (
      <main style={{ textAlign: 'center', paddingTop: '20vh' }}>
        <h1>Ad Not Found</h1>
        <p>The business you are looking for does not exist.</p>
        <Link href="/">Go back to the directory</Link>
      </main>
    );
  }

  const mapAds = [ad];

  return (
    <div className={styles.detailPage}>
      <Head>
        <title>{`${ad.businessName} - ${tenant.title}`}</title>
      </Head>

      <SharedHeader 
        title={tenant.title} 
        subheading="Your trusted local business directory"
      />

      <main className={styles.detailMainContainer}>
        <div className={styles.stickyHeaderWrapper}>
          <div className={styles.detailHeader}><h1>{ad.businessName}</h1></div>
          <div className={styles.categoryWrapper}>
            {ad.tags && ad.tags.split(',').map(tag => <p key={tag.trim()} className={styles.detailCategory}>{tag.trim()}</p>)}
          </div>
        </div>

        <div className={styles.detailActionsMobile}>
          {ad.phone && ad.displayPhone && <a href={`tel:${ad.phone}`} className={styles.btnActionIcon} aria-label="Call"><i className="fa-solid fa-phone"></i><span>Call</span></a>}
          {ad.email && ad.displayEmail && <a href={`mailto:${ad.email}`} className={styles.btnActionIcon} aria-label="Email"><i className="fa-solid fa-envelope"></i><span>Email</span></a>}
          {ad.web && <a href={ad.web} target="_blank" rel="noopener noreferrer" className={styles.btnActionIcon} aria-label="Website"><i className="fa-solid fa-globe"></i><span>Website</span></a>}
          {ad.lat && ad.lng && ad.displayOnMap && <a href={`https://www.google.com/maps/dir/?api=1&destination=${ad.lat},${ad.lng}`} target="_blank" rel="noopener noreferrer" className={styles.btnActionIcon} aria-label="Directions"><i className="fa-solid fa-diamond-turn-right"></i><span>Directions</span></a>}
        </div>
        
        <div className={styles.detailContentWrapper}>
          <div className={styles.detailMainContent}>
            {ad.images?.length > 0 && (
              <div className={styles.photoGallery}>
                {ad.images.length > 2 && <button className={`${styles.galleryNavBtn} ${styles.prevBtn}`} onClick={handlePrevClick} disabled={visibleStartIndex === 0} aria-label="Previous images">&#10094;</button>}
                <div className={styles.galleryImageContainer}>
                  {ad.images.slice(visibleStartIndex, visibleStartIndex + 2).map((image, index) => <img key={image.id} src={image.url} alt={image.altText || `Photo for ${ad.businessName}`} onClick={() => openLightbox(visibleStartIndex + index)} />)}
                </div>
                {ad.images.length > 2 && <button className={`${styles.galleryNavBtn} ${styles.nextBtn}`} onClick={handleNextClick} disabled={visibleStartIndex >= ad.images.length - 2} aria-label="Next images">&#10095;</button>}
              </div>
            )}
            <h2>About {ad.businessName}</h2>
            <p className={styles.detailDescription}>{ad.description || 'No description provided.'}</p>
            {((ad.phone && ad.displayPhone) || (ad.email && ad.displayEmail) || ad.web) && (
              <div className={styles.detailContactInfo}>
                {ad.phone && ad.displayPhone && <div className={styles.contactRow}><i className="fa-solid fa-phone"></i><a href={`tel:${ad.phone}`}>{ad.phone}</a></div>}
                {ad.email && ad.displayEmail && <div className={styles.contactRow}><i className="fa-solid fa-envelope"></i><a href={`mailto:${ad.email}`}>Email</a></div>}
                {ad.web && <div className={styles.contactRow}><i className="fa-solid fa-globe"></i><a href={ad.web} target="_blank" rel="noopener noreferrer">{ad.web}</a></div>}
              </div>
            )}
          </div>
          <aside className={styles.detailSidebar}>
            <div className={styles.sidebarActions}>
              {ad.web && <a href={ad.web} target="_blank" rel="noopener noreferrer" className={`${styles.btnAction} ${styles.btnWebsite}`}><i className="fa-solid fa-globe"></i> Website</a>}
              {ad.phone && ad.displayPhone && <a href={`tel:${ad.phone}`} className={`${styles.btnAction} ${styles.btnPhone}`}><i className="fa-solid fa-phone"></i> Call</a>}
              {ad.email && ad.displayEmail && <a href={`mailto:${ad.email}`} className={`${styles.btnAction} ${styles.btnEmail}`}><i className="fa-solid fa-envelope"></i> Email</a>}
            </div>
            {ad.lat && ad.lng && ad.displayOnMap && <div className={styles.sidebarMap}><DynamicMap ads={mapAds} initialZoom={13} scrollWheelZoom={false} /></div>}
          </aside>
        </div>
      </main>

      <SharedFooter tenantDomain={tenant.domain} />

      {isLightboxOpen && ad.images?.length > 0 && (
        <div className={styles.lightboxOverlay} onClick={closeLightbox}>
          <button className={`${styles.lightboxBtn} ${styles.lightboxClose}`} onClick={closeLightbox} aria-label="Close lightbox">&times;</button>
          {ad.images.length > 1 && <button className={`${styles.lightboxBtn} ${styles.lightboxPrev}`} onClick={showPrevImage} aria-label="Previous image">&#10094;</button>}
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <img src={ad.images[currentImageIndex].url} alt={ad.images[currentImageIndex].altText || `Photo for ${ad.businessName}`} className={styles.lightboxImage} />
          </div>
          {ad.images.length > 1 && <button className={`${styles.lightboxBtn} ${styles.lightboxNext}`} onClick={showNextImage} aria-label="Next image">&#10095;</button>}
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  const { slug, domain } = context.params;

  try {
    // 1. Fetch Tenant
    const tenant = await prisma.tenant.findUnique({
      where: { domain: domain },
    });
    
    if (!tenant) return { notFound: true };

    // 2. Fetch Ad by Slug
    // We also check tenantId to ensure the slug belongs to this domain
    const ad = await prisma.ad.findFirst({
      where: { 
        slug: slug,
        tenantId: tenant.id 
      },
      include: { tenant: true, images: true },
    });

    // 3. Validation: Exists? Premium?
    if (!ad || ad.type === 'BASIC') {
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
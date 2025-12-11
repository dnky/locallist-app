// components/TenantAdList.js

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
// import Link from 'next/link'; // REMOVED
import styles from '../styles/TenantDirectory.module.css';
import SharedHeader from './SharedHeader';
import SharedFooter from './SharedFooter';
import BasicAdListing from './BasicAdListing';

const DynamicMap = dynamic(() => import('./DynamicMap'), {
  ssr: false
});

export default function TenantAdList({ tenantName, tenantTitle, tenantDomain, ads }) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState('list');
  const [hoveredAdId, setHoveredAdId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAds, setFilteredAds] = useState(ads);
  const isNavigating = useRef(false);
  const filteredAdIds = new Set(filteredAds.map(ad => ad.id));

  const handleListingClick = (e, adId) => {
      let target = e.target;
      while (target && target !== e.currentTarget) {
        if (target.tagName === 'A') {
          return;
        }
        target = target.parentElement;
      }
      // Use window.location to be safe, or just router.push assuming we fix the query issue
      router.push(`/${ads.find(a => a.id === adId)?.slug}`);
    };
  
    useEffect(() => {
      if (router.isReady) {
        setSearchQuery(router.query.q || '');
      }
    }, [router.isReady, router.query.q]);
  
    useEffect(() => {
      const handleRouteChangeStart = () => { isNavigating.current = true; };
      const handleRouteChangeComplete = () => { isNavigating.current = false; };
      router.events.on('routeChangeStart', handleRouteChangeStart);
      router.events.on('routeChangeComplete', handleRouteChangeComplete);
      return () => {
        router.events.off('routeChangeStart', handleRouteChangeStart);
        router.events.off('routeChangeComplete', handleRouteChangeComplete);
      };
    }, [router.events]);
  
    // --- FIXED USE EFFECT ---
    useEffect(() => {
    const handler = setTimeout(() => {
      if (isNavigating.current) return;
      
      // Copy current query params
      const newQuery = { ...router.query };
      
      // ERROR FIX: DO NOT DELETE 'domain' or 'slug'
      // These are required by Next.js to render the current dynamic route.
      // delete newQuery.domain; 
      // delete newQuery.slug;

      if (searchQuery) {
        newQuery.q = searchQuery;
      } else {
        delete newQuery.q;
      }

      // Check if query actually changed to avoid redundant replaces
      if (router.query.q !== newQuery.q) {
        router.replace(
          { pathname: router.pathname, query: newQuery }, 
          undefined, 
          { shallow: true }
        );
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, router]);
  
    useEffect(() => {
      const lowercasedQuery = searchQuery.toLowerCase();
      if (!lowercasedQuery) {
        setFilteredAds(ads);
      } else {
        const results = ads.filter(ad => {
          const nameMatch = ad.businessName?.toLowerCase().includes(lowercasedQuery);
          const tagsMatch = ad.tags?.toLowerCase().includes(lowercasedQuery);
          const descMatch = ad.description?.toLowerCase().includes(lowercasedQuery);
          const phoneMatch = ad.phone?.toLowerCase().includes(lowercasedQuery);
          const emailMatch = ad.email?.toLowerCase().includes(lowercasedQuery);
          const webMatch = ad.web?.toLowerCase().includes(lowercasedQuery);
          return nameMatch || tagsMatch || descMatch || phoneMatch || emailMatch || webMatch;
        });
        setFilteredAds(results);
      }
    }, [searchQuery, ads]);
  
    const listingsContainerClasses = [
      styles.listingsContainer,
      viewMode === 'map' ? styles.mapView : '',
      viewMode === 'map' ? styles.mobileMapView : styles.mobileListView
    ].join(' ');

  return (
    <div className={styles.tenantPage}>
      <Head>
        <title>{tenantTitle}</title>
      </Head>
      
      <SharedHeader 
        title={tenantTitle} 
        subheading="Your trusted local business directory"
        isSticky={true} 
      >
        <div className={styles.searchWrapper}>
          <button
            className={styles.btnMapMobile}
            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
            title="Toggle map view"
          >
            <i className={`fa-solid ${viewMode === 'map' ? 'fa-list' : 'fa-map-location-dot'}`}></i>
          </button>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="button">
              <i className="fa-solid fa-search"></i>
            </button>
          </div>
        </div>
      </SharedHeader>

      <div id="page-content-full-width" className={styles.pageContent}>
        <div className={listingsContainerClasses}>
          <div className={styles.listingsPanel}>
            {searchQuery.length > 0 && (
              <div className={styles.resultsCounter}>
                Showing {filteredAds.length} of {ads.length} businesses
              </div>
            )}
            <div className={styles.businessListings}>
              {filteredAds.map(ad => {
                if (ad.type === 'BASIC') {
                  return (
                    <BasicAdListing 
                      key={ad.id} 
                      ad={ad}
                      onHover={() => setHoveredAdId(ad.id)}
                      onLeave={() => setHoveredAdId(null)}
                    />
                  );
                }

                return (
                  <div
                    key={ad.id}
                    className={styles.businessListing}
                    onMouseEnter={() => setHoveredAdId(ad.id)}
                    onMouseLeave={() => setHoveredAdId(null)}
                    onClick={(e) => handleListingClick(e, ad.id)}
                  >
                    <div className={styles.listingImage}>
                        {/* Use <a> for robustness */}
                        <a href={`/${ad.slug}`}>
                        {(ad.firstImageUrl || ad.logoSrc) && (
                            <img
                            src={ad.firstImageUrl || `/${tenantDomain}/${ad.logoSrc}`}
                            alt={`Image for ${ad.businessName}`}
                            />
                        )}
                        </a>
                    </div>
                    <div className={styles.listingContent}>
                        <h4>
                        {/* Use <a> for robustness */}
                        <a href={`/${ad.slug}`} className={styles.listingTitleLink}>
                            {ad.businessName}
                        </a>
                        </h4>
                        {ad.tags && (
                        <div className={styles.listingCategory}>
                            {ad.tags.split(',').map(tag => (
                            <span key={tag.trim()}>{tag.trim()}</span>
                            ))}
                        </div>
                        )}
                        
                        <div className={styles.listingContactDesktop}>
                        {ad.phone && ad.displayPhone && <a href={`tel:${ad.phone}`}><i className="fa-solid fa-phone"></i> {ad.phone}</a>}
                        {ad.email && ad.displayEmail && <a href={`mailto:${ad.email}`}><i className="fa-solid fa-envelope"></i> Email</a>}
                        {ad.web && <a href={ad.web} target="_blank" rel="noopener noreferrer"><i className="fa-solid fa-globe"></i> Website</a>}
                        </div>
                        {ad.address && <p className={styles.listingAddress}>{ad.address}</p>}
                        {ad.description && <p className={styles.listingDescription}>{ad.description}</p>}
                        
                        <div className={styles.listingContactMobile}>
                        {ad.phone && ad.displayPhone && <a href={`tel:${ad.phone}`} className={styles.contactItem}><i className="fa-solid fa-phone"></i> {ad.phone}</a>}
                        {ad.email && ad.displayEmail && <a href={`mailto:${ad.email}`} className={styles.contactItem}><i className="fa-solid fa-envelope"></i> Email</a>}
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.mapPanel}>
            <DynamicMap
              ads={ads.filter(ad => ad.displayOnMap)}
              filteredAdIds={filteredAdIds}
              searchQuery={searchQuery}
              hoveredAdId={hoveredAdId}
              viewMode={viewMode}
            />
          </div>
        </div>
      </div>
      
      <SharedFooter tenantDomain={tenantDomain} />
    </div>
  );
}
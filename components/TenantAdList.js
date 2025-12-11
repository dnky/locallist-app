// components/TenantAdList.js

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
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
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [filteredAds, setFilteredAds] = useState(ads);
  
  const isNavigating = useRef(false);
  const filteredAdIds = new Set(filteredAds.map(ad => ad.id));

  // Determine if any filter is active
  const isFiltering = searchQuery.length > 0 || selectedTags.length > 0;

  const handleListingClick = (e, adId) => {
      let target = e.target;
      while (target && target !== e.currentTarget) {
        if (target.tagName === 'A' || target.tagName === 'BUTTON') {
          return;
        }
        target = target.parentElement;
      }
      router.push(`/${ads.find(a => a.id === adId)?.slug}`);
    };

    const handleTagClick = (tag) => {
      if (!selectedTags.includes(tag)) {
        setSelectedTags(prev => [...prev, tag]);
      }
    };

    const removeTag = (tagToRemove) => {
      setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
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
  
    useEffect(() => {
      const handler = setTimeout(() => {
        if (isNavigating.current) return;
        const newQuery = { ...router.query };
        if (searchQuery) {
          newQuery.q = searchQuery;
        } else {
          delete newQuery.q;
        }
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
      
      const results = ads.filter(ad => {
        // 1. Text Search Logic
        let matchesSearch = true;
        if (lowercasedQuery) {
          const nameMatch = ad.businessName?.toLowerCase().includes(lowercasedQuery);
          const tagsMatch = ad.tags?.toLowerCase().includes(lowercasedQuery);
          const descMatch = ad.description?.toLowerCase().includes(lowercasedQuery);
          const phoneMatch = ad.phone?.toLowerCase().includes(lowercasedQuery);
          const emailMatch = ad.email?.toLowerCase().includes(lowercasedQuery);
          const webMatch = ad.web?.toLowerCase().includes(lowercasedQuery);
          matchesSearch = nameMatch || tagsMatch || descMatch || phoneMatch || emailMatch || webMatch;
        }

        // 2. Tag Filtering Logic (AND)
        let matchesTags = true;
        if (selectedTags.length > 0) {
          if (!ad.tags) {
            matchesTags = false;
          } else {
            const adTags = ad.tags.split(',').map(t => t.trim().toLowerCase());
            matchesTags = selectedTags.every(selTag => adTags.includes(selTag.toLowerCase()));
          }
        }

        return matchesSearch && matchesTags;
      });

      setFilteredAds(results);
    }, [searchQuery, selectedTags, ads]);
  
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
        <div className={styles.headerControls}>
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

          {selectedTags.length > 0 && (
            <div className={styles.activeTagsWrapper}>
              {selectedTags.map(tag => (
                <button 
                  key={tag} 
                  className={styles.activeTag} 
                  onClick={() => removeTag(tag)}
                  title="Remove filter"
                >
                  {tag} <i className="fa-solid fa-xmark"></i>
                </button>
              ))}
              <button 
                className={styles.clearAllTags} 
                onClick={() => setSelectedTags([])}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </SharedHeader>

      <div id="page-content-full-width" className={styles.pageContent}>
        <div className={listingsContainerClasses}>
          <div className={styles.listingsPanel}>
            {isFiltering && (
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
                      onTagClick={handleTagClick}
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
                        <a href={`/${ad.slug}`} className={styles.listingTitleLink}>
                            {ad.businessName}
                        </a>
                        </h4>
                        
                        {ad.tags && (
                        <div className={styles.listingCategory}>
                            {ad.tags.split(',').map(tag => (
                            <button 
                              key={tag.trim()} 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTagClick(tag.trim());
                              }}
                              className={styles.tagButton}
                            >
                              {tag.trim()}
                            </button>
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
              isFiltering={isFiltering}
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
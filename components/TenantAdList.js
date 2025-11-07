import { useState, useEffect, useRef } from 'react'; // Import useRef
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/TenantDirectory.module.css';
import SharedHeader from './SharedHeader';

const DynamicMap = dynamic(() => import('./DynamicMap'), {
  ssr: false
});

export default function TenantAdList({ tenantName, tenantTitle, tenantDomain, ads }) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState('list');
  const [hoveredAdId, setHoveredAdId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAds, setFilteredAds] = useState(ads);

  // --- FIX: Add a ref to track if navigation is happening ---
  const isNavigating = useRef(false);

  const filteredAdIds = new Set(filteredAds.map(ad => ad.id));

  // Effect to sync state FROM the URL on load/back navigation
  useEffect(() => {
    if (router.isReady) {
      setSearchQuery(router.query.q || '');
    }
  }, [router.isReady, router.query.q]);

  // --- FIX: Listen to router events to prevent race conditions ---
  useEffect(() => {
    const handleRouteChangeStart = () => {
      isNavigating.current = true;
    };
    const handleRouteChangeComplete = () => {
      isNavigating.current = false;
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events]);

  // Effect to sync state TO the URL when user types
  useEffect(() => {
    const handler = setTimeout(() => {
      // --- FIX: Do not update URL if a navigation is already in progress ---
      if (isNavigating.current) {
        return;
      }

      const newQuery = { ...router.query };
      if (searchQuery) {
        newQuery.q = searchQuery;
      } else {
        delete newQuery.q;
      }
      router.replace({ query: newQuery }, undefined, { shallow: true });
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, router]);

  // Effect to filter ads based on search query
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
    <>
      <Head>
        <title>{tenantTitle}</title>
      </Head>

      <div className={styles.tenantPage}>
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

        <div id="page-content-full-width">
          <div className={listingsContainerClasses}>
            <div className={styles.listingsPanel}>
              <div className={styles.container}>
                {searchQuery.length > 0 && (
                  <div className={styles.resultsCounter}>
                    Showing {filteredAds.length} of {ads.length} businesses
                  </div>
                )}

                <div className={styles.businessListings}>
                  {filteredAds.map(ad => (
                    // This structure is correct for linking and styling
                    <Link href={`/details?id=${ad.id}`} key={ad.id} passHref legacyBehavior>
                      <a
                        className={styles.businessListing}
                        onMouseEnter={() => setHoveredAdId(ad.id)}
                        onMouseLeave={() => setHoveredAdId(null)}
                      >
                        <div className={styles.listingImage}>
                          {(ad.firstImageUrl || ad.logoSrc) && (
                            <img
                              src={ad.firstImageUrl || `/${tenantDomain}/${ad.logoSrc}`}
                              alt={`Image for ${ad.businessName}`}
                            />
                          )}
                        </div>
                        <div className={styles.listingContent}>
                          <h4>{ad.businessName}</h4>
                          {ad.tags && <div className={styles.listingCategory}><span>{ad.tags.split(',')[0].trim()}</span></div>}
                          <p>{ad.description || 'Contact this business for more information.'}</p>
                          <div className={styles.listingContactMobile}>
                            {ad.phone && (
                              <div className={styles.contactItem}>
                                <i className="fa-solid fa-phone"></i> {ad.phone}
                              </div>
                            )}
                            {ad.email && (
                              <div className={styles.contactItem}>
                                <i className="fa-solid fa-envelope"></i> {ad.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.mapPanel}>
              <DynamicMap
                ads={ads}
                filteredAdIds={filteredAdIds}
                searchQuery={searchQuery}
                hoveredAdId={hoveredAdId}
                viewMode={viewMode}
              />
            </div>
          </div>
        </div>

        <footer id="footer" className={styles.footer}>
          <div className={styles.copyright}>
            <div className={styles.container}>
              <p>Copyright {new Date().getFullYear()} © {tenantName}. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
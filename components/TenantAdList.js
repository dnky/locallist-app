import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import styles from '../styles/TenantDirectory.module.css';

// Dynamically import the map component with SSR turned off
const DynamicMap = dynamic(() => import('./DynamicMap'), {
  ssr: false
});

export default function TenantAdList({ tenantName, tenantTitle, tenantDomain, ads }) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState('map');
  const [hoveredAdId, setHoveredAdId] = useState(null);

  // --- NEW STATE FOR SEARCH ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAds, setFilteredAds] = useState(ads);
  // ----------------------------

  // --- NEW EFFECT FOR FILTERING ---
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();

    if (!lowercasedQuery) {
      setFilteredAds(ads); // If search is empty, show all ads
    } else {
      const results = ads.filter(ad => {
        // Check if the query exists in any of the specified fields
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
  // ---------------------------------

  const handleListingClick = (adId) => {
    router.push(`/details?id=${adId}`);
  };

  // Helper to combine CSS module class names
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
        <header className={styles.tenantHeader}>
          <div className={styles.container}>
            <div className={styles.headerContent}>
              <Link href="/" className={styles.tenantLogo}>{tenantTitle}</Link>
              <div className={styles.searchWrapper}>
                <button
                  className={styles.btnMapMobile}
                  onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                  title="Toggle map view"
                >
                  <i className={`fa-solid ${viewMode === 'map' ? 'fa-list' : 'fa-map-location-dot'}`}></i>
                </button>
                <div className={styles.searchBar}>
                  {/* MODIFIED INPUT */}
                  <input
                    type="text"
                    placeholder="Search businesses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="button"> {/* Changed from submit to button */}
                    <i className="fa-solid fa-search"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div id="page-content-full-width">
          <div className={listingsContainerClasses}>
            <div className={styles.listingsPanel}>
              <div className={styles.container}>
                {/* NEW: RESULTS COUNTER */}
                <div className={styles.resultsCounter}>
                  Showing {filteredAds.length} of {ads.length} businesses
                </div>

                <div className={styles.businessListings}>
                  {/* MODIFIED: Use filteredAds to render the list */}
                  {filteredAds.map(ad => (
                    <div
                      className={styles.businessListing}
                      key={ad.id}
                      onMouseEnter={() => setHoveredAdId(ad.id)}
                      onMouseLeave={() => setHoveredAdId(null)}
                      onClick={() => handleListingClick(ad.id)}
                    >
                      <div className={styles.listingImage}>
                        <img
                          src={ad.logoSrc ? `/${tenantDomain}/${ad.logoSrc}` : 'https://via.placeholder.com/80'}
                          alt={`${ad.businessName} logo`}
                        />
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
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.mapPanel}>
              {/* MODIFIED: Pass filteredAds to the map */}
              <DynamicMap ads={filteredAds} hoveredAdId={hoveredAdId} viewMode={viewMode}/>
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
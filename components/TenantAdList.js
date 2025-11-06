import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router'; // <-- 1. IMPORT useRouter

// Dynamically import the map component with SSR turned off
const DynamicMap = dynamic(() => import('./DynamicMap'), {
  ssr: false
});

export default function TenantAdList({ tenantName, tenantTitle, tenantDomain, ads }) {
  console.log("[CLIENT_RECEIVED_PROPS] Ads received on initial load:", ads);
  
  const router = useRouter(); // <-- 2. INITIALIZE the router
  const [viewMode, setViewMode] = useState('map');
  const [hoveredAdId, setHoveredAdId] = useState(null);
  const adsToDisplay = ads;

  // --- 3. CREATE a navigation handler ---
  const handleListingClick = (adId) => {
    router.push(`/details?id=${adId}`);
  };

  return (
    <>
      <Head>
        <title>{tenantTitle}</title>
      </Head>

      <div id="main-wrapper">
        <header className="tenant-header">
          {/* ...header code is unchanged... */}
          <div className="container">
            <div className="header-content">
              <Link href="/" className="tenant-logo">{tenantTitle}</Link>
              <div className="search-wrapper">
                <button
                  className="btn-map-mobile"
                  onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                  title="Toggle map view"
                >
                  <i className={`fa-solid ${viewMode === 'map' ? 'fa-list' : 'fa-map-location-dot'}`}></i>
                </button>
                <div className="search-bar">
                  <input type="text" placeholder="Search businesses..." />
                  <button type="submit">
                    <i className="fa-solid fa-search"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div id="page-content-full-width">
          <div className={`listings-container ${viewMode === 'map' ? 'map-view' : ''} ${viewMode === 'map' ? 'mobile-map-view' : 'mobile-list-view'}`}>
            <div className="listings-panel">
              <div className="container">
                <div className="business-listings">
                  {adsToDisplay.map(ad => (
                    // --- 4. MODIFIED: Add onClick for navigation ---
                    <div
                      className="business-listing"
                      key={ad.id}
                      onMouseEnter={() => setHoveredAdId(ad.id)}
                      onMouseLeave={() => setHoveredAdId(null)}
                      onClick={() => handleListingClick(ad.id)} // This makes the whole div clickable
                    >
                      <div className="listing-image">
                        <img
                          src={ad.logoSrc ? `/${tenantDomain}/${ad.logoSrc}` : 'https://via.placeholder.com/80'}
                          alt={`${ad.businessName} logo`}
                        />
                      </div>
                      <div className="listing-content">
                        <h4>
                          {/* The Link component is removed here to avoid nested links.
                              The parent div's onClick handles navigation now. */}
                          {ad.businessName}
                        </h4>
                        {ad.tags && <div className="listing-category"><span>{ad.tags.split(',')[0].trim()}</span></div>}
                        <p>{ad.description || 'Contact this business for more information.'}</p>
                        
                        {/* --- 5. MODIFIED: Removed links from mobile contact info --- */}
                        <div className="listing-contact-mobile">
                          {ad.phone && (
                            <div className="contact-item"> {/* Changed from <a> to <div> */}
                              <i className="fa-solid fa-phone"></i> {ad.phone}
                            </div>
                          )}
                          {ad.email && (
                            <div className="contact-item"> {/* Changed from <a> to <div> */}
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

            <div className="map-panel">
              <DynamicMap ads={adsToDisplay} hoveredAdId={hoveredAdId} viewMode={viewMode}/>
            </div>
          </div>
        </div>

        <footer id="footer">
          {/* ...footer code is unchanged... */}
          <div className="copyright">
            <div className="container">
              <p>Copyright {new Date().getFullYear()} © {tenantName}. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
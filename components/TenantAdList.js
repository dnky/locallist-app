import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic'; // <-- Import dynamic

// Dynamically import the map component with SSR turned off
const DynamicMap = dynamic(() => import('./DynamicMap'), {
  ssr: false
});

export default function TenantAdList({ tenantName, tenantTitle, tenantDomain, ads }) {
  console.log("[CLIENT_RECEIVED_PROPS] Ads received on initial load:", ads);
  
  const [viewMode, setViewMode] = useState('map');
  const [hoveredAdId, setHoveredAdId] = useState(null);
  const adsToDisplay = ads;

  return (
    <>
      <Head>
        <title>{tenantTitle}</title>
      </Head>

      <div id="main-wrapper">
        <header className="tenant-header">
          <div className="container">
            <div className="header-content">
              <Link href="/" className="tenant-logo">{tenantTitle}</Link>
              <div className="search-wrapper">
                <button
                  className="btn-map-mobile"
                  onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                  title="Toggle map view"
                >
                  {/* --- ICON CHANGES BASED ON VIEWMODE --- */}
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
          {/* --- ADD NEW CLASS FOR MOBILE VIEW TOGGLING --- */}
          <div className={`listings-container ${viewMode === 'map' ? 'map-view' : ''} ${viewMode === 'map' ? 'mobile-map-view' : 'mobile-list-view'}`}>
            <div className="listings-panel">
              <div className="container">
                <div className="business-listings">
                  {adsToDisplay.map(ad => (
                    // The outer div is no longer a link itself
                    <div
                      className="business-listing"
                      key={ad.id}
                      onMouseEnter={() => setHoveredAdId(ad.id)}
                      onMouseLeave={() => setHoveredAdId(null)}
                    >
                      <div className="listing-image">
                        <img
                          src={ad.logoSrc ? `/${tenantDomain}/${ad.logoSrc}` : 'https://via.placeholder.com/80'}
                          alt={`${ad.businessName} logo`}
                        />
                      </div>
                      <div className="listing-content">
                        {/* The business name is now the primary link to the detail page */}
                        <h4>
                          <Link href={`/details?id=${ad.id}`}>
                            {ad.businessName}
                          </Link>
                        </h4>
                        {ad.tags && <div className="listing-category"><span>{ad.tags.split(',')[0].trim()}</span></div>}
                        <p>{ad.description || 'Contact this business for more information.'}</p>
                        <div className="listing-contact-mobile">
                          {ad.phone && (<a href={`tel:${ad.phone}`}><i className="fa-solid fa-phone"></i> {ad.phone}</a>)}
                          {ad.email && (<a href={`mailto:${ad.email}`}><i className="fa-solid fa-envelope"></i> {ad.email}</a>)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="map-panel">
              <DynamicMap ads={adsToDisplay} hoveredAdId={hoveredAdId} />
            </div>
          </div>
        </div>

        <footer id="footer">
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
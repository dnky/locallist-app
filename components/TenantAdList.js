import { useState } from 'react';
import Head from 'next/head';

export default function TenantAdList({ tenantName, tenantTitle, tenantDomain, ads }) {
  // Change the initial state from 'list' to 'map'
  const [viewMode, setViewMode] = useState('map');
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
              <a href="/" className="tenant-logo">{tenantTitle}</a>
              <div className="search-wrapper">
                <button
                  className="btn-map-mobile"
                  onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                  title="Toggle map view"
                >
                  <i className="fa-solid fa-map-location-dot"></i>
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
          <div className={`listings-container ${viewMode === 'map' ? 'map-view' : ''}`}>
            <div className="listings-panel">
              <div className="container">
                <div className="business-listings">
                  {adsToDisplay.map(ad => (
                    <a href={ad.web || '#'} target="_blank" rel="noopener noreferrer" className="business-listing" key={ad.id}>
                      <div className="listing-image">
                        <img
                          src={ad.logoSrc ? `/${tenantDomain}/${ad.logoSrc}` : 'https://via.placeholder.com/80'}
                          alt={`${ad.businessName} logo`}
                        />
                      </div>
                      <div className="listing-content">
                        <h4>{ad.businessName}</h4>
                        {/* This category will be hidden on mobile via CSS */}
                        {ad.tags && <div className="listing-category"><span>{ad.tags.split(',')[0].trim()}</span></div>}
                        {/* This description will be hidden on mobile via CSS */}
                        <p>{ad.description || 'Contact this business for more information.'}</p>

                        {/* ======================= NEW MOBILE CONTACT INFO ======================= */}
                        <div className="listing-contact-mobile">
                          {ad.phone && (
                            <a href={`tel:${ad.phone}`} onClick={(e) => e.stopPropagation()}>
                              <i className="fa-solid fa-phone"></i> {ad.phone}
                            </a>
                          )}
                          {ad.email && (
                            <a href={`mailto:${ad.email}`} onClick={(e) => e.stopPropagation()}>
                              <i className="fa-solid fa-envelope"></i> {ad.email}
                            </a>
                          )}
                        </div>
                        {/* =================================================================== */}

                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {viewMode === 'map' && (
              <div className="map-panel">
                <div className="map-placeholder">
                  <i className="fa-solid fa-map"></i>
                  <p>Map would be displayed here</p>
                </div>
              </div>
            )}
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
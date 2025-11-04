import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

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
              <Link href="/" className="tenant-logo">{tenantTitle}</Link>
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
                    // ======================= CHANGE #1: Outer <a> becomes a <div> =======================
                    <div className="business-listing" key={ad.id}>
                      {/* --- NEW Invisible Overlay Link --- */}
                      <a href={ad.web || '#'} target="_blank" rel="noopener noreferrer" className="card-link">
                        <span className="sr-only">Visit {ad.businessName}</span>
                      </a>
                      {/* ---------------------------------- */}
                      
                      <div className="listing-image">
                        <img
                          src={ad.logoSrc ? `/${tenantDomain}/${ad.logoSrc}` : 'https://via.placeholder.com/80'}
                          alt={`${ad.businessName} logo`}
                        />
                      </div>
                      <div className="listing-content">
                        <h4>{ad.businessName}</h4>
                        {ad.tags && <div className="listing-category"><span>{ad.tags.split(',')[0].trim()}</span></div>}
                        <p>{ad.description || 'Contact this business for more information.'}</p>
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
                      </div>
                    </div>
                    // ====================================================================================
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
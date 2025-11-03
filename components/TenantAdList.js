import { useState } from 'react';
import Head from 'next/head';

export default function TenantAdList({ tenantName, tenantTitle, tenantDomain, ads, categories }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const filteredAds = selectedCategory === 'All'
    ? ads
    : ads.filter(ad => ad.tags && ad.tags.split(',').map(t => t.trim()).includes(selectedCategory));

  return (
    <>
      <Head>
        <title>{tenantTitle}</title> {/* <-- USE NEW TITLE */}
      </Head>

      <div id="main-wrapper">
        <header id="header">
          <div className="header-search slider-home">
            <div className="slider-content" style={{ height: '200px' }}>
              <div className="slider-static-background">
                <div className="slider-text-layer">
                  {/* USE THE NEW DYNAMIC TITLE HERE */}
                  <h1 style={{ margin: 0 }}><span>{tenantTitle}</span></h1>
                  <h2 style={{ margin: '20px' }}>Local business directory</h2>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div id="page-content" className="home-slider-content">
          <div className="container">
            <div className="home-with-slide">
              <div className="row">
                <div className="col-md-3 category-toggle">
                  <div className="page-sidebar" style={{ display: isSidebarVisible ? 'block' : '' }}>
                    <div id="categories" style={{ marginTop: 0 }}>
                      <div className="accordion">
                        <ul className="nav nav-tabs home-tab" role="tablist">
                          <li className={selectedCategory === 'All' ? 'active' : ''}>
                            <a href="#" onClick={(e) => { e.preventDefault(); setSelectedCategory('All'); }}>
                              All Categories<span>Display all listings</span>
                            </a>
                          </li>
                          {categories.map(category => (
                            <li key={category} className={selectedCategory === category ? 'active' : ''}>
                              <a href="#" onClick={(e) => { e.preventDefault(); setSelectedCategory(category); }}>
                                {category}<span>Filter by {category}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-9">
                  <div className="page-content">
                    <div className="product-details">
                      <div className="tab-content">
                        <div className="tab-pane active" id="all-categories">
                          <div className="listings-header">
                            <h3>Local <span>Business Listings</span></h3>
                            <div className="view-toggle-buttons">
                              <button
                                id="filter-toggle-btn"
                                className="btn btn-default filter-btn"
                                type="button"
                                onClick={() => setSidebarVisible(!isSidebarVisible)}
                              >
                                <i className="fa-solid fa-filter"></i> Filter
                              </button>
                            </div>
                          </div>
                          <div className="business-listings">
                            {filteredAds.map(ad => (
                              <a href={ad.web || '#'} target="_blank" rel="noopener noreferrer" className="business-listing" key={ad.id}>
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
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
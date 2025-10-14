import { useState } from 'react';
import { PrismaClient } from '@prisma/client';

// --- The Main Page Component ---
export default function TenantPage({ ads, tenantName }) {
  // --- State for the Modal ---
  const [modalData, setModalData] = useState(null);

  const openModal = (ad) => setModalData(ad);
  const closeModal = () => setModalData(null);
  
  return (
    <>
      <main>
        <h1>{tenantName}</h1>
        <p>Click any ad to see more details.</p>

        {/* The Ad Grid */}
        <div className="wrapper" id="grid-wrapper">
          {ads.map(ad => (
            <div 
              key={ad.id} 
              className={`item w${ad.grid_w} h${ad.grid_h}`}
              onClick={() => openModal(ad)}
            >
              <img src={`/${ad.imageSrc}`} alt={`Ad for ${ad.businessName}`} />
            </div>
          ))}
        </div>
      </main>

      {/* The Modal */}
      {modalData && (
        <div className="modal-overlay active" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>&times;</button>
            {modalData.logoSrc && (
               <img src={`/${modalData.logoSrc}`} alt={`${modalData.businessName} Logo`} className="modal-image" />
            )}
            <h2>{modalData.businessName}</h2>
            <div className="modal-contact-info">
              {modalData.phone && <a href={`tel:${modalData.phone}`}>Call: {modalData.phone}</a>}
              {modalData.email && <a href={`mailto:${modalData.email}`}>Email: {modalData.email}</a>}
              {modalData.web && <a href={modalData.web} target="_blank" rel="noopener noreferrer">Visit Website</a>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- This function runs ON THE SERVER for every request ---
export async function getServerSideProps(context) {
  const prisma = new PrismaClient();
  const host = context.req.headers.host; // e.g., 'somerset-ads.co.uk'

  // 1. Find the tenant based on the domain
  const tenant = await prisma.tenant.findUnique({
    where: { domain: host },
  });

  // 2. If no tenant is found, show a 404 page
  if (!tenant) {
    return { notFound: true };
  }

  // 3. If tenant is found, get all their ads
  const ads = await prisma.ad.findMany({
    where: { tenantId: tenant.id },
  });

  // 4. Pass the ads and tenant name to the page component as props
  // We must stringify and parse to avoid issues with date objects
  return {
    props: {
      ads: JSON.parse(JSON.stringify(ads)),
      tenantName: tenant.name,
    },
  };
}
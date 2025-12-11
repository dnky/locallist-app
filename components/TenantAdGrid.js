import { useState } from 'react';

export default function TenantAdGrid({ ads, tenantName, tenantDomain }) {
  const [modalData, setModalData] = useState(null);

  const openModal = (ad) => setModalData(ad);
  const closeModal = () => setModalData(null);

  return (
    <>
      <main className={modalData ? 'blurred' : ''}>
        <h1>{tenantName}</h1>
        <p>Click any ad to see more details.</p>

        <div className="wrapper" id="grid-wrapper">
          {ads.map(ad => (
            <div
              key={ad.id}
              className={`item w${ad.grid_w} h${ad.grid_h}`}
              onClick={() => openModal(ad)}
            >
              <img src={`/${tenantDomain}/${ad.imageSrc}`} alt={`Ad for ${ad.businessName}`} />
            </div>
          ))}
        </div>
      </main>

      {modalData && (
        <div className="modal-overlay active" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>&times;</button>
            {modalData.logoSrc && (
               <img src={`/${tenantDomain}/${modalData.logoSrc}`} alt={`${modalData.businessName} Logo`} className="modal-image" />
            )}
            <h2>{modalData.businessName}</h2>
            <div className="modal-contact-info">
              {modalData.phone && <a href={`tel:${modalData.phone}`}>Call: {modalData.phone}</a>}
              {modalData.email && <a href={`mailto:${modalData.email}`}>Email</a>}
              {modalData.web && <a href={modalData.web} target="_blank" rel="noopener noreferrer">Visit Website</a>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
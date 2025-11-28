// components/BasicAdListing.js
import styles from '../styles/BasicAdListing.module.css';

export default function BasicAdListing({ ad, onHover, onLeave }) {
  // Parse tags if they exist
  const tagList = ad.tags ? ad.tags.split(',').map(t => t.trim()) : [];

  return (
    <div 
      className={styles.container}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className={styles.header}>
        <h4 className={styles.businessName}>{ad.businessName}</h4>
        {tagList.length > 0 && (
          <span className={styles.tags}>{tagList[0]}</span>
        )}
      </div>

      <div className={styles.contactRow}>
        {ad.phone && ad.displayPhone && (
          <a href={`tel:${ad.phone}`} className={styles.contactItem}>
            <i className="fa-solid fa-phone"></i> {ad.phone}
          </a>
        )}
        
        {ad.email && ad.displayEmail && (
          <a href={`mailto:${ad.email}`} className={styles.contactItem}>
            <i className="fa-solid fa-envelope"></i> {ad.email}
          </a>
        )}

        {ad.web && (
          <a href={ad.web} target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
             <i className="fa-solid fa-globe"></i> Website
          </a>
        )}
      </div>
    </div>
  );
}
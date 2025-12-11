// components/BasicAdListing.js
import styles from '../styles/BasicAdListing.module.css';

export default function BasicAdListing({ ad, onHover, onLeave, onTagClick }) {
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
          <div className={styles.tagsWrapper}>
            {tagList.map((tag, index) => (
              <button 
                key={index} 
                className={styles.tags}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent bubbling
                  onTagClick(tag);
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

      </div>

      <div className={styles.contactRow}>
        {/* ... existing contact code ... */}
        {ad.phone && ad.displayPhone && (
          <a href={`tel:${ad.phone}`} className={styles.contactItem}>
            <i className="fa-solid fa-phone"></i> {ad.phone}
          </a>
        )}
        
        {ad.email && ad.displayEmail && (
          <a href={`mailto:${ad.email}`} className={styles.contactItem}>
            <i className="fa-solid fa-envelope"></i> Email
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
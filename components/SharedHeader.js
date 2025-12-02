import styles from '../styles/TenantDirectory.module.css';

export default function SharedHeader({ title, subheading, children, isSticky }) {
  // Combine base class with sticky class only if isSticky is true
  const headerClasses = `${styles.tenantHeader} ${isSticky ? styles.sticky : ''}`;

  return (
    <header className={headerClasses}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <div className={styles.titleContainer}>
            <a href="/" className={styles.tenantLogo}>{title}</a>
            {subheading && <p className={styles.headerSubheading}>{subheading}</p>}
          </div>
          {children}
        </div>
      </div>
    </header>
  );
}
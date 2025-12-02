// components/SharedFooter.js

import styles from '../styles/SharedFooter.module.css';

export default function SharedFooter({ tenantDomain }) {
  return (
    <footer className={styles.footer}>
      {/* Changed from <Link> to <a> */}
      <a href={`/${tenantDomain}/signup`} className={styles.signupLink}>
        Click here to add your business
      </a>
    </footer>
  );
}
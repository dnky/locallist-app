// components/SharedFooter.js

import Link from 'next/link';
import styles from '../styles/SharedFooter.module.css';

export default function SharedFooter({ tenantDomain }) {
  // This component no longer needs state or scroll detection.
  // It's a simple, presentational component.
  return (
    <footer className={styles.footer}>
      <Link href={`/${tenantDomain}/signup`} className={styles.signupLink}>
        Click here to add your business
      </Link>
    </footer>
  );
}
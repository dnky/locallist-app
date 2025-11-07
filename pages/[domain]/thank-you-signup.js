import Head from 'next/head';
import Link from 'next/link';
import prisma from '../../lib/prisma';
import SharedHeader from '../../components/SharedHeader';
import styles from '../../styles/SignupPage.module.css';

export default function ThankYouSignupPage({ tenant }) {
  return (
    <div className={styles.signupPage}>
      <Head>
        <title>Thank You! - {tenant.title}</title>
      </Head>
      <SharedHeader title={tenant.title} />
      <main className={`${styles.container} ${styles.thankYouContainer}`}>
        <h1>Submission Received!</h1>
        <p>Thank you for submitting your business details. Our team will review your submission shortly.</p>
        <p>If approved, your listing will appear in the directory within 24-48 hours.</p>
        <Link href={`/`} className={styles.submitBtn}>
          Back to Directory
        </Link>
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { domain } = context.params;
  const tenant = await prisma.tenant.findUnique({
    where: { domain },
  });

  if (!tenant) {
    return { notFound: true };
  }

  return {
    props: {
      tenant: JSON.parse(JSON.stringify(tenant)),
    },
  };
}
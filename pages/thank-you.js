import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <main style={{ textAlign: 'center', paddingTop: '20vh', padding: '1rem' }}>
      <h1>Thank You!</h1>
      <p>Your inquiry has been sent. We will get back to you shortly.</p>
      <Link href="/">
        <a style={{ textDecoration: 'underline' }}>Go back to the homepage</a>
      </Link>
    </main>
  );
}
import '../styles/globals.css';

function MyApp({ Component, pageProps, router }) {
  let pageClass = '';

  if (router.pathname === '/landing') {
    pageClass = 'landing-page-style';
  } else if (
    router.pathname === '/' ||
    router.pathname.startsWith('/[') ||
    router.pathname.startsWith('/details') // <-- ADD THIS CONDITION
  ) {
    pageClass = 'tenant-page-style';
  }

  return <Component {...pageProps} pageClass={pageClass} />;
}

export default MyApp;
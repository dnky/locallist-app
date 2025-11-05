import '../styles/globals.css';
import 'leaflet/dist/leaflet.css';

function MyApp({ Component, pageProps, router }) {
  let pageClass = '';

  if (router.pathname === '/landing') {
    pageClass = 'landing-page-style';
  } else if (router.pathname === '/' || router.pathname.startsWith('/[')) {
    // Catches the index page and dynamic [domain] page
    pageClass = 'tenant-page-style';
  }

  // Pass the determined class as a prop to every page
  return <Component {...pageProps} pageClass={pageClass} />;
}

export default MyApp;
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  // The pageClass logic is no longer needed.
  // Styles are now imported and scoped directly within each component/page.
  return <Component {...pageProps} />;
}

export default MyApp;
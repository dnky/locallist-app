import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import prisma from '../lib/prisma';

const DynamicMap = dynamic(() => import('../components/DynamicMap'), {
  ssr: false
});

// 1. Change the function signature to accept all props
export default function AdDetailPage(props) {
  // 2. Destructure the props inside the component
  const { pageClass, ad, tenant } = props;

  if (!ad || !tenant) {
    // A more robust check
    return (
      <div className={pageClass}>
        <main style={{ textAlign: 'center', paddingTop: '20vh' }}>
          <h1>Ad Not Found</h1>
          <p>The ad you are looking for does not exist.</p>
          <Link href="/">Go back to the directory</Link>
        </main>
      </div>
    );
  }

  const mapAds = [ad];

  return (
    // 3. Wrap everything in a div with the pageClass
    <div className={pageClass}>
      <Head>
        <title>{ad.businessName} - {tenant.title}</title>
      </Head>

      <div className="ad-detail-page">
        <header className="tenant-header">
          <div className="container">
            <div className="header-content">
              <Link href="/" className="tenant-logo">{tenant.title}</Link>
            </div>
          </div>
        </header>

        <main className="detail-main-container">
          <div className="detail-header">
            <h1>{ad.businessName}</h1>
            {ad.tags && <p className="detail-category">{ad.tags.split(',')[0].trim()}</p>}
          </div>

          <div className="photo-gallery-placeholder">
            <i className="fa-solid fa-camera"></i>
            <span>Photo Gallery Coming Soon</span>
          </div>
          
          <div className="detail-content-wrapper">
            <div className="detail-main-content">
              <h2>About {ad.businessName}</h2>
              <p className="detail-description">
                {ad.description || 'No description provided.'}
              </p>
            </div>

            <aside className="detail-sidebar">
              <div className="sidebar-actions">
                {ad.web && <a href={ad.web} target="_blank" rel="noopener noreferrer" className="btn-action btn-website"><i className="fa-solid fa-globe"></i> Website</a>}
                {ad.phone && <a href={`tel:${ad.phone}`} className="btn-action btn-phone"><i className="fa-solid fa-phone"></i> Call</a>}
                {ad.email && <a href={`mailto:${ad.email}`} className="btn-action btn-email"><i className="fa-solid fa-envelope"></i> Email</a>}
              </div>
              <div className="sidebar-map">
                {ad.lat && ad.lng ? (
                  <DynamicMap ads={mapAds} />
                ) : (
                  <div className="map-placeholder">
                    <p>No location provided</p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}


// The getServerSideProps function does not need to change
export async function getServerSideProps(context) {
  const { id } = context.query;

  if (!id) {
    return { notFound: true };
  }

  try {
    const ad = await prisma.ad.findUnique({
      where: { id: String(id) },
      include: {
        tenant: true,
      },
    });

    if (!ad) {
      return { notFound: true };
    }

    return {
      props: {
        ad: JSON.parse(JSON.stringify(ad)),
        tenant: JSON.parse(JSON.stringify(ad.tenant)),
      },
    };
  } catch (error) {
    console.error("Failed to fetch ad details:", error);
    return { notFound: true };
  }
}
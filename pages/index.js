import TenantAdList from '../components/TenantAdList';
import prisma from '../lib/prisma';

export default function IndexPage(props) {
  // The pageClass wrapper is gone. This component now just renders the correct
  // view based on whether there's an error or not.
  return (
    <>
      {props.error ? (
        <main style={{ textAlign: 'center', paddingTop: '20vh' }}>
          <h1>An Error Occurred</h1>
          <p>{props.error}</p>
        </main>
      ) : (
        <TenantAdList {...props} />
      )}
    </>
  );
}

// ... getServerSideProps is updated
export async function getServerSideProps(context) {
  const host = context.req.headers.host; 
  console.log(`[SERVER LOG] Request for host: ${host}`);

  try {
    const tenant = await prisma.tenant.findUnique({ where: { domain: host } });
    if (!tenant) {
      console.log(`[SERVER LOG] Tenant not found for host: ${host}`);
      return { notFound: true };
    }

    const adsFromDb = await prisma.ad.findMany({
      where: { tenantId: tenant.id },
      include: {
        images: {
          take: 1,
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    
    // --- THIS IS THE FIX ---
    // We destructure 'images' out of the ad object and spread the 'rest'
    const serializableAds = JSON.parse(JSON.stringify(adsFromDb)).map(ad => {
      const { images, ...restOfAd } = ad;
      return {
        ...restOfAd,
        lat: ad.lat ? parseFloat(ad.lat) : null,
        lng: ad.lng ? parseFloat(ad.lng) : null,
        firstImageUrl: images && images.length > 0 ? images[0].url : null,
      };
    });
    // ----------------------

    return {
      props: {
        ads: serializableAds,
        tenantName: tenant.name,
        tenantTitle: tenant.title,
        tenantDomain: tenant.domain,
      },
    };
  } catch (error) {
    console.error("[SERVER ERROR] Failed to fetch data for index:", error);
    return {
      props: {
        error: "Could not connect to the database."
      }
    };
  }
}
import TenantAdList from '../components/TenantAdList';
import prisma from '../lib/prisma';

export default function DomainPage(props) {
  // This page is also simplified, removing the pageClass wrapper.
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
  const { domain } = context.params;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { domain: domain },
    });

    if (!tenant) {
      return { notFound: true };
    }

    const adsFromDb = await prisma.ad.findMany({
      where: {
        tenant: {
          domain: domain,
        },
        isActive: true, // <-- IMPORTANT: Only show active ads
      },
      include: {
        tenant: true,
        images: {
          take: 1,
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: [
        { type: 'desc' },       // PREMIUM first
        { businessName: 'asc' } // Then alphabetical
      ]
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

    const allTags = new Set();
    adsFromDb.forEach(ad => {
      if (ad.tags) {
        ad.tags.split(",").forEach(tag => allTags.add(tag.trim()));
      }
    });
    const categories = Array.from(allTags).sort();

    return {
      props: {
        ads: serializableAds,
        tenantName: tenant.name,
        tenantTitle: tenant.title,
        tenantDomain: tenant.domain,
      },
    };
  } catch (error) {
    console.error("Failed to fetch data for [domain]:", error);
    return {
      props: {
        error: "Could not connect to the database.",
      },
    };
  }
}
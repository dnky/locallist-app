import TenantAdList from '../components/TenantAdList';
import prisma from '../lib/prisma';

export default function IndexPage(props) {
  const { pageClass, ...rest } = props;

  return (
    <div className={pageClass}>
      {props.error ? (
        <main style={{ textAlign: 'center', paddingTop: '20vh' }}>
          <h1>An Error Occurred</h1>
          <p>{props.error}</p>
        </main>
      ) : (
        <TenantAdList {...rest} />
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  const host = context.req.headers.host; 

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { domain: host },
    });

    if (!tenant) {
      return { notFound: true };
    }

    const ads = await prisma.ad.findMany({
      where: { tenantId: tenant.id },
    });

    // ======================= THE FIX =======================
    // Manually map the array to create clean, serializable objects.
    // This explicitly converts lat/lng to numbers (or null if they don't exist).
    const serializableAds = ads.map(ad => ({
      id: ad.id,
      tenantId: ad.tenantId,
      businessName: ad.businessName,
      description: ad.description,
      imageSrc: ad.imageSrc,
      logoSrc: ad.logoSrc,
      phone: ad.phone,
      email: ad.email,
      web: ad.web,
      tags: ad.tags,
      // Ensure lat/lng are numbers or null
      lat: ad.lat ? parseFloat(ad.lat) : null,
      lng: ad.lng ? parseFloat(ad.lng) : null,
    }));

    const allTags = new Set();
    ads.forEach(ad => {
      if (ad.tags) {
        ad.tags.split(',').forEach(tag => allTags.add(tag.trim()));
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
  } catch (error)
   {
    console.error("Failed to fetch data for index:", error);
    return {
      props: {
        error: "Could not connect to the database."
      }
    };
  }
}
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


// ... getServerSideProps remains unchanged
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
      },
      include: {
        tenant: true,
      },
    });
    
    const plainAds = JSON.parse(JSON.stringify(adsFromDb));

    const serializableAds = plainAds.map(ad => ({
      ...ad,
      lat: ad.lat ? parseFloat(ad.lat) : null,
      lng: ad.lng ? parseFloat(ad.lng) : null,
    }));

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
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

    // ======================= THE ROBUST FIX =======================
    // Step 1: Force all data into a plain, JSON-safe format.
    const plainAds = JSON.parse(JSON.stringify(ads));

    // Step 2: Now that we have plain objects, map over them
    // to explicitly convert the string coordinates into numbers.
    const serializableAds = plainAds.map(ad => ({
      ...ad, // Keep all other properties
      lat: ad.lat ? parseFloat(ad.lat) : null,
      lng: ad.lng ? parseFloat(ad.lng) : null,
    }));
    // =============================================================

    const allTags = new Set();
    ads.forEach(ad => {
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
    console.error("Failed to fetch data for index:", error);
    return {
      props: {
        error: "Could not connect to the database.",
      },
    };
  }
}
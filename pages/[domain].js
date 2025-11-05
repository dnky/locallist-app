import TenantAdList from '../components/TenantAdList';
import prisma from '../lib/prisma';

export default function DomainPage(props) {
  // 1. Destructure the pageClass prop, just like in index.js
  const { pageClass, ...rest } = props;

  return (
    // 2. Wrap the entire output in a div with the pageClass
    <div className={pageClass}>
      {props.error ? (
        <main style={{ textAlign: 'center', paddingTop: '20vh' }}>
          <h1>An Error Occurred</h1>
          <p>{props.error}</p>
        </main>
      ) : (
        // 3. Pass the rest of the props down to the component
        <TenantAdList {...rest} />
      )}
    </div>
  );
}

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

    // ======================= THE ROBUST FIX =======================
    // Step 1: Force all data into a plain, JSON-safe format. This converts
    // any special objects (like Decimal) from Prisma into simple strings.
    const plainAds = JSON.parse(JSON.stringify(adsFromDb));

    // Step 2: Now that we're guaranteed to have plain objects, map over them
    // to explicitly convert the string coordinates into numbers.
    const serializableAds = plainAds.map(ad => ({
      ...ad, // Keep all other properties from the plain ad object
      lat: ad.lat ? parseFloat(ad.lat) : null,
      lng: ad.lng ? parseFloat(ad.lng) : null,
    }));
    // =============================================================

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
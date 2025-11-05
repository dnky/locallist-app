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

// getServerSideProps does not need to change
export async function getServerSideProps(context) {
  const { domain } = context.params;

  try {
    console.log(`[DEBUG_STEP_1] Attempting to fetch ads for domain: ${domain}`);

    const tenant = await prisma.tenant.findUnique({
      where: { domain: domain },
    });

    if (!tenant) {
      return { notFound: true };
    }

    const adsFromDb = await prisma.ad.findMany({
      where: {
        tenant: {
          domain: domain
        }
      },
      // Also fetch tenant in the same query for efficiency
      include: {
        tenant: true
      }
    });

    // If this log appears, the database connection was SUCCESSFUL.
    console.log(`[DEBUG_STEP_2] Successfully fetched ${adsFromDb.length} ads from the database.`);
    
    // Let's inspect the raw data type of 'lat' for the first ad
    if (adsFromDb.length > 0) {
      console.log(`[DEBUG_STEP_3] Raw 'lat' value:`, adsFromDb[0].lat);
      console.log(`[DEBUG_STEP_3] Type of 'lat':`, typeof adsFromDb[0].lat);
    }

    // ======================= THE FIX =======================
    // Manually map the array to create clean, serializable objects.
    // This explicitly converts lat/lng to numbers (or null if they don't exist).
    const serializableAds = adsFromDb.map(ad => ({
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
    
    console.log(`[VERCEL_SERVER_LOG] Fetched ${adsFromDb.length} ads for domain: ${domain}`);
    console.log("[VERCEL_SERVER_LOG] First ad data:", JSON.stringify(adsFromDb[0], null, 2));

    console.log("Ads fetched from server:", JSON.stringify(adsFromDb, null, 2));

    const allTags = new Set();
    adsFromDb.forEach(ad => {
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
  } catch (error) {
    console.error("Failed to fetch data for [domain]:", error);
    return {
      props: {
        error: "Could not connect to the database."
      }
    };
  }
}
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
    console.log(`[DEBUG_STEP_1] Attempting to fetch ads for host: ${host}`);

    const tenant = await prisma.tenant.findUnique({
      where: { domain: host },
    });

    if (!tenant) {
      return { notFound: true };
    }

    const ads = await prisma.ad.findMany({
      where: { tenantId: tenant.id },
    });

    console.log(`[DEBUG_STEP_2] Successfully fetched ${ads.length} ads from the database.`);
    
    if (ads.length > 0) {
      console.log(`[DEBUG_STEP_3] Raw 'lat' value:`, ads[0].lat);
      console.log(`[DEBUG_STEP_3] Type of 'lat':`, typeof ads[0].lat);
    }

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
      lat: ad.lat ? parseFloat(ad.lat) : null,
      lng: ad.lng ? parseFloat(ad.lng) : null,
    }));

    console.log(`[VERCEL_SERVER_LOG] Processed ${serializableAds.length} ads for host: ${host}`);
    if (serializableAds.length > 0) {
        console.log("[VERCEL_SERVER_LOG] First processed ad data:", JSON.stringify(serializableAds[0], null, 2));
    }
    
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
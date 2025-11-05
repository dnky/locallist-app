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
  console.log(`[SERVER LOG] Request for host: ${host}`);

  try {
    const tenant = await prisma.tenant.findUnique({ where: { domain: host } });
    if (!tenant) {
      console.log(`[SERVER LOG] Tenant not found for host: ${host}`);
      return { notFound: true };
    }

    // The variable `adsFromDb` is used consistently from here on.
    const adsFromDb = await prisma.ad.findMany({ where: { tenantId: tenant.id } });
    console.log(`[SERVER LOG] STEP 1: Fetched ${adsFromDb.length} ads from DB.`);
    if (adsFromDb.length > 0) {
      console.log(`[SERVER LOG] STEP 1 (raw ad[0].lat):`, adsFromDb[0].lat, `(type: ${typeof adsFromDb[0].lat})`);
      console.log(`[SERVER LOG] STEP 1 (raw ad[0].lng):`, adsFromDb[0].lng, `(type: ${typeof adsFromDb[0].lng})`);
    }

    // This robustly serializes the data to prevent any type issues.
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
      // Ensure lat/lng are numbers or null, converting from any potential non-primitive type.
      lat: ad.lat ? parseFloat(ad.lat.toString()) : null,
      lng: ad.lng ? parseFloat(ad.lng.toString()) : null,
    }));

    console.log(`[SERVER LOG] STEP 2: Mapped to final serializable objects.`);
    if (serializableAds.length > 0) {
      console.log(`[SERVER LOG] STEP 2 (final ad[0].lat):`, serializableAds[0].lat, `(type: ${typeof serializableAds[0].lat})`);
      console.log(`[SERVER LOG] STEP 2 (final ad[0].lng):`, serializableAds[0].lng, `(type: ${typeof serializableAds[0].lng})`);
    }

    console.log(`[SERVER LOG] FINAL CHECK: First ad being sent as prop:`, JSON.stringify(serializableAds[0]));

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
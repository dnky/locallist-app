import { PrismaClient } from '@prisma/client';
import TenantAdGrid from '../components/TenantAdGrid'; // Import the shared component

// The page component itself is now very simple.
export default function DomainPage(props) {
  if (props.error) {
    return (
      <main style={{ textAlign: 'center', paddingTop: '20vh' }}>
        <h1>An Error Occurred</h1>
        <p>{props.error}</p>
      </main>
    );
  }
  return <TenantAdGrid {...props} />;
}

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();
  // Get the domain from the URL slug, e.g., "spaxton.info"
  const { domain } = context.params;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { domain: domain }, // Use the domain from the URL
    });

    if (!tenant) {
      return { notFound: true }; // If domain doesn't exist in DB, show 404
    }

    const ads = await prisma.ad.findMany({
      where: { tenantId: tenant.id },
    });

    return {
      props: {
        ads: JSON.parse(JSON.stringify(ads)),
        tenantName: tenant.name,
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
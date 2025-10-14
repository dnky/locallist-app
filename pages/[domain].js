import TenantAdGrid from '../components/TenantAdGrid';
import prisma from '../lib/prisma'; // <-- 1. IMPORT the shared client

// The page component does not need to change.
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
  // const prisma = new PrismaClient(); <-- 2. REMOVE this line
  const { domain } = context.params;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { domain: domain },
    });

    if (!tenant) {
      return { notFound: true };
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
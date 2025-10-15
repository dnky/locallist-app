import TenantAdGrid from '../components/TenantAdGrid';
import prisma from '../lib/prisma'; // <-- 1. IMPORT the shared client

// The page component itself does not need to change.
export default function IndexPage(props) {
  const { pageClass, ...rest } = props; // Separate pageClass from other props

  return (
    // Wrap everything in a div with the pageClass
    <div className={pageClass}>
      {props.error ? (
        <main style={{ textAlign: 'center', paddingTop: '20vh' }}>
          <h1>An Error Occurred</h1>
          <p>{props.error}</p>
        </main>
      ) : (
        <TenantAdGrid {...rest} /> // Pass the rest of the props to the component
      )}
    </div>
  );
}

// The data fetching logic here remains the same, using the host header.
export async function getServerSideProps(context) {
  // const prisma = new PrismaClient(); <-- 2. REMOVE this line
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

    return {
      props: {
        ads: JSON.parse(JSON.stringify(ads)),
        tenantName: tenant.name,
        tenantDomain: tenant.domain,
      },
    };
  } catch (error) {
    console.error("Failed to fetch data for index:", error);
    return {
      props: {
        error: "Could not connect to the database."
      }
    };
  }
}
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
    const tenant = await prisma.tenant.findUnique({
      where: { domain: domain },
    });

    if (!tenant) {
      return { notFound: true };
    }

    const ads = await prisma.ad.findMany({
      where: { tenantId: tenant.id },
    });
    
    const allTags = new Set();
    ads.forEach(ad => {
      if (ad.tags) {
        ad.tags.split(',').forEach(tag => allTags.add(tag.trim()));
      }
    });
    const categories = Array.from(allTags).sort();

    return {
      props: {
        ads: JSON.parse(JSON.stringify(ads)),
        tenantName: tenant.name,
        tenantTitle: tenant.title,
        tenantDomain: tenant.domain
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
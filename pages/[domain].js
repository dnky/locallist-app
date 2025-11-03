import TenantAdList from '../components/TenantAdList';
import prisma from '../lib/prisma';

export default function DomainPage(props) {
  if (props.error) {
    return (
      <main style={{ textAlign: 'center', paddingTop: '20vh' }}>
        <h1>An Error Occurred</h1>
        <p>{props.error}</p>
      </main>
    );
  }
  return <TenantAdList {...props} />;
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
        tenantTitle: tenant.title, // <-- ADD THIS
        tenantDomain: tenant.domain,
        categories: categories,
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
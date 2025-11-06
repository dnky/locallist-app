import Head from 'next/head';
import styles from '../styles/LandingPage.module.css';

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Local List - Digital Ad Directories for Local Businesses</title>
        <meta name="description" content="Give your local ad a 24/7 online home with Local List. We create beautiful, mobile-friendly digital ad directories for local businesses." />
      </Head>

      <div className={styles.landingPage}>
        <header className={styles.mainHeader}>
          <div className={styles.container}>
            <a href="#" className={styles.logo}><i className="fa-solid fa-newspaper"></i> Local List</a>
            <a href="#contact-form" className={styles.btn}>Get Listed</a>
          </div>
        </header>

        <main>
          <section id="hero">
            <div className={styles.container}>
              <div className={styles.heroContent}>
                <div className={styles.heroText}>
                  <h1>Give Your Local Ad a 24/7 Online Home.</h1>
                  <p className={styles.subHeadline}>
                    Whether you have a great print ad or just need an effective online presence, our digital directory helps local customers find and contact you.
                  </p>
                  <ul>
                    <li><i className="fa-solid fa-circle-check"></i> <strong>Reach More Customers:</strong> Be found by locals searching online for services just like yours.</li>
                    <li><i className="fa-solid fa-circle-check"></i> <strong>Gain a Digital Presence:</strong> Get a beautiful, mobile-friendly listing, even if you don't have a website.</li>
                    <li><i className="fa-solid fa-circle-check"></i> <strong>We Do All The Work:</strong> Simply send us your ad or business details. We handle the entire setup for you.</li>
                  </ul>
                </div>
                
                <div className={styles.contactFormCard} id="contact-form">
                  <h3>Get Your Business Listed!</h3>
                  <p style={{ textAlign: 'center', marginTop: '-15px', marginBottom: '20px' }}>Fill out the form to get started.</p>
                  <form name="contact" action="/api/contact" method="POST">
                    <div className={styles.formGroup}>
                      <label htmlFor="name">Your Name</label>
                      <input type="text" id="name" name="name" required />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="business-name">Business Name</label>
                      <input type="text" id="business-name" name="businessName" required />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="email">Work Email</label>
                      <input type="email" id="email" name="email" required />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="message">Your Message (Optional)</label>
                      <textarea id="message" name="message" rows="3"></textarea>
                    </div>
                    <button type="submit" className={styles.btn} style={{ width: '100%' }}>Claim Your Spot</button>
                  </form>
                </div>
              </div>
            </div>
          </section>

          <section id="features" className={styles.sectionLight}>
            <div className={styles.container}>
              <h2>An Online Showcase Designed for Local Businesses</h2>
              <p style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 40px auto' }}>Our directory isn't just a list. It's a powerful platform built to help customers find you and give them every reason to get in touch.</p>
              
              <div className={styles.featuresGrid}>
                <div className={styles.featureCard}>
                  <div className={styles.icon}><i className="fa-solid fa-grip"></i></div>
                  <h3>Beautiful Ad Showcase</h3>
                  <p>We display your business ad—or create a beautiful listing for you—in a stunning grid that looks great on any device.</p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.icon}><i className="fa-solid fa-filter"></i></div>
                  <h3>Powerful Filtering</h3>
                  <p>Customers can instantly find you by filtering for business types like "Restaurants", "Plumbers", or "Retail".</p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.icon}><i className="fa-solid fa-map-location-dot"></i></div>
                  <h3>Interactive Features</h3>
                  <p>We can add a map to your location, a clickable phone number, and a link to your website or social media.</p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.icon}><i className="fa-solid fa-hand-holding-dollar"></i></div>
                  <h3>Affordable & Effective</h3>
                  <p>Reach a wider local audience online for a fraction of the cost of building and maintaining your own website.</p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.icon}><i className="fa-solid fa-mobile-screen-button"></i></div>
                  <h3>Fully Responsive</h3>
                  <p>Our directory is mobile-first, ensuring a perfect experience for customers on phones, tablets, or desktops.</p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.icon}><i className="fa-solid fa-arrow-pointer"></i></div>
                  <h3>Simple & Hands-Off</h3>
                  <p>There's no complex admin panel for you to learn. You send us the info, we make it look great. It's that easy.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="how-it-works" className={styles.sectionDark}>
            <div className={styles.container}>
              <h2>Get Listed in 3 Simple Steps</h2>
              <div className={styles.stepsContainer}>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>1</div>
                  <h3>Provide Your Details</h3>
                  <p>Have a print ad? Just email it to us. No ad? No problem! Send us your logo, business info, and any photos you have.</p>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>2</div>
                  <h3>We Build Your Listing</h3>
                  <p>We create your dedicated page, add your interactive details, and assign it to the right category for easy discovery.</p>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>3</div>
                  <h3>Attract New Customers</h3>
                  <p>Locals browsing the directory can now find you, contact you with one click, and visit your business, 24/7.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="business-model" className={styles.sectionLight}>
            <div className={styles.container}>
              <div className={styles.winWinContent}>
                <h2>Your Ad's New Home Online</h2>
                <p>A newspaper ad is powerful, but its lifespan is short. Our directory gives your business a permanent, searchable home where motivated local customers can find you long after the paper has been recycled.</p>
                <p><strong>Give your advertising investment the digital power-up it deserves. Get found, get contacted, and get more customers.</strong></p>
                <a href="#contact-form" className={styles.btn}>Get Your Business Listed</a>
              </div>
            </div>
          </section>
        </main>

        <footer className={styles.mainFooter}>
          <div className={styles.container}>
            <p>&copy; 2024 Local List. All Rights Reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
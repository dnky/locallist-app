import Head from 'next/head';

export default function LandingPage({ pageClass }) {
  return (
    <>
      {/* The Head component injects elements into the <head> of the page */}
       <div className={pageClass}>
      <Head>
        <title>Local List - Digital Ad Directories for Local Businesses</title>
        <meta name="description" content="Give your local ad a 24/7 online home with Local List. We create beautiful, mobile-friendly digital ad directories for local businesses." />
        
        {/* Google Fonts and Font Awesome links go here */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </Head>

      {/* Header */}
      <header className="main-header">
        <div className="container">
          <a href="#" className="logo"><i className="fa-solid fa-newspaper"></i> Local List</a>
          <a href="#contact-form" className="btn">Get Listed</a>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section id="hero">
          <div className="container">
            <div className="hero-content">
              <div className="hero-text">
                <h1>Give Your Local Ad a 24/7 Online Home.</h1>
                <p className="sub-headline">
                  Whether you have a great print ad or just need an effective online presence, our digital directory helps local customers find and contact you.
                </p>
                <ul>
                  <li><i className="fa-solid fa-circle-check"></i> <strong>Reach More Customers:</strong> Be found by locals searching online for services just like yours.</li>
                  <li><i className="fa-solid fa-circle-check"></i> <strong>Gain a Digital Presence:</strong> Get a beautiful, mobile-friendly listing, even if you don't have a website.</li>
                  <li><i className="fa-solid fa-circle-check"></i> <strong>We Do All The Work:</strong> Simply send us your ad or business details. We handle the entire setup for you.</li>
                </ul>
              </div>
              
              <div className="contact-form-card" id="contact-form">
                <h3>Get Your Business Listed!</h3>
                <p style={{ textAlign: 'center', marginTop: '-15px', marginBottom: '20px' }}>Fill out the form to get started.</p>
                {/* Note: This form is styled but will require a backend service to function. */}
                <form name="contact" method="POST" data-netlify="true">
                  <div className="form-group">
                    <label htmlFor="name">Your Name</label>
                    <input type="text" id="name" name="name" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="business-name">Business Name</label>
                    <input type="text" id="business-name" name="business-name" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Work Email</label>
                    <input type="email" id="email" name="email" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Your Message (Optional)</label>
                    <textarea id="message" name="message" rows="3"></textarea>
                  </div>
                  <button type="submit" className="btn" style={{ width: '100%' }}>Claim Your Spot</button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="section-light">
          <div className="container">
            <h2>An Online Showcase Designed for Local Businesses</h2>
            <p style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 40px auto' }}>Our directory isn't just a list. It's a powerful platform built to help customers find you and give them every reason to get in touch.</p>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="icon"><i className="fa-solid fa-grip"></i></div>
                <h3>Beautiful Ad Showcase</h3>
                <p>We display your business ad—or create a beautiful listing for you—in a stunning grid that looks great on any device.</p>
              </div>
              <div className="feature-card">
                <div className="icon"><i className="fa-solid fa-filter"></i></div>
                <h3>Powerful Filtering</h3>
                <p>Customers can instantly find you by filtering for business types like "Restaurants", "Plumbers", or "Retail".</p>
              </div>
              <div className="feature-card">
                <div className="icon"><i className="fa-solid fa-map-location-dot"></i></div>
                <h3>Interactive Features</h3>
                <p>We can add a map to your location, a clickable phone number, and a link to your website or social media.</p>
              </div>
              <div className="feature-card">
                <div className="icon"><i className="fa-solid fa-hand-holding-dollar"></i></div>
                <h3>Affordable & Effective</h3>
                <p>Reach a wider local audience online for a fraction of the cost of building and maintaining your own website.</p>
              </div>
              <div className="feature-card">
                <div className="icon"><i className="fa-solid fa-mobile-screen-button"></i></div>
                <h3>Fully Responsive</h3>
                <p>Our directory is mobile-first, ensuring a perfect experience for customers on phones, tablets, or desktops.</p>
              </div>
              <div className="feature-card">
                <div className="icon"><i className="fa-solid fa-arrow-pointer"></i></div>
                <h3>Simple & Hands-Off</h3>
                <p>There's no complex admin panel for you to learn. You send us the info, we make it look great. It's that easy.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="section-dark">
          <div className="container">
            <h2>Get Listed in 3 Simple Steps</h2>
            <div className="steps-container">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Provide Your Details</h3>
                <p>Have a print ad? Just email it to us. No ad? No problem! Send us your logo, business info, and any photos you have.</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>We Build Your Listing</h3>
                <p>We create your dedicated page, add your interactive details, and assign it to the right category for easy discovery.</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>Attract New Customers</h3>
                <p>Locals browsing the directory can now find you, contact you with one click, and visit your business, 24/7.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="business-model" className="section-light">
          <div className="container">
            <div className="win-win-content">
              <h2>Your Ad's New Home Online</h2>
              <p>A newspaper ad is powerful, but its lifespan is short. Our directory gives your business a permanent, searchable home where motivated local customers can find you long after the paper has been recycled.</p>
              <p><strong>Give your advertising investment the digital power-up it deserves. Get found, get contacted, and get more customers.</strong></p>
              <a href="#contact-form" className="btn">Get Your Business Listed</a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <div className="container">
          <p>&copy; 2024 Local List. All Rights Reserved.</p>
        </div>
      </footer>
      </div>
    </>
  );
}
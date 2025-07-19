import React from 'react';
import './Home.css';
import Footer from './Footer';
import Navbar from './Navbar';

const AboutPage: React.FC = () => {
  return (
    <>

    <Navbar/>
    <div id="rre">
      <section className="about-section" style={{ background: '#111', color: '#eaeaea', padding: '64px 0 0 0' }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 8 }}>
            About <span style={{ color: '#ffd600' }}>J<sup>2</sup> Mechanics</span>
          </h1>
          <div style={{ color: '#bdbdbd', fontSize: '1.15rem', marginBottom: 16 }}>
            Professional automotive services with a commitment to honesty, reliability, and exceptional results.
          </div>
          <div style={{ width: 64, height: 4, background: '#ffd600', borderRadius: 2, marginBottom: 40 }} />

          {/* Our Story Section */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'stretch', marginBottom: 64 }}>
            <div style={{ flex: 2, minWidth: 280, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Our Story</h2>
              <div style={{ width: 64, height: 4, background: '#ffd600', borderRadius: 2, marginBottom: 24 }} />
              <div style={{ color: '#eaeaea', fontSize: '1.08rem', lineHeight: 1.7 }}>
                J<sup>2</sup> Mechanics was established with a clear mission: to provide honest, reliable automotive services to car owners in North London. Our story began with two skilled mechanics, both named James (hence J<sup>2</sup>), who were frustrated with the industry's lack of transparency and customer service.<br /><br />
                They combined their expertise and passion for quality workmanship to create a garage where customers could expect fair pricing, expert service, and complete transparency throughout the repair process.<br /><br />
                Today, we've grown our team of certified technicians, but our founding principles remain unchanged. From routine maintenance to complex repairs, we approach every job with the same dedication to quality and customer satisfaction.
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '100%', height: '100%', minHeight: 220, maxHeight: 340, background: '#181818', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, boxShadow: '0 4px 24px #0006' }}>
                <span style={{ color: '#444', fontSize: 18, textAlign: 'center', padding: 16 }}>J<sup>2</sup> Mechanics workshop in North London</span>
              </div>
            </div>
          </div>

          {/* Our Values & Vision Section */}
          <div style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Our Values</h2>
            <div style={{ width: 64, height: 4, background: '#ffd600', borderRadius: 2, marginBottom: 24 }} />
            <div style={{ color: '#eaeaea', fontSize: '1.08rem', lineHeight: 1.7, marginBottom: 32 }}>
              <strong>Our Vision:</strong> To set the standard for honest, transparent, and high-quality automotive care in North London. We believe in building lasting relationships with our customers through trust, expertise, and a relentless commitment to their satisfaction. Our vision is to be the garage you recommend to friends and family, not just for our technical skill, but for our integrity and service.
            </div>
          </div>
        </div>
      </section>
      <Footer />
      </div>
    </>
  );
};

export default AboutPage; 
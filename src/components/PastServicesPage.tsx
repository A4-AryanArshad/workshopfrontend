import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const pastServices = [
  { service: 'Full Service', date: '12 May 2024', car: 'Vauxhall Astra', price: '£199' },
  { service: 'Brake Replacement', date: '20 Feb 2024', car: 'Ford Fiesta', price: '£150' },
  { service: 'Diagnostics', date: '10 Jan 2024', car: 'BMW 1 Series', price: '£60' },
];

const PastServicesPage: React.FC = () => (
  <>

    <Navbar />
    <div id="tpast">

      </div>
    <div id="past"style={{ background: '#111', minHeight: '100vh', padding: 0 }}>
      <div id="past2" style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px 0 24px' }}>
        <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2.2rem', marginBottom: 8 }}>Past Services</h1>
        <div style={{ color: '#bdbdbd', fontSize: '1.15rem', marginBottom: 32 }}>Your completed services are listed below.</div>
        {pastServices.map((item, i) => (
          <div key={i} style={{ background: '#232323', borderRadius: 14, boxShadow: '0 2px 12px #0006', padding: 24, marginBottom: 18, color: '#fff', display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1.18rem', color: '#ffd600', marginBottom: 4 }}>{item.service}</div>
              <div style={{ color: '#bdbdbd', fontSize: '1.05rem', marginBottom: 2 }}>{item.car}</div>
              <div style={{ color: '#fff', fontSize: '1.01rem' }}>{item.date}</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#ffd600' }}>{item.price}</div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  </>
);

export default PastServicesPage; 
import React, { useState } from 'react';
import './Home.css';
import ReadyToExperience from './ReadyToExperience';
import Footer from './Footer';
import Navbar from './Navbar';

const serviceData = [
  {
    id: 1,
    category: 'Maintenance',
    title: 'Full Service',
    price: '£199',
    duration: '3-4 hours',
    details: 'Comprehensive service including oil change, all fluid checks and top-ups, brake inspection, air filter replacement, and full vehicle health check with diagnostic scan.',
  },
  {
    id: 2,
    category: 'Maintenance',
    title: 'Interim Service',
    price: '£99',
    duration: '1-2 hours',
    details: 'Basic service including oil and filter change, fluid top-ups, and essential safety checks.',
  },
  {
    id: 3,
    category: 'Diagnostics',
    title: 'Diagnostics',
    price: '£60',
    duration: '1 hour',
    details: 'Full vehicle diagnostics scan to identify issues and error codes.',
  },
  {
    id: 4,
    category: 'Repairs',
    title: 'Brake Replacement',
    price: '£150',
    duration: '2-3 hours',
    details: 'Replacement of brake pads and discs, including safety checks.',
  },
  {
    id: 5,
    category: 'Maintenance',
    title: 'Tyre Replacement',
    price: '£45',
    duration: '1 hour',
    details: 'Tyre removal and fitting, balancing, and safety inspection.',
  },
  {
    id: 6,
    category: 'Inspection',
    title: 'MOT Preparation',
    price: '£120',
    duration: '2 hours',
    details: 'Pre-MOT inspection and preparation to help your vehicle pass the MOT test.',
  },
];

const categories = ['All', 'Maintenance', 'Repairs', 'Diagnostics', 'Inspection'];

const OurServicesPage: React.FC = () => {
  const [selected, setSelected] = useState('All');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const filtered = (selected === 'All' ? serviceData : serviceData.filter(s => s.category === selected))
    .filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

  const handleClientBooking = (service: typeof serviceData[0]) => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    
    if (token && userEmail) {
      // User is logged in, redirect to user dashboard
      window.location.href = 'https://workshopfrontend-one.vercel.app/user-dashboard';
    } else {
      // User is not logged in, redirect to login page
      window.location.href = 'https://workshopfrontend-one.vercel.app/login';
    }
  };

  return (
    <>
    <Navbar/>
    <div id="totlar">
      <section className="services-section" id="services">
        <div className="services-container">
          <h2 className="services-title">
            Our Services
            <span className="services-title-underline"></span>
          </h2>
          <p className="services-desc">
            Professional automotive services tailored to your vehicle's needs. From routine maintenance to complex repairs, our skilled technicians deliver exceptional results.
          </p>
          <input
            className="services-search-input"
            type="text"
            placeholder="Search for a service..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: 24, padding: '12px 18px', borderRadius: 8, border: '1.5px solid #232323', fontSize: '1.1rem', width: '100%', maxWidth: 400, background: '#181818', color: '#eaeaea' }}
          />
          <div className="services-tabs">
            {categories.map(cat => (
              <button
                key={cat}
                className={`services-tab${selected === cat ? ' active' : ''}`}
                onClick={() => setSelected(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="services-grid">
            {filtered.map((service, i) => (
              <div
                key={service.id}
                className={`service-card-modern${expanded === service.id ? ' expanded' : ''}`}
              >
                <div className="service-card-header">
                  <span className="service-card-category">{service.category}</span>
                  <span className="service-card-title">{service.title}</span>
                </div>
                <div className="service-card-info">
                  <span className="service-card-price">{service.price} <span className="service-card-from">from</span></span>
                  <span className="service-card-duration">{service.duration}</span>
                </div>
                <button
                  className="service-card-toggle"
                  onClick={() => setExpanded(expanded === service.id ? null : service.id)}
                >
                  {expanded === service.id ? 'Show less' : 'Show details'}
                  <span className={`service-card-arrow${expanded === service.id ? ' up' : ''}`}>▼</span>
                </button>
                {expanded === service.id && (
                  <div className="service-card-details">
                    <p>{service.details}</p>
                    <button 
                      className="service-card-book-btn" 
                      onClick={() => handleClientBooking(service)}
                    >
                      Book Now →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <ReadyToExperience />
      <Footer />
      </div>

    </>
  );
};

export default OurServicesPage; 
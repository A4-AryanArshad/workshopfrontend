import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ClientBookingModal from './ClientBookingModal';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { API_BASE_URL } from '../config';
gsap.registerPlugin(ScrollTrigger);

type ApiService = { _id: string; label: string; sub: string; price?: number; category?: string; description?: string; labourHours?: number; labourCost?: number };

const fallbackServiceData = [
  {
    id: 1,
    category: 'Maintenance',
    title: 'Full Service',
    price: '£199',
    duration: '3-4 hours',
    details: 'Comprehensive service including oil change, all fluid checks and top-ups, brake inspection, air filter replacement, and full vehicle health check with diagnostic scan.',
    labourHours: 3,
    labourCost: 10,
    originalService: null,
  },
  {
    id: 2,
    category: 'Maintenance',
    title: 'Interim Service',
    price: '£99',
    duration: '1-2 hours',
    details: 'Basic service including oil and filter change, fluid top-ups, and essential safety checks.',
    labourHours: 1.5,
    labourCost: 10,
    originalService: null,
  },
  {
    id: 3,
    category: 'Diagnostics',
    title: 'Diagnostics',
    price: '£60',
    duration: '1 hour',
    details: 'Full vehicle diagnostics scan to identify issues and error codes.',
    labourHours: 1,
    labourCost: 10,
    originalService: null,
  },
  {
    id: 4,
    category: 'Repairs',
    title: 'Brake Replacement',
    price: '£150',
    duration: '2-3 hours',
    details: 'Replacement of brake pads and discs, including safety checks.',
    labourHours: 2.5,
    labourCost: 10,
    originalService: null,
  },
  {
    id: 5,
    category: 'Maintenance',
    title: 'Tyre Replacement',
    price: '£45',
    duration: '1 hour',
    details: 'Tyre removal and fitting, balancing, and safety inspection.',
    labourHours: 1,
    labourCost: 10,
    originalService: null,
  },
  {
    id: 6,
    category: 'Inspection',
    title: 'MOT Preparation',
    price: '£120',
    duration: '2 hours',
    details: 'Pre-MOT inspection and preparation to help your vehicle pass the MOT test.',
    labourHours: 2,
    labourCost: 10,
    originalService: null,
  },
];

const categories = ['All', 'Maintenance', 'Repairs', 'Diagnostics', 'Inspection'];

const Services: React.FC = () => {
  const [selected, setSelected] = useState('All');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [serviceData, setServiceData] = useState<typeof fallbackServiceData>(fallbackServiceData);
  const [isClientBookingOpen, setIsClientBookingOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<typeof fallbackServiceData[0] | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/services`)
      .then(r => r.json())
      .then((list: ApiService[]) => {
        console.log('Fetched services:', list);
        if (!Array.isArray(list) || list.length === 0) return;
        const mapped = list.map((s, idx) => {
          const durationRaw = s.sub?.split(' - ')[0] || '';
          let duration = '';
          if (durationRaw.includes('h')) {
            const hours = parseFloat(durationRaw.replace('h', ''));
            duration = hours === 1 ? '1 hour' : `${hours} hours`;
          } else {
            duration = durationRaw;
          }
          const category = s.category || (s.sub?.split(' - ')[1] || '').trim();
          return {
            id: idx + 1,
            category: category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Maintenance',
            title: s.label,
            price: s.price ? `£${Number(s.price).toFixed(0)}` : '£0',
            duration: duration,
            details: s.description || '',
            labourHours: s.labourHours || 0,
            labourCost: s.labourCost || 0,
            originalService: s // Keep reference to original service data
          };
        });
        console.log('Mapped services:', mapped);
        setServiceData(mapped as any);
      })
      .catch((error) => {
        console.error('Error fetching services:', error);
      });
  }, []);

  const filtered = selected === 'All' ? serviceData : serviceData.filter(s => s.category === selected);

  const handleClientBooking = (service: typeof fallbackServiceData[0]) => {
    setSelectedServiceForBooking(service);
    setIsClientBookingOpen(true);
  };

  // Animation refs
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        [titleRef.current, descRef.current, tabsRef.current],
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );
    }
    if (cardsRef.current) {
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.13,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        }
      );
    }
  }, [filtered.length]);

  // Check if selected category has any services
  const hasServicesInCategory = selected === 'All' || filtered.length > 0;

  return (
    <section  className="services-section" id="services" ref={sectionRef}>
      <div  className="services-container">
        <h2 className="services-title" ref={titleRef}>
          Our Services
          <span className="services-title-underline"></span>
        </h2>
        <p className="services-desc" ref={descRef}>
          Professional automotive services tailored to your vehicle's needs. From routine maintenance to complex repairs, our skilled technicians deliver exceptional results.
        </p>
        <div className="services-tabs" ref={tabsRef}>
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
        
        {hasServicesInCategory ? (
          <div className="services-grid">
            {filtered.map((service, i) => (
              <div
                key={service.id}
                className={`service-card-modern${expanded === service.id ? ' expanded' : ''}`}
                ref={el => { cardsRef.current[i] = el; }}
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
                  {expanded === service.id ? 'Show less ▲' : 'Show details ▼'}
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
        ) : (
          <div className="coming-soon-container">
            <div className="coming-soon-card">
              <h3>Coming Soon</h3>
              <p>We're working on adding {selected} services. Check back soon for updates!</p>
              <div className="coming-soon-icon">🚗</div>
            </div>
          </div>
        )}
      </div>

      {/* Client Booking Modal */}
      <ClientBookingModal
        isOpen={isClientBookingOpen}
        onClose={() => {
          setIsClientBookingOpen(false);
          setSelectedServiceForBooking(null);
        }}
        selectedService={selectedServiceForBooking}
      />
    </section>
  );
};

export default Services; 
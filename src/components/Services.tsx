import React, { useState, useRef, useEffect } from 'react';
import './Home.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

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

const Services: React.FC = () => {
  const [selected, setSelected] = useState('All');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = selected === 'All' ? serviceData : serviceData.filter(s => s.category === selected);

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

  return (
    <section className="services-section" id="services" ref={sectionRef}>
      <div className="services-container">
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
                {expanded === service.id ? 'Show less' : 'Show details'}
                <span className={`service-card-arrow${expanded === service.id ? ' up' : ''}`}>▼</span>
              </button>
              {expanded === service.id && (
                <div className="service-card-details">
                  <p>{service.details}</p>
                  <button className="service-card-book-btn">Book Now →</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services; 
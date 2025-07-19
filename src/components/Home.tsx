import React, { useState, useRef, useEffect } from 'react';
import './Home.css';
import Services from './Services';
import WhyChoose from './WhyChoose';
import ClientReviews from './ClientReviews';
import ReadyToExperience from './ReadyToExperience';
import Footer from './Footer';
import gsap from 'gsap';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const heroTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial state
    if (heroTextRef.current) {
      Array.from(heroTextRef.current.children).forEach((el) => {
        (el as HTMLElement).style.opacity = '0';
        (el as HTMLElement).style.transform = 'translateY(40px)';
      });
    }
    // Animate in after a short delay
    const timeout = setTimeout(() => {
      if (heroTextRef.current) {
        gsap.to(heroTextRef.current.children, {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power3.out',
        });
      }
    }, 800); // 0.8s delay
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="home new-home-bg">
 <Navbar/>
      <main className="new-hero-section">
        <div className="new-hero-center" ref={heroTextRef}>
          <div className="new-hero-logo">
          <img id="imager2" src="/nlogo.png"/>
          </div>
          <div className="new-hero-label">MECHANICS</div>
          <h1 className="new-hero-title">Professional<br/>Automotive Services</h1>
          <div className="new-hero-buttons">
            <button className="new-book-btn large">
              <Link to="/signup" style={{ color: 'inherit', textDecoration: 'none' }}>Book Your Service</Link>
            </button>
            <button className="new-view-btn large">View Our Services</button>
          </div>
        </div>
        <div className="scroll-indicator">Scroll to explore<br/><span className="scroll-mouse"></span></div>
      </main>
      <Services />
      <WhyChoose />
      <ClientReviews />
      <ReadyToExperience />
      <Footer />
    </div>
  );
};

export default Home; 
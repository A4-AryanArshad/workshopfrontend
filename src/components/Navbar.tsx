import React, { useState, useRef, useEffect } from 'react';
import './Navbar.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        if (window.scrollY < 20) {
          gsap.to(navRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.4, ease: 'power2.out' });
        } else {
          gsap.to(navRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.4, ease: 'power2.out' });
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    if (heroTextRef.current) {
      Array.from(heroTextRef.current.children).forEach((el) => {
        (el as HTMLElement).style.opacity = '0';
        (el as HTMLElement).style.transform = 'translateY(40px)';
      });
    }
    if (navRef.current) {
      gsap.set(navRef.current, { opacity: 1, pointerEvents: 'auto' });
    }
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
    }, 800);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const onStorage = () => setRole(localStorage.getItem('role'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setRole(null);
    navigate('/login');
  };

  // Admin nav
  if (role === 'admin') {
    return (
      <nav className="new-navbar" ref={navRef}>
        <div className="new-navbar-logo">
          <img id="imager1" src="/nlogo.png"/>
        </div>
        {isMobile && (
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}
        <div className={`new-navbar-menu${menuOpen ? ' open' : ''}`}>
          <ul className="new-nav-menu">
            <li><Link to="/dashboard" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link></li>
            <li><Link to="/dashboard/add-images" onClick={() => setMenuOpen(false)}>AddImages</Link></li>
            <li><button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>Logout</button></li>
          </ul>
        </div>
      </nav>
    );
  }

  // User nav
  if (role === 'user') {
    return (
      <nav className="new-navbar" ref={navRef}>
        <div className="new-navbar-logo">
          <img id="imager1" src="/nlogo.png"/>
        </div>
        {isMobile && (
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}
        <div className={`new-navbar-menu${menuOpen ? ' open' : ''}`}>
          <ul className="new-nav-menu">
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/our-services" onClick={() => setMenuOpen(false)}>Services</Link></li>
            <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
            <li><Link to="/dashboard/past-services" onClick={() => setMenuOpen(false)}>Past Services</Link></li>
            <li><Link to="/dashboard/upcoming" onClick={() => setMenuOpen(false)}>Upcoming Appointments</Link></li>
            <li><Link to="/dashboard/messages" onClick={() => setMenuOpen(false)}>Messages</Link></li>
            <li><Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link></li>
            <li><button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>Logout</button></li>
          </ul>
        </div>
      </nav>
    );
  }

  // Guest nav
  return (
    <nav className="new-navbar" ref={navRef}>
      <div className="new-navbar-logo">
        <img id="imager1" src="/nlogo.png"/>
      </div>
      {isMobile && (
        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}
      <div className={`new-navbar-menu${menuOpen ? ' open' : ''}`}>
        <ul id="links1" className="new-nav-menu">
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/our-services" onClick={() => setMenuOpen(false)}>Services</Link></li>
          <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
          <li><Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link></li>
        </ul>
        <div id="links1" className="new-navbar-actions">
          <button className="new-login-btn">
            <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Log In</Link>
          </button>
          <button className="new-book-btn">
            <Link to="/signup" style={{ color: 'inherit', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Book Now</Link>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
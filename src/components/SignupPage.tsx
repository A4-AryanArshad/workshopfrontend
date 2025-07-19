import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const SignupLogo = () => (
  <div style={{ textAlign: 'center', marginBottom: 32 }}>
    <img id="imager11" src="./nlogo.png"/>
  </div>
);

const LockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, minWidth: 22 }}>
    <rect x="3" y="11" width="18" height="10" rx="4" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('https://workshop-backend-ox7a.vercel.app/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      setSuccess('Signup successful! Please login.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <style>{`
        @media (max-width: 600px) {
          .login-card {
            padding: 18px !important;
            border-radius: 8px !important;
            min-width: 0 !important;
            width: 100% !important;
          }
          .login-card input {
            font-size: 0.98rem !important;
            padding: 8px 10px !important;
            border-radius: 6px !important;
          }
        }
        .login-card input {
          width: 100%;
          box-sizing: border-box;
          min-width: 0;
          max-width: 100%;
        }
      `}</style>
      <Navbar/>
      <div id="rrre">
      <div style={{ background: '#111', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
        <SignupLogo />
        <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '2rem', marginBottom: 32, textAlign: 'center' }}>Sign Up</h2>
        <form className="login-card" onSubmit={handleSubmit} style={{ background: '#181818', borderRadius: 16, boxShadow: '0 4px 24px #0006', padding: 32, minWidth: 340, maxWidth: 380, width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <label htmlFor="name" style={{ color: '#eaeaea', fontWeight: 500, marginBottom: 4 }}>Name</label>
          <input id="name" name="name" type="text" value={name} onChange={e => setName(e.target.value)} required style={{ background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
          <label htmlFor="email" style={{ color: '#eaeaea', fontWeight: 500, marginBottom: 4 }}>Email</label>
          <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
          <label htmlFor="password" style={{ color: '#eaeaea', fontWeight: 500, marginBottom: 4 }}>Password</label>
          <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 16 }} />
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
          <button type="submit" style={{ background: '#ffd600', color: '#111', fontWeight: 600, border: 'none', borderRadius: 8, padding: '12px 0', fontSize: '1.1rem', marginTop: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 2px 8px #0003' }}>
            <LockIcon /> Sign Up
          </button>
        </form>
      </div>
      <Footer/>
      </div>
    </>
  );
};

export default SignupPage; 
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const messages = [
  { title: 'Reminder', body: 'Your MOT is due in 30 days. Book now to avoid a fine.' },
  { title: 'Thank you!', body: 'Your last service was completed successfully. We appreciate your business.' },
  { title: 'Offer', body: '10% off brake pads this month. Ask at your next visit!' },
];

const MessagesPage: React.FC = () => (
  <>
    <Navbar />
    <div id="tpast">

</div>
    <div  id="past"style={{ background: '#111', minHeight: '100vh', padding: 0 }}>
      <div id="past2"style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px 0 24px' }}>
        <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2.2rem', marginBottom: 8 }}>Messages</h1>
        <div style={{ color: '#bdbdbd', fontSize: '1.15rem', marginBottom: 32 }}>Important updates and reminders are listed below.</div>
        {messages.map((item, i) => (
          <div key={i} style={{ background: '#232323', borderRadius: 14, boxShadow: '0 2px 12px #0006', padding: 24, marginBottom: 18, color: '#fff' }}>
            <div style={{ fontWeight: 700, fontSize: '1.13rem', color: '#ffd600', marginBottom: 6 }}>{item.title}</div>
            <div style={{ color: '#fff', fontSize: '1.05rem' }}>{item.body}</div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  </>
);

export default MessagesPage; 
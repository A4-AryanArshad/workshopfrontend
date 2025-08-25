import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

const AddImagesPage: React.FC = () => {
  const [carNumber, setCarNumber] = useState('');
  const [searched, setSearched] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>({});
  const [serviceImages, setServiceImages] = useState<{ [key: string]: any[] }>({});
  const [descriptions, setDescriptions] = useState<{ [key: string]: string }>({});

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    setBookings([]);
    setServiceImages({});
    setExpanded(null);
    if (!carNumber) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${encodeURIComponent(carNumber)}`);
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const handleFileChange = (bookingId: string, files: FileList | null) => {
    if (!files) return;
    setSelectedFiles(prev => ({ ...prev, [bookingId]: Array.from(files) }));
  };

  const handleUpload = async (booking: any) => {
    const files = selectedFiles[booking._id];
    if (!files || files.length === 0) return;
    
    setUploading(booking._id);
    const formData = new FormData();
    
    for (const file of files) {
      formData.append('images', file);
    }
    formData.append('userId', 'admin');
    formData.append('serviceId', booking._id);
    
    // Add customer email to associate images with the customer
    if (booking.customer && booking.customer.email) {
      formData.append('customerEmail', booking.customer.email);
    }

    try {
      console.log('🔄 Uploading images for service:', booking._id);
      console.log('📧 Customer email:', booking.customer?.email);
      console.log('📁 Files to upload:', files.length);
      
      const res = await fetch(`${API_BASE_URL}/upload-service-image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('✅ Upload successful:', data);
      
      setUploading(null);
      setServiceImages(prev => ({
        ...prev,
        [booking._id]: [ ...(prev[booking._id] || []), ...(data.images || []) ]
      }));
      setSelectedFiles(prev => ({ ...prev, [booking._id]: [] }));
      
      // Show success message
      alert(`Successfully uploaded ${files.length} image(s)!`);
      
    } catch (err: any) {
      console.error('❌ Upload failed:', err);
      setUploading(null);
      alert(`Upload failed: ${err.message}`);
    }
  };

  const handleAccordion = (idx: number) => {
    setExpanded(expanded === idx ? null : idx);
  };

  const handleDescriptionChange = (bookingId: string, value: string) => {
    setDescriptions(d => ({ ...d, [bookingId]: value }));
  };

  return (
    <>
      <div id="upperi">
        <Navbar />
        <div id="inneri" style={{ background: '#111', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '48px 0' }}>
          <div style={{ background: '#181818', borderRadius: 18, boxShadow: '0 4px 24px #0008', padding: 36, minWidth: 340, maxWidth: 540, width: '100%', display: 'flex', flexDirection: 'column', gap: 22 }}>
            <h2 style={{ color: '#ffd600', fontWeight: 700, fontSize: '2.1rem', marginBottom: 6, textAlign: 'center', letterSpacing: 0.5 }}>Upload Service Images for Clients</h2>
            <div style={{ color: '#bdbdbd', fontSize: '1.08rem', marginBottom: 18, textAlign: 'center' }}>
              Enter a car number to view and manage service images for that vehicle.
            </div>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 10, justifyContent: 'center' }}>
              <input
                type="text"
                placeholder="Enter Car Number (e.g. AB12CDE)"
                value={carNumber}
                onChange={e => setCarNumber(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid #232323', background: '#222', color: '#fff', fontSize: '1.08rem', width: 220 }}
                required
              />
              <button type="submit" style={{ background: '#ffd600', color: '#111', fontWeight: 700, border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: '1.08rem', cursor: 'pointer', boxShadow: '0 2px 8px #0003', letterSpacing: 0.5 }}>
                Search
              </button>
            </form>
            {searched && (
              <div style={{ marginTop: 18 }}>
                {bookings.length === 0 ? (
                  <span style={{ color: '#888', fontSize: 15 }}>No services found for this car.</span>
                ) : (
                  bookings.map((booking, idx) => (
                    <div key={booking._id} style={{ marginBottom: 18, background: '#232323', borderRadius: 12, boxShadow: '0 2px 8px #0005' }}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', cursor: 'pointer' }}
                        onClick={() => handleAccordion(idx)}
                      >
                        <div style={{ flex: 1 }}>
                          <span style={{ color: '#ffd600', fontWeight: 600, fontSize: '1.13rem' }}>
                            {booking.service?.label || 'Service'} ({booking.date})
                          </span>
                          {booking.customer && (
                            <div style={{ color: '#bdbdbd', fontSize: '0.9rem', marginTop: 4 }}>
                              Customer: {booking.customer.name} ({booking.customer.email})
                            </div>
                          )}
                          <div style={{ color: '#fff', fontSize: '0.95rem', marginTop: 2 }}>
                            {booking.car?.make} {booking.car?.model} {booking.car?.year} - {booking.car?.registration}
                          </div>
                        </div>
                        <span style={{ color: '#fff', fontSize: 22 }}>{expanded === idx ? '▲' : '▼'}</span>
                      </div>
                      {expanded === idx && (
                        <div style={{ padding: '0 18px 18px 18px', background: '#232323', borderRadius: '0 0 12px 12px' }}>
                          <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={e => handleFileChange(booking._id, e.target.files)}
                              style={{ color: '#fff' }}
                            />
                            <button
                              onClick={() => handleUpload(booking)}
                              style={{ background: '#ffd600', color: '#111', fontWeight: 700, border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: '1rem', cursor: 'pointer', opacity: uploading === booking._id ? 0.7 : 1 }}
                              disabled={uploading === booking._id}
                            >
                              {uploading === booking._id ? 'Uploading...' : 'Upload Images'}
                            </button>
                          </div>
                          <div style={{ color: '#bdbdbd', fontSize: '1rem', marginBottom: 6 }}>Uploaded Images:</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, minHeight: 40 }}>
                            {(serviceImages[booking._id] || []).length === 0 ? (
                              <span style={{ color: '#888', fontSize: 15 }}>No images uploaded yet.</span>
                            ) : (
                              serviceImages[booking._id].map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img.imageUrl}
                                  alt={`Service ${booking.service?.label || 'Service'} ${idx + 1}`}
                                  style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #333', background: '#181818' }}
                                />
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default AddImagesPage;

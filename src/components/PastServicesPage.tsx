import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const PastServicesPage: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const API_BASE_URL = 'https://workshop-backend-six.vercel.app';

  // Auto-fetch services when page opens
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    const isLoggedIn = localStorage.getItem('token') && localStorage.getItem('role');
    
    if (storedEmail && isLoggedIn) {
      handleAutoSearch(storedEmail);
    } else {
      setError('Please log in to view your services.');
    }
  }, []);

  const handleAutoSearch = async (userEmail: string) => {
    setLoading(true);
    setError('');
    setServices([]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/user-services-with-images/${encodeURIComponent(userEmail.trim())}`);
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        setError('Failed to fetch services. Please try logging in again.');
        setServices([]);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setExpandedImage(imageUrl);
  };

  const closeExpandedImage = () => {
    setExpandedImage(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price: number) => {
    return `£${typeof price === 'number' ? price.toFixed(2) : '0.00'}`;
  };

  return (
    <>
      <Navbar />
      <div id="tpast"></div>
      <div  style={{ background: '#111', minHeight: '100vh', padding: 0 }}>
        <div id="past2" style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 0 24px' }}>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2.2rem', marginBottom: 8 }}>Past Services</h1>
          <div style={{ color: '#bdbdbd', fontSize: '1.15rem', marginBottom: 32 }}>
            {localStorage.getItem('token') ? (
              <>
                Welcome back! Showing services for <span style={{ color: '#ffd600', fontWeight: 600 }}>{localStorage.getItem('userEmail')}</span>
                <br />
                <span style={{ fontSize: '1rem', color: '#888' }}>
                  Your services are automatically loaded. Click refresh if you need the latest updates.
                </span>
                <div style={{ marginTop: 16 }}>
                  <button
                    onClick={() => handleAutoSearch(localStorage.getItem('userEmail') || '')}
                    disabled={loading}
                    style={{
                      background: '#ffd600',
                      color: '#111',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 20px',
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '0.95rem',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? 'Refreshing...' : '🔄 Refresh Services'}
                  </button>
                </div>
              </>
            ) : (
              'Please log in to view your completed services with car images.'
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#dc3545',
              color: '#fff',
              padding: '16px 20px',
              borderRadius: 10,
              marginBottom: 24,
              fontSize: '1rem'
            }}>
              {error}
            </div>
          )}

          {/* Results */}
          {loading && (
            <div style={{
              background: '#181818',
              borderRadius: 16,
              padding: '48px 32px',
              textAlign: 'center',
              boxShadow: '0 4px 24px #0006'
            }}>
              <div style={{ color: '#ffd600', fontSize: '2rem', marginBottom: 16 }}>⚙️</div>
              <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600, marginBottom: 12 }}>
                Loading Your Service History
              </div>
              <div style={{ color: '#bdbdbd', fontSize: '1rem', lineHeight: 1.6 }}>
                Please wait while we fetch your completed services.
              </div>
            </div>
          )}

          {!loading && services.length === 0 && (
            <div style={{
              background: '#181818',
              borderRadius: 16,
              padding: '48px 32px',
              textAlign: 'center',
              boxShadow: '0 4px 24px #0006'
            }}>
              <div style={{ color: '#bdbdbd', fontSize: '1.1rem', marginBottom: 8 }}>
                No services found for this email address.
              </div>
              <div style={{ color: '#888', fontSize: '0.95rem' }}>
                Please check your email address or contact us if you believe this is an error.
              </div>
            </div>
          )}

          {!loading && services.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ 
                color: '#fff', 
                fontSize: '1.2rem', 
                fontWeight: 600, 
                marginBottom: 16 
              }}>
                Found {services.length} service{services.length !== 1 ? 's' : ''} for {localStorage.getItem('userEmail')}
              </div>
              
              {services.map((service, index) => (
                <div key={service._id || index} style={{
                  background: '#181818',
                  borderRadius: 16,
                  padding: 24,
                  marginBottom: 20,
                  boxShadow: '0 4px 24px #0006',
                  border: '1px solid #232323'
                }}>
                  {/* Service Header */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: 20,
                    flexWrap: 'wrap',
                    gap: 16
                  }}>
                    <div style={{ flex: 1, minWidth: 250 }}>
                      <div style={{ 
                        fontWeight: 700, 
                        fontSize: '1.4rem', 
                        color: '#ffd600', 
                        marginBottom: 8 
                      }}>
                        {service.service?.label || 'Service'}
                      </div>
                      <div style={{ color: '#bdbdbd', fontSize: '1.05rem', marginBottom: 4 }}>
                        {service.service?.sub || 'Service Details'}
                      </div>
                      <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 500 }}>
                        {service.car?.make} {service.car?.model} {service.car?.year}
                      </div>
                      <div style={{ color: '#ffd600', fontSize: '1rem', fontWeight: 600 }}>
                        Registration: {service.car?.registration || 'N/A'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 120 }}>
                      <div style={{ 
                        color: '#ffd600', 
                        fontWeight: 700, 
                        fontSize: '1.5rem', 
                        marginBottom: 4 
                      }}>
                        {formatPrice(service.total)}
                      </div>
                      <div style={{ color: '#bdbdbd', fontSize: '0.95rem' }}>
                        {formatDate(service.date)}
                      </div>
                      {service.time && (
                        <div style={{ color: '#bdbdbd', fontSize: '0.95rem' }}>
                          at {service.time}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service Images */}
                  {service.images && service.images.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ 
                        color: '#fff', 
                        fontSize: '1.1rem', 
                        fontWeight: 600, 
                        marginBottom: 16 
                      }}>
                        📸 Service Images
                      </div>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: 16
                      }}>
                        {service.images.map((image: any, imgIndex: number) => (
                          <div key={imgIndex} style={{
                            background: '#232323',
                            borderRadius: 12,
                            overflow: 'hidden',
                            border: '1px solid #333'
                          }}>
                            <img
                              src={image.imageUrl}
                              alt={`Service image ${imgIndex + 1}`}
                              style={{
                                width: '100%',
                                height: 150,
                                objectFit: 'cover',
                                display: 'block',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                              onClick={() => handleImageClick(image.imageUrl)}
                            />
                            <div style={{
                              padding: '12px',
                              textAlign: 'center',
                              color: '#bdbdbd',
                              fontSize: '0.9rem'
                            }}>
                              Image {imgIndex + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Service Details */}
                  <div style={{
                    background: '#232323',
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 16
                  }}>
                    <div style={{ 
                      color: '#fff', 
                      fontSize: '1.1rem', 
                      fontWeight: 600, 
                      marginBottom: 16 
                    }}>
                      Service Details
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 16
                    }}>
                      <div>
                        <span style={{ color: '#bdbdbd', fontSize: '0.9rem' }}>Labour Hours:</span>
                        <div style={{ color: '#fff', fontWeight: 500 }}>{service.labourHours || 0}</div>
                      </div>
                      <div>
                        <span style={{ color: '#bdbdbd', fontSize: '0.9rem' }}>Labour Cost:</span>
                        <div style={{ color: '#fff', fontWeight: 500 }}>{formatPrice(service.labourCost)}</div>
                      </div>
                      <div>
                        <span style={{ color: '#bdbdbd', fontSize: '0.9rem' }}>Parts Cost:</span>
                        <div style={{ color: '#fff', fontWeight: 500 }}>{formatPrice(service.partsCost)}</div>
                      </div>
                      <div>
                        <span style={{ color: '#bdbdbd', fontSize: '0.9rem' }}>Subtotal:</span>
                        <div style={{ color: '#fff', fontWeight: 500 }}>{formatPrice(service.subtotal)}</div>
                      </div>
                      <div>
                        <span style={{ color: '#bdbdbd', fontSize: '0.9rem' }}>VAT (20%):</span>
                        <div style={{ color: '#fff', fontWeight: 500 }}>{formatPrice(service.vat)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Parts Used */}
                  {service.parts && service.parts.length > 0 && (
                    <div>
                      <div style={{ 
                        color: '#fff', 
                        fontSize: '1.1rem', 
                        fontWeight: 600, 
                        marginBottom: 16 
                      }}>
                        🔧 Parts Used
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: 12
                      }}>
                        {service.parts.map((part: any, partIndex: number) => (
                          <div key={partIndex} style={{
                            background: '#232323',
                            padding: '16px',
                            borderRadius: 10,
                            border: '1px solid #333'
                          }}>
                            <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>
                              {part.name}
                            </div>
                            <div style={{ color: '#bdbdbd', fontSize: '0.9rem', marginBottom: 2 }}>
                              Part #: {part.partNumber}
                            </div>
                            <div style={{ color: '#bdbdbd', fontSize: '0.9rem', marginBottom: 2 }}>
                              Qty: {part.qty} × £{part.price}
                            </div>
                            <div style={{ color: '#ffd600', fontWeight: 600 }}>
                              Total: £{(part.qty * parseFloat(part.price || '0')).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Instructions */}
          {!loading && services.length === 0 && (
            <div style={{
              background: '#181818',
              borderRadius: 16,
              padding: '48px 32px',
              textAlign: 'center',
              boxShadow: '0 4px 24px #0006',
              border: '1px solid #232323'
            }}>
              <div style={{ color: '#ffd600', fontSize: '2rem', marginBottom: 16 }}>🔍</div>
              <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600, marginBottom: 12 }}>
                No Services Found
              </div>
              <div style={{ color: '#bdbdbd', fontSize: '1rem', lineHeight: 1.6, marginBottom: 24 }}>
                We couldn't find any completed services for your account.<br />
                This could mean you haven't had any services completed yet, or there might be a temporary issue.
              </div>
              
              {/* Contact information */}
              <div style={{
                background: '#232323',
                borderRadius: 12,
                padding: '20px',
                marginTop: '20px',
                border: '1px solid #444'
              }}>
                <div style={{ color: '#ffd600', fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>
                  📞 Need Help?
                </div>
                <div style={{ color: '#bdbdbd', fontSize: '0.95rem', marginBottom: 16 }}>
                  If you believe this is an error, please contact us or visit our service center.
                </div>
                <button
                  onClick={() => window.location.href = '/contact'}
                  style={{
                    background: '#ffd600',
                    color: '#111',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}
                >
                  Contact Us
                </button>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            cursor: 'zoom-out'
          }}
          onClick={closeExpandedImage}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeExpandedImage();
            }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001
            }}
          >
            ×
          </button>
          
          <img
            src={expandedImage}
            alt="Expanded"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              cursor: 'default'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default PastServicesPage; 
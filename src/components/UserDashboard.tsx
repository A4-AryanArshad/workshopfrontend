import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CarDetailsForm from './CarDetailsForm';
import { API_BASE_URL } from '../config';

interface Service {
  _id: string;
  label: string;
  sub: string;
  price: number;
  category: string;
  description?: string;
  labourHours?: number;
  labourCost?: number;
}

interface CartItem {
  service: Service;
  quantity: number;
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showCarForm, setShowCarForm] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch services
        const servicesResponse = await fetch(`${API_BASE_URL}/api/services`);
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          console.log('🔧 Services data received:', servicesData);
          console.log('🔧 Looking for "plug" service:', servicesData.find((s: any) => s.label === 'plug'));
          
          // Debug: Check all services for labour data
          servicesData.forEach((service: any, index: number) => {
            if (service.label === 'plug') {
              console.log('🔧 PLUG SERVICE DETAILS:', {
                label: service.label,
                price: service.price,
                labourHours: service.labourHours,
                labourCost: service.labourCost,
                total: service.price + (service.labourHours * (service.labourCost || 10))
              });
            }
          });
          setServices(servicesData);
        }
      } catch (err) {
        setError('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Maintenance': return '#28a745';
      case 'Repairs': return '#dc3545';
      case 'Diagnostics': return '#17a2b8';
      case 'Inspection': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const addToCart = (service: Service) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.service._id === service._id);
      if (existingItem) {
        return prevCart.map(item =>
          item.service._id === service._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { service, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (serviceId: string) => {
    setCart(prevCart => prevCart.filter(item => item.service._id !== serviceId));
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(serviceId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.service._id === serviceId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const servicePrice = item.service.price;
      const labourCost = item.service.labourHours ? (item.service.labourHours * (item.service.labourCost || 10)) : 0;
      const totalItemPrice = servicePrice + labourCost;
      return total + (totalItemPrice * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', 'Maintenance', 'Repairs', 'Diagnostics', 'Inspection'];

  const handleCheckout = async (carDetails: any) => {
    if (cart.length === 0) return;

    setCheckoutLoading(true);
    try {
      const userEmail = localStorage.getItem('userEmail');
      const userName = localStorage.getItem('userName') || 'Customer';

      const response = await fetch(`${API_BASE_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: cart,
          customerEmail: userEmail,
          customerName: userName,
          carDetails: carDetails
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        
        // Save complete booking data to localStorage for immediate creation after payment
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName') || 'Customer';
        
        const bookingData = {
          cart: cart,
          carDetails: carDetails,
          userEmail: userEmail,
          userName: userName,
          timestamp: Date.now()
        };
        
        localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
        console.log('💾 Saved pending booking data:', bookingData);
        
        // Save cart and car details to localStorage before redirecting
        localStorage.setItem('checkoutCart', JSON.stringify(cart));
        localStorage.setItem('checkoutCarDetails', JSON.stringify(carDetails));
        
        // Also save to sessionStorage as backup
        sessionStorage.setItem('checkoutCart', JSON.stringify(cart));
        sessionStorage.setItem('checkoutCarDetails', JSON.stringify(carDetails));
        
        // Also save to a more persistent storage method
        try {
          // Use a custom key that's less likely to be cleared
          localStorage.setItem('_mechanics_cart', JSON.stringify(cart));
          localStorage.setItem('_mechanics_carDetails', JSON.stringify(carDetails));
          
          // Also try to encode in URL as fallback
          const cartParam = encodeURIComponent(JSON.stringify(cart));
          const carParam = encodeURIComponent(JSON.stringify(carDetails));
          
          // Store these in sessionStorage for URL fallback
          sessionStorage.setItem('_url_cart', cartParam);
          sessionStorage.setItem('_url_carDetails', carParam);
        } catch (e) {
          console.log('⚠️ Could not save to persistent storage:', e);
        }
        
        console.log('💾 Saved to multiple storage locations:', {
          cart: cart,
          carDetails: carDetails
        });
        
        // Debug: Check cart structure
        console.log('🔍 Cart structure validation:');
        cart.forEach((item, index) => {
          console.log(`📦 Item ${index}:`, {
            service: item.service,
            quantity: item.quantity,
            price: item.service?.price,
            label: item.service?.label
          });
        });
        
        // Redirect to Stripe checkout
        window.location.href = url;
      } else {
        const errorData = await response.json();
        alert('Checkout failed: ' + errorData.error);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
      setShowCarForm(false);
    }
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) {
      alert('Your cart is empty. Please add some services first.');
      return;
    }
    setShowCarForm(true);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ background: '#111', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#fff', fontSize: '1.2rem' }}>Loading services...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div style={{ background: '#111', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#dc3545', fontSize: '1.2rem', textAlign: 'center' }}>
            <div>Error: {error}</div>
            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                background: '#ffd600', 
                color: '#111', 
                border: 'none', 
                borderRadius: '8px', 
                padding: '12px 24px', 
                marginTop: '16px', 
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <style>
        {`
          @keyframes shine {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          }
        `}
      </style>
      <div id="use1" style={{ background: '#111', minHeight: '100vh', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 style={{ color: '#fff', fontWeight: '700', fontSize: '2.5rem', marginBottom: '16px' }}>
              Service Catalog
            </h1>
            <p style={{ color: '#bdbdbd', fontSize: '1.1rem', marginBottom: '24px' }}>
              Browse our comprehensive range of car services
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => navigate('/dashboard/past-services')}
                style={{ 
                  background: '#ffd600', 
                  color: '#111', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '12px 24px', 
                  cursor: 'pointer',
                  fontWeight: '600',
                  minWidth: '200px'
                }}
              >
                📋 View My Past Services
              </button>
              <button 
                onClick={() => setShowCart(!showCart)}
                style={{ 
                  background: cart.length > 0 ? '#28a745' : '#232323', 
                  color: '#fff', 
                  border: '1px solid #444',
                  borderRadius: '8px', 
                  padding: '12px 24px', 
                  cursor: 'pointer',
                  fontWeight: '600',
                  minWidth: '200px'
                }}
              >
                🛒 Cart ({getCartItemCount()})
              </button>
            </div>
          </div>



          {/* Shopping Cart */}
          {showCart && (
            <div style={{ 
              background: '#181818', 
              borderRadius: '16px', 
              padding: '24px', 
              marginBottom: '32px',
              boxShadow: '0 4px 24px #0006',
              border: '1px solid #232323'
            }}>
              <h2 style={{ color: '#ffd600', fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px' }}>
                Shopping Cart ({getCartItemCount()} items)
              </h2>
              
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#bdbdbd', padding: '20px' }}>
                  Your cart is empty. Add some services to get started!
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.service._id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      background: '#232323',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', marginBottom: '4px' }}>
                          {item.service.label}
                        </h3>
                        <p style={{ color: '#bdbdbd', fontSize: '0.9rem' }}>
                          {item.service.sub}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                          <span style={{ color: '#ffd700', fontSize: '0.85rem' }}>
                            💰 Service Charge: £{item.service.price}
                          </span>
                          {item.service.labourHours && item.service.labourHours > 0 ? (
                            <span style={{ color: '#ffd700', fontSize: '0.85rem' }}>
                              🔧 Labour Charge: £{(item.service.labourHours * (item.service.labourCost || 10)).toFixed(2)}
                            </span>
                          ) : (
                            <span style={{ color: '#4CAF50', fontSize: '0.85rem' }}>
                              ✅ Labour Included
                            </span>
                          )}
                        </div>
                        {item.service.labourHours && item.service.labourHours > 0 && (
                          <p style={{ color: '#ffd700', fontSize: '0.85rem', fontWeight: '600', marginTop: '4px' }}>
                            Total: £{(item.service.price + (item.service.labourHours * (item.service.labourCost || 10))).toFixed(2)}
                          </p>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                          onClick={() => updateQuantity(item.service._id, item.quantity - 1)}
                          style={{
                            background: '#444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            width: '32px',
                            height: '32px',
                            cursor: 'pointer',
                            fontSize: '18px'
                          }}
                        >
                          -
                        </button>
                        <span style={{ color: '#fff', fontWeight: '600', minWidth: '30px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.service._id, item.quantity + 1)}
                          style={{
                            background: '#444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            width: '32px',
                            height: '32px',
                            cursor: 'pointer',
                            fontSize: '18px'
                          }}
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.service._id)}
                          style={{
                            background: '#dc3545',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px',
                    background: '#232323',
                    borderRadius: '8px',
                    marginTop: '20px'
                  }}>
                    <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600' }}>
                      Total: £{getCartTotal().toFixed(2)}
                    </div>
                    <button
                      onClick={handleCheckoutClick}
                      disabled={checkoutLoading}
                      style={{
                        background: '#ffd600',
                        color: '#111',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 32px',
                        cursor: checkoutLoading ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '1.1rem',
                        opacity: checkoutLoading ? 0.7 : 1
                      }}
                    >
                      {checkoutLoading ? 'Processing...' : '💳 Proceed to Checkout'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Search and Filter */}
          <div style={{ 
            background: '#181818', 
            borderRadius: '16px', 
            padding: '24px', 
            marginBottom: '32px',
            boxShadow: '0 4px 24px #0006'
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '250px',
                  background: '#111',
                  color: '#eaeaea',
                  border: '2px solid #ffd600',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>
            
            {/* Category Filter */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    background: selectedCategory === category ? '#ffd600' : '#232323',
                    color: selectedCategory === category ? '#111' : '#fff',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '0.9rem'
                  }}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Services Section */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ color: '#ffd600', fontSize: '2rem', fontWeight: '700', marginBottom: '24px' }}>
              Available Services ({filteredServices.length})
            </h2>
            
            {filteredServices.length === 0 ? (
              <div style={{ 
                background: '#181818', 
                borderRadius: '16px', 
                padding: '48px 24px', 
                textAlign: 'center',
                color: '#bdbdbd'
              }}>
                No services found matching your criteria.
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                gap: '24px' 
              }}>
                                {filteredServices.map((service) => (
                  <div key={service._id} style={{
                    background: 'linear-gradient(145deg, #1a1a1a, #232323)',
                    borderRadius: '20px',
                    padding: '28px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(255, 215, 0, 0.1)',
                    border: '2px solid #333',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(255, 215, 0, 0.2)';
                    e.currentTarget.style.borderColor = '#ffd700';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(255, 215, 0, 0.1)';
                    e.currentTarget.style.borderColor = '#333';
                  }}
                  >
                    {/* Service Header with Enhanced Styling */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      marginBottom: '24px',
                      position: 'relative'
                    }}>
                      <div style={{ flex: 1, paddingRight: '20px' }}>
                        <h3 style={{ 
                          color: '#fff', 
                          fontSize: '1.5rem', 
                          fontWeight: '700', 
                          marginBottom: '12px',
                          textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
                        }}>
                          {service.label}
                        </h3>
                        <div style={{
                          background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                          color: '#000',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          display: 'inline-block',
                          marginBottom: '12px',
                          boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
                        }}>
                          {service.sub}
                        </div>
                        {service.description && (
                          <p style={{ 
                            color: '#bdbdbd', 
                            fontSize: '0.95rem', 
                            lineHeight: '1.6',
                            marginBottom: '0',
                            fontStyle: 'italic'
                          }}>
                            {service.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Enhanced Price Display */}
                      <div style={{ 
                        textAlign: 'right', 
                        minWidth: '140px',
                        position: 'relative'
                      }}>
                        {/* Main Total Price */}
                        <div style={{ 
                          background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                          color: '#000',
                          padding: '16px 20px',
                          borderRadius: '16px',
                          fontSize: '1.6rem',
                          fontWeight: '800',
                          marginBottom: '12px',
                          boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                        }}>
                          £{service.labourHours ? (service.price + (service.labourHours * (service.labourCost || 10))).toFixed(2) : service.price}
                        </div>
                        
                        {/* Category Badge */}
                        <div style={{
                          background: getCategoryColor(service.category),
                          color: '#fff',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          display: 'inline-block',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                        }}>
                          {service.category}
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Pricing Breakdown */}
                    <div style={{
                      background: 'linear-gradient(145deg, #2a2a2a, #1f1f1f)',
                      borderRadius: '16px',
                      padding: '24px',
                      marginBottom: '20px',
                      border: '2px solid #444',
                      position: 'relative'
                    }}>
                      <div style={{ 
                        color: '#ffd700', 
                        fontSize: '1.2rem', 
                        fontWeight: '700', 
                        marginBottom: '20px',
                        textAlign: 'center',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
                      }}>
                        💰 Pricing Breakdown
                      </div>
                      
                      {/* Service and Labour Cards */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '16px',
                        marginBottom: '20px'
                      }}>
                        <div style={{
                          background: 'linear-gradient(145deg, #1a1a1a, #232323)',
                          padding: '20px',
                          borderRadius: '12px',
                          textAlign: 'center',
                          border: '2px solid #444',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                        }}>
                          <div style={{ 
                            color: '#ffd700', 
                            fontSize: '1rem', 
                            marginBottom: '8px',
                            fontWeight: '600'
                          }}>
                            🔧 Service Fee
                          </div>
                          <div style={{ 
                            color: '#fff', 
                            fontWeight: '700', 
                            fontSize: '1.3rem',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
                          }}>
                            £{service.price}
                          </div>
                        </div>
                        
                        <div style={{
                          background: 'linear-gradient(145deg, #1a1a1a, #232323)',
                          padding: '20px',
                          borderRadius: '12px',
                          textAlign: 'center',
                          border: '2px solid #444',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                        }}>
                          <div style={{ 
                            color: '#ffd700', 
                            fontSize: '1rem', 
                            marginBottom: '8px',
                            fontWeight: '600'
                          }}>
                            ⏱️ Labour Charges
                          </div>
                          <div style={{ 
                            color: '#fff', 
                            fontWeight: '700', 
                            fontSize: '1.3rem',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
                          }}>
                            {service.labourHours ? `£${(service.labourHours * (service.labourCost || 10)).toFixed(2)}` : 'Included'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Total Amount Display */}
                      <div style={{
                        background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                        color: '#000',
                        padding: '20px',
                        borderRadius: '16px',
                        textAlign: 'center',
                        fontWeight: '800',
                        fontSize: '1.4rem',
                        boxShadow: '0 6px 24px rgba(255, 215, 0, 0.4)',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '-50%',
                          left: '-50%',
                          width: '200%',
                          height: '200%',
                          background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                          animation: 'shine 3s infinite'
                        }} />
                        💰 TOTAL AMOUNT: £{service.labourHours ? (service.price + (service.labourHours * (service.labourCost || 10))).toFixed(2) : service.price}
                      </div>
                      
                      {/* Enhanced Breakdown Summary */}
                      {service.labourHours && (
                        <div style={{
                          background: 'linear-gradient(145deg, #1a1a1a, #232323)',
                          padding: '16px',
                          borderRadius: '12px',
                          marginTop: '16px',
                          textAlign: 'center',
                          border: '2px solid #444'
                        }}>
                          <div style={{ 
                            color: '#ffd700', 
                            fontSize: '1rem', 
                            fontWeight: '700', 
                            marginBottom: '12px',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
                          }}>
                            📋 Cost Breakdown
                          </div>
                          <div style={{ 
                            color: '#bdbdbd', 
                            fontSize: '0.9rem', 
                            lineHeight: '1.6',
                            background: '#1a1a1a',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #333'
                          }}>
                            <strong>Service Fee:</strong> £{service.price}<br/>
                            <strong>Labour:</strong> {service.labourHours}h × £{service.labourCost || 10}/h = £{(service.labourHours * (service.labourCost || 10)).toFixed(2)}<br/>
                            <span style={{ 
                              color: '#ffd700', 
                              fontWeight: '700',
                              fontSize: '1.1rem',
                              display: 'block',
                              marginTop: '8px',
                              padding: '8px',
                              background: '#000',
                              borderRadius: '6px'
                            }}>
                              🎯 Total: £{(service.price + (service.labourHours * (service.labourCost || 10))).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Enhanced Labour Rate Note */}
                      {service.labourHours && (
                        <div style={{
                          color: '#bdbdbd',
                          fontSize: '0.85rem',
                          textAlign: 'center',
                          marginTop: '16px',
                          fontStyle: 'italic',
                          padding: '12px',
                          background: '#1a1a1a',
                          borderRadius: '8px',
                          border: '1px solid #333'
                        }}>
                          ⚡ Labour charges are calculated at £{service.labourCost || 10}/hour
                        </div>
                      )}
                    </div>
                    
                    {/* Enhanced Add to Cart Button */}
                    <button
                      onClick={() => addToCart(service)}
                      style={{
                        background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '16px 28px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        width: '100%',
                        fontSize: '1.1rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 24px rgba(255, 215, 0, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 215, 0, 0.4)';
                      }}
                    >
                      🛒 Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>


        </div>
      </div>
      <Footer />
      
      {/* Car Details Form Modal */}
      <CarDetailsForm
        isVisible={showCarForm}
        onSubmit={handleCheckout}
        onCancel={() => setShowCarForm(false)}
      />
    </>
  );
};

export default UserDashboard; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CarDetailsForm from './CarDetailsForm';

interface Service {
  _id: string;
  label: string;
  sub: string;
  price: number;
  category: string;
  description?: string;
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
        const servicesResponse = await fetch('https://workshop-backend-six.vercel.app/api/services');
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
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
    return cart.reduce((total, item) => total + (item.service.price * item.quantity), 0);
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

      const response = await fetch('https://workshop-backend-six.vercel.app/api/create-checkout-session', {
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
                Shopping Cart ({cart.length} items)
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
                          {item.service.sub} - £{item.service.price}
                        </p>
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
                    background: '#181818',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 24px #0006',
                    border: '1px solid #232323'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '600', marginBottom: '8px' }}>
                          {service.label}
                        </h3>
                        <p style={{ color: '#bdbdbd', fontSize: '1rem', marginBottom: '12px' }}>
                          {service.sub}
                        </p>
                        {service.description && (
                          <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.5' }}>
                            {service.description}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '80px' }}>
                        <div style={{ 
                          color: '#ffd600', 
                          fontSize: '1.5rem', 
                          fontWeight: '700' 
                        }}>
                          £{service.price}
                        </div>
                        <div style={{
                          background: getCategoryColor(service.category),
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          display: 'inline-block',
                          marginTop: '8px'
                        }}>
                          {service.category}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => addToCart(service)}
                      style={{
                        background: '#ffd600',
                        color: '#111',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        width: '100%',
                        fontSize: '1rem'
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
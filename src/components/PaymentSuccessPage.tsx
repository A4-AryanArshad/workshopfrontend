import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [bookingCreated, setBookingCreated] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [hasAttemptedBooking, setHasAttemptedBooking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const processedSessionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    console.log('🔍 PaymentSuccessPage useEffect triggered');
    
    const sessionIdParam = searchParams.get('session_id');
    console.log('🔍 Session ID param:', sessionIdParam);
    
    if (sessionIdParam) {
      console.log('🎯 Session ID found, creating booking directly...');
      createDirectBooking(sessionIdParam);
    } else {
      console.log('⚠️ No session ID found in URL params');
    }
  }, [searchParams]);

  const createDirectBooking = async (sessionId: string) => {
    console.log('🚀 createDirectBooking called with sessionId:', sessionId);
    
    // FRONTEND-SIDE DUPLICATE PREVENTION: Check if we've already processed this session
    if (processedSessionsRef.current.has(sessionId)) {
      console.log('🚫 Session already processed, skipping duplicate call');
      return;
    }
    
    // FRONTEND-SIDE DUPLICATE PREVENTION: Check if we're already processing
    if (isCreating) {
      console.log('🚫 Already creating booking, skipping duplicate call');
      return;
    }
    
    // Mark this session as being processed immediately
    processedSessionsRef.current.add(sessionId);
    setIsCreating(true);
    setBookingError('');
    
    try {
      // Get pending booking data from localStorage
      const pendingBookingData = localStorage.getItem('pendingBooking');
      
      if (!pendingBookingData) {
        console.error('❌ No pending booking data found in localStorage');
        setBookingError('No booking data found. Please try again.');
        setIsCreating(false);
        return;
      }
      
      const bookingData = JSON.parse(pendingBookingData);
      console.log('📦 Retrieved booking data:', bookingData);
      
      // Get the first service from cart
      const firstService = bookingData.cart[0];
      const serviceDetails = {
        label: firstService.service.label,
        description: firstService.service.sub,
        price: firstService.service.price * firstService.quantity
      };
      
      console.log('📦 Service details:', serviceDetails);
      
      // Call the direct booking endpoint
      const response = await fetch('https://workshop-backend-six.vercel.app/api/create-booking-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          userEmail: bookingData.userEmail,
          userName: bookingData.userName,
          carDetails: bookingData.carDetails,
          serviceDetails: serviceDetails
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Direct booking created successfully:', result);
        setBookingCreated(true);
        
        // Clean up localStorage
        localStorage.removeItem('pendingBooking');
        localStorage.removeItem('checkoutCart');
        localStorage.removeItem('checkoutCarDetails');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to create direct booking:', errorData);
        setBookingError('Failed to create booking: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error creating direct booking:', error);
      setBookingError('Network error while creating booking');
    } finally {
      setIsCreating(false);
    }
  };

  const createBookingFromSession = async (sessionId: string) => {
    console.log('🚀 createBookingFromSession called with sessionId:', sessionId);
    
    // Check if we've already processed this session (using ref for immediate protection)
    if (processedSessionsRef.current.has(sessionId)) {
      console.log('⚠️ Session already processed, skipping...');
      setBookingCreated(true);
      return;
    }
    
    console.log('✅ Proceeding with booking creation...');
    setIsCreating(true);
    try {
      console.log('🎯 Creating booking from session:', sessionId);
      
      // Get user info from localStorage
      const userEmail = localStorage.getItem('userEmail');
      const userName = localStorage.getItem('userName') || 'Customer';
      
      console.log('👤 User info:', { email: userEmail, name: userName });
      
      if (!userEmail) {
        console.error('❌ No user email found');
        setBookingError('User information not found. Please contact support.');
        return;
      }
      
          // Try to get car details and service details from localStorage
    let carDetails = null;
    let serviceDetails = null;
    
    try {
      // Try multiple storage locations
      const storedCarDetails = localStorage.getItem('checkoutCarDetails') || 
                               localStorage.getItem('_mechanics_carDetails') ||
                               sessionStorage.getItem('checkoutCarDetails');
      
      const storedCart = localStorage.getItem('checkoutCart') || 
                         localStorage.getItem('_mechanics_cart') ||
                         sessionStorage.getItem('checkoutCart');
      
      if (storedCarDetails) {
        carDetails = JSON.parse(storedCarDetails);
        console.log('🚗 Retrieved car details:', carDetails);
      }
      
      if (storedCart) {
        const cart = JSON.parse(storedCart);
        if (cart.length > 0) {
          // Get the first service from cart
          const firstService = cart[0];
          serviceDetails = {
            label: firstService.service.label,
            description: firstService.service.sub,
            price: firstService.service.price * firstService.quantity
          };
          console.log('📦 Retrieved service details:', serviceDetails);
        }
      }
    } catch (error) {
      console.error('⚠️ Could not retrieve stored data:', error);
    }
    
    // Use the new session-based endpoint with actual data
    console.log('📞 Calling session-based booking endpoint...');
    
    const response = await fetch('https://workshop-backend-six.vercel.app/api/create-booking-from-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: sessionId,
        userEmail: userEmail,
        userName: userName,
        carDetails: carDetails,
        serviceDetails: serviceDetails
      }),
    });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Booking created successfully:', result);
        setBookingCreated(true);
        
        // Clean up localStorage
        localStorage.removeItem('checkoutCart');
        localStorage.removeItem('checkoutCarDetails');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to create booking:', errorData);
        
        // Check if it's a duplicate (which is actually success)
        if (errorData.isDuplicate) {
          setBookingCreated(true);
          console.log('✅ Duplicate detected - booking already exists');
        } else {
          setBookingError('Failed to create booking: ' + (errorData.error || 'Unknown error'));
        }
      }
          } catch (error) {
        console.error('❌ Error creating booking:', error);
        setBookingError('Network error while creating booking');
      } finally {
        setIsCreating(false);
        setIsProcessing(false); // Reset processing state
      }
    };

  const handleViewServices = () => {
    navigate('/dashboard/past-services');
  };

  const handleBackToCatalog = () => {
    navigate('/user-dashboard');
  };

  return (
    <>
      <Navbar />
      <div  id="ret"style={{ background: '#111', minHeight: '100vh', padding: '48px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          {/* Success Icon */}
          <div style={{ 
            background: '#28a745', 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 32px',
            fontSize: '60px'
          }}>
            ✅
          </div>

          {/* Success Message */}
          <h1 style={{ color: '#28a745', fontSize: '2.5rem', fontWeight: '700', marginBottom: '24px' }}>
            Payment Successful!
          </h1>
          
          <p style={{ color: '#bdbdbd', fontSize: '1.2rem', marginBottom: '32px', lineHeight: '1.6' }}>
            Thank you for your payment. Your service booking has been confirmed and will appear in your past services.
          </p>

          {/* Booking Status */}
          {isCreating && (
            <div style={{ 
              background: '#ffd600', 
              color: '#111', 
              padding: '16px 24px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              fontWeight: '600'
            }}>
              ⏳ Creating your booking... Please wait
            </div>
          )}
          
          {bookingCreated && (
            <div style={{ 
              background: '#28a745', 
              color: '#fff', 
              padding: '16px 24px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              fontWeight: '600'
            }}>
              ✅ Basic Booking Created Successfully! 
              <br />
              <small style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                (Service details will be updated by our team)
              </small>
            </div>
          )}
          
          {bookingError && (
            <div style={{ 
              background: '#dc3545', 
              color: '#fff', 
              padding: '16px 24px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              fontWeight: '600'
            }}>
              ❌ {bookingError}
            </div>
          )}

          {sessionId && (
            <div style={{ 
              background: '#181818', 
              borderRadius: '12px', 
              padding: '20px', 
              marginBottom: '32px',
              border: '1px solid #232323'
            }}>
              <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
                <strong>Transaction ID:</strong> {sessionId}
              </p>
            </div>
          )}

          {/* Next Steps */}
          <div style={{ 
            background: '#181818', 
            borderRadius: '16px', 
            padding: '32px', 
            marginBottom: '32px',
            border: '1px solid #232323'
          }}>
            <h3 style={{ color: '#ffd600', fontSize: '1.3rem', fontWeight: '600', marginBottom: '20px' }}>
              What happens next?
            </h3>
            <div style={{ textAlign: 'left', color: '#bdbdbd', lineHeight: '1.8' }}>
              <p>• Your booking has been added to our system</p>
              <p>• Our team will review your service request</p>
              <p>• You'll receive a confirmation email shortly</p>
              <p>• We'll contact you to schedule your appointment</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleViewServices}
              style={{
                background: '#ffd600',
                color: '#111',
                border: 'none',
                borderRadius: '8px',
                padding: '16px 32px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1.1rem'
              }}
            >
              📋 View My Services
            </button>
            
            <button
              onClick={handleBackToCatalog}
              style={{
                background: '#232323',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '8px',
                padding: '16px 32px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1.1rem'
              }}
            >
              🛒 Book More Services
            </button>
          </div>

          {/* Contact Info */}
          <div style={{ 
            marginTop: '48px', 
            padding: '24px', 
            background: '#181818', 
            borderRadius: '12px',
            border: '1px solid #232323'
          }}>
            <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
              Have questions? Contact us at{' '}
              <span style={{ color: '#ffd600' }}>info@mechanics.com</span> or call{' '}
              <span style={{ color: '#ffd600' }}>+44 123 456 7890</span>
            </p>
          </div>
          
          {/* Debug Section */}
          <div style={{ 
            marginTop: '24px', 
            padding: '24px', 
            background: '#232323', 
            borderRadius: '12px',
            border: '1px solid #444'
          }}>
            <h4 style={{ color: '#ffd600', marginBottom: '16px' }}>🔍 Debug Information</h4>
            <button
              onClick={() => {
                console.log('🔍 Manual storage check:');
                console.log('📦 checkoutCart:', localStorage.getItem('checkoutCart'));
                console.log('🚗 checkoutCarDetails:', localStorage.getItem('checkoutCarDetails'));
                console.log('📦 _mechanics_cart:', localStorage.getItem('_mechanics_cart'));
                console.log('🚗 _mechanics_carDetails:', localStorage.getItem('_mechanics_carDetails'));
                console.log('📦 session checkoutCart:', sessionStorage.getItem('checkoutCart'));
                console.log('🚗 session checkoutCarDetails:', sessionStorage.getItem('checkoutCarDetails'));
                alert('Check browser console for storage data');
              }}
              style={{
                background: '#444',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Check Storage Data
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentSuccessPage; 
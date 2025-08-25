import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

interface BookingWithMessages {
  _id: string;
  customer: {
    name: string;
    email: string;
  };

  service: {
    label: string;
    sub: string;
  };
  date: string;
  time: string;
  status: string;
  unreadMessageCount: number;
  lastMessage?: {
    message: string;
    senderName: string;
    createdAt: string;
  };
}

interface MessagesPageProps {
  userEmail?: string;
  userName?: string;
}

const MessagesPage: React.FC<MessagesPageProps> = ({ userEmail, userName }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithMessages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Reverted: no car number filter on client page
  // const [carSearch, setCarSearch] = useState('');

  // Get user info from localStorage
  const currentUserEmail = userEmail || localStorage.getItem('userEmail');
  const currentUserName = userName || localStorage.getItem('userName') || 'Customer';

  useEffect(() => {
    if (currentUserEmail) {
      fetchBookingsWithMessages();
    } else {
      setLoading(false);
    }
  }, [currentUserEmail]);

  // Auto-refresh bookings every 10 seconds to show recent messages at the top
  useEffect(() => {
    if (currentUserEmail) {
      const interval = setInterval(() => {
        fetchBookingsWithMessages();
      }, 10000); // Refresh every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [currentUserEmail]);

  // Manual refresh function
  const refreshBookings = async () => {
    await fetchBookingsWithMessages();
  };

  const fetchBookingsWithMessages = async () => {
    try {
      setLoading(true);
              const response = await fetch(`${API_BASE_URL}/api/user/${currentUserEmail}/bookings-with-messages`);
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.bookings);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      setError('Error fetching bookings');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4CAF50';
      case 'in-progress':
        return '#ffd700';
      case 'confirmed':
        return '#2196F3';
      case 'cancelled':
        return '#f44336';
      default:
        return '#888';
    }
  };

  // Show all messages but prioritize unread ones at the top
  const filteredBookings = bookings
    .sort((a, b) => {
      // Sort by unread count first (highest first)
      if (b.unreadMessageCount !== a.unreadMessageCount) {
        return b.unreadMessageCount - a.unreadMessageCount;
      }
      // Then by most recent message
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
      }
      // Bookings with messages come first
      if (a.lastMessage && !b.lastMessage) return -1;
      if (!a.lastMessage && b.lastMessage) return 1;
      return 0;
    });

  // Debug: Log the current state of bookings and their unread counts
  console.log('🔍 Current bookings with unread counts:', 
    filteredBookings.map(b => ({
      service: b.service.label,
      unreadCount: b.unreadMessageCount,
      hasPriority: b.unreadMessageCount > 0
    }))
  );

  // Test function to manually mark messages as read (for debugging)
  const testMarkAsRead = async (bookingId: string) => {
    try {
      console.log('🧪 Testing mark as read for booking:', bookingId);
      
              const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/messages/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: currentUserEmail
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🧪 Test response:', data);
        
        // Update the local state
        setBookings(prevBookings => 
          prevBookings.map(b => 
            b._id === bookingId 
              ? { ...b, unreadMessageCount: data.updatedUnreadCount || 0 }
              : b
          )
        );
      } else {
        console.error('🧪 Test failed:', response.status);
      }
    } catch (error) {
      console.error('🧪 Test error:', error);
    }
  };

  // Test function to check current message status (for debugging)
  const testCheckMessages = async (bookingId: string) => {
    try {
      console.log('🔍 Checking messages for booking:', bookingId);
      
              const response = await fetch(`${API_BASE_URL}/api/test-messages/${bookingId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Message status:', data);
      } else {
        console.error('🔍 Check failed:', response.status);
      }
    } catch (error) {
      console.error('🔍 Check error:', error);
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const messageTime = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - messageTime.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }
  };

  // Mark messages as read when user clicks on a booking
  const handleMessageClick = async (booking: BookingWithMessages) => {
    try {
      console.log('🖱️ Clicking on booking:', booking._id, 'Current unread count:', booking.unreadMessageCount);
      
      // Mark messages as read for this booking
              const response = await fetch(`${API_BASE_URL}/api/bookings/${booking._id}/messages/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: currentUserEmail
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📖 Messages marked as read. Response data:', data);
        
        // Update local state to reflect read status using the actual updated count
        setBookings(prevBookings => {
          const updatedBookings = prevBookings.map(b => 
            b._id === booking._id 
              ? { ...b, unreadMessageCount: data.updatedUnreadCount || 0 }
              : b
          );
          console.log('🔄 Updated bookings state:', updatedBookings.map(b => ({
            id: b._id,
            service: b.service.label,
            unreadCount: b.unreadMessageCount
          })));
          return updatedBookings;
        });
        
        // Force immediate re-render by updating state again
        setTimeout(() => {
          setBookings(prevBookings => {
            console.log('🔄 Final state after timeout:', prevBookings.map(b => ({
              id: b._id,
              service: b.service.label,
              unreadCount: b.unreadMessageCount
            })));
            return prevBookings;
          });
        }, 100);
      } else {
        console.error('❌ Failed to mark messages as read:', response.status);
        const errorData = await response.json();
        console.error('❌ Error details:', errorData);
      }
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
    }

    // Navigate to the booking messages page
    navigate(`/booking-messages/${booking._id}`);
  };

  if (!currentUserEmail) {
    return (
      <>
        <Navbar />
        <div style={{ background: '#111', minHeight: '100vh', padding: '48px 24px' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', color: '#fff' }}>
            <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2.2rem', marginBottom: '24px' }}>
              Messages
            </h1>
            <div style={{ color: '#bdbdbd', fontSize: '1.15rem', marginBottom: '32px' }}>
              Please log in to view your booking messages
            </div>
            <Link 
              to="/login" 
              style={{ 
                background: '#ffd700', 
                color: '#111', 
                padding: '12px 24px', 
                borderRadius: '8px', 
                textDecoration: 'none', 
                fontWeight: 600,
                display: 'inline-block'
              }}
            >
              Login to Continue
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div id="mes"style={{ background: '#111', minHeight: '100vh', padding: '48px 24px' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', color: '#fff' }}>
            <div>Loading your bookings...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div id="mes" style={{ background: '#111', minHeight: '100vh', padding: 0 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2.2rem', marginBottom: '8px' }}>
                Booking Messages
              </h1>
              <div style={{ color: '#bdbdbd', fontSize: '1.15rem', marginBottom: '12px' }}>
                {filteredBookings.length === 0 
                  ? 'You have no bookings yet. Book a service to start messaging with our staff.'
                  : `You have ${filteredBookings.length} booking${filteredBookings.length !== 1 ? 's' : ''} with message history. Unread messages are prioritized at the top.`
                }
              </div>

            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {localStorage.getItem('role') === 'admin' && (
                <button 
                  onClick={() => window.location.href = '/dashboard/admin-messages'}
                  style={{
                    background: '#ffd700',
                    color: '#111',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  💬 Admin Messages
                </button>
              )}
            </div>
          </div>

          {error && (
            <div style={{ 
              background: '#ff4444', 
              color: '#fff', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {filteredBookings.length === 0 ? (
            <div style={{ 
              background: '#232323', 
              padding: '40px', 
              borderRadius: '12px', 
              textAlign: 'center',
              color: '#bdbdbd',
              border: '1px solid #333'
            }}>
              <div style={{ marginBottom: '20px', fontSize: '1.2rem' }}>
                No messages found
              </div>
              <div style={{ marginBottom: '20px', fontSize: '1rem', color: '#888' }}>
                You have no bookings with messages yet. Book a service to get started!
              </div>
              <Link 
                to="/user-dashboard" 
                style={{ 
                  background: '#ffd700', 
                  color: '#111', 
                  padding: '12px 24px', 
                  borderRadius: '8px', 
                  textDecoration: 'none', 
                  fontWeight: 600,
                  display: 'inline-block'
                }}
              >
                Back to Dashboard →
              </Link>
            </div>
          ) : (
            <div>
              {/* Unread Messages Section */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#ffd700', marginBottom: '16px', fontSize: '1.3rem' }}>
                  💬 All Messages
                </h3>
                <div style={{ color: '#bdbdbd', fontSize: '0.9rem', marginBottom: '20px' }}>
                  All messages are shown with unread ones prioritized at the top
                </div>
                
                {/* Priority Legend */}
                <div style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  marginBottom: '20px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    background: '#1a1a1a',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #333'
                  }}>
                    <div style={{ 
                      background: '#ffd700', 
                      color: '#111', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '0.7rem',
                      fontWeight: '700'
                    }}>
                      🔥
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#fff' }}>Most Unread Messages</span>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    background: '#1a1a1a',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #333'
                  }}>
                    <div style={{ 
                      background: '#ff6b35', 
                      color: '#fff', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '0.7rem',
                      fontWeight: '700'
                    }}>
                      ⏰
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#fff' }}>Most Recent Activity</span>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    background: '#1a1a1a',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #333'
                  }}>
                    <div style={{ 
                      background: '#17a2b8', 
                      color: '#fff', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '0.8rem',
                      fontWeight: '700'
                    }}>
                      📬
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#fff' }}>Unread Messages</span>
                  </div>
                </div>
              </div>
              
              {filteredBookings.map((booking, index) => (
                <div 
                  key={booking._id}
                  style={{ 
                    background: '#232323', 
                    borderRadius: '14px', 
                    boxShadow: '0 2px 12px #0006', 
                    padding: '24px', 
                    marginBottom: '18px', 
                    color: '#fff',
                    border: `2px solid ${index === 0 && booking.unreadMessageCount > 0 ? '#ffd700' : '#333'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onClick={() => handleMessageClick(booking)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#ffd700';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = index === 0 && booking.unreadMessageCount > 0 ? '#ffd700' : '#333';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Priority Activity Indicator - Only show for unread messages */}
                  {index === 0 && booking.unreadMessageCount > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      left: '20px',
                      background: '#ffd700',
                      color: '#111',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      zIndex: 1
                    }}>
                      🔥 Top Priority
                    </div>
                  )}
                  
                  {/* Priority Indicator - Only show for unread messages */}
                  {index < 3 && booking.unreadMessageCount > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      background: index === 0 ? '#ffd700' : index === 1 ? '#ff6b35' : '#17a2b8',
                      color: index === 0 ? '#111' : '#fff',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      zIndex: 1
                    }}>
                      {index === 0 ? '🔥' : index === 1 ? '⏰' : '📬'}
                    </div>
                  )}
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <div style={{ 
                        fontWeight: 700, 
                        fontSize: '1.2rem', 
                        color: '#ffd700', 
                        marginBottom: '8px' 
                      }}>
                        {booking.service.label} - {booking.service.sub}
                      </div>
                      <div style={{ color: '#bdbdbd', fontSize: '1rem', marginBottom: '8px' }}>
                        {formatDate(booking.date)} at {formatTime(booking.time)}
                      </div>
                      <div style={{ 
                        color: '#fff', 
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span>Status:</span>
                        <span style={{ 
                          color: getStatusColor(booking.status),
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      {booking.unreadMessageCount > 0 && (
                        <div style={{ 
                          background: '#ff4444', 
                          color: '#fff', 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          marginBottom: '8px'
                        }}>
                          {booking.unreadMessageCount} new
                        </div>
                      )}
                      
                      {/* Conversation Activity Indicator */}
                      {booking.lastMessage ? (
                        <div style={{ 
                          background: '#17a2b8', 
                          color: '#fff', 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          marginBottom: '8px'
                        }}>
                          💬 Active
                        </div>
                      ) : (
                        <div style={{ 
                          background: '#666', 
                          color: '#fff', 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          marginBottom: '8px'
                        }}>
                          ⏸️ No messages
                        </div>
                      )}
                      
                                          <div style={{ 
                      color: '#888', 
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      fontWeight: 600
                    }}>
                      Click to view
                    </div>
                    
                    {/* Debug: Test buttons */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        testCheckMessages(booking._id);
                      }}
                      style={{
                        background: '#444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '0.7rem',
                        cursor: 'pointer',
                        marginTop: '4px',
                        marginRight: '4px'
                      }}
                    >
                    
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        testMarkAsRead(booking._id);
                      }}
                      style={{
                        background: '#666',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '0.7rem',
                        cursor: 'pointer',
                        marginTop: '4px'
                      }}
                    >
                 
                    </button>
                    </div>
                  </div>
                  
                  {/* Last Message Preview */}
                  {booking.lastMessage && (
                    <div style={{ 
                      background: '#1a1a1a', 
                      padding: '16px', 
                      borderRadius: '8px', 
                      marginTop: '16px',
                      borderLeft: `3px solid ${booking.unreadMessageCount > 0 ? '#ff4444' : '#4CAF50'}`
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <div style={{ color: '#888', fontSize: '0.8rem' }}>
                          Last message from <span style={{ color: '#ffd700', fontWeight: '600' }}>{booking.lastMessage.senderName}</span>
                        </div>
                        <div style={{ 
                          color: '#666', 
                          fontSize: '0.75rem',
                          background: '#333',
                          padding: '2px 8px',
                          borderRadius: '8px'
                        }}>
                          {formatRelativeTime(booking.lastMessage.createdAt)}
                        </div>
                      </div>
                      <div style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '8px', fontStyle: 'italic' }}>
                        "{booking.lastMessage.message.length > 60 
                          ? booking.lastMessage.message.substring(0, 60) + '...' 
                          : booking.lastMessage.message
                        }"
                      </div>
                    </div>
                  )}
                  
                  {/* No Messages Yet Message */}
                  {!booking.lastMessage && (
                    <div style={{ 
                      background: '#1a1a1a', 
                      padding: '16px', 
                      borderRadius: '8px', 
                      marginTop: '16px',
                      borderLeft: '3px solid #666',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: '#888', fontSize: '0.9rem' }}>
                        No messages yet. Start the conversation with our staff!
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default MessagesPage; 
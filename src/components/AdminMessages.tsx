import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useNavigate, useParams } from 'react-router-dom';

interface Message {
  _id: string;
  bookingId: string;
  senderName: string;
  senderEmail: string;
  senderType: 'customer' | 'admin';
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Booking {
  _id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  car?: {
    registration?: string;
  };
  service: {
    label: string;
    sub: string;
  };
  date: string;
  time: string;
  status: string;
  lastMessage?: {
    message: string;
    senderName: string;
    createdAt: string;
  };
  messageCount?: number;
  unreadCount?: number;
}

interface AdminMessagesProps {
  userEmail?: string;
  userName?: string;
}

const AdminMessages: React.FC = () => {
  console.log('🚀 AdminMessages component rendering, localStorage userEmail:', localStorage.getItem('userEmail'));

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [carSearch, setCarSearch] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  
  // Use useRef for interval and timeout management
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get user info from localStorage
  const userEmail = localStorage.getItem('userEmail');
  const currentUserEmail = userEmail;

  console.log('🚀 Component state initialized:', {
    userEmail,
    currentUserEmail,
    recentConversationsLength: recentConversations.length,
    bookingsLength: bookings.length,
    localStorageKeys: Object.keys(localStorage),
    userEmailType: typeof userEmail,
    userEmailTruthy: !!userEmail
  });

  // Function to fetch current user information
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⚠️ No token found, cannot fetch user info');
        return;
      }

      const response = await fetch('https://workshop-backend-six.vercel.app/api/current-user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Current user data fetched:', userData);
        setCurrentUserName(userData.name || 'Admin Staff');
      } else {
        console.log('⚠️ Failed to fetch user info, using default name');
        setCurrentUserName('Admin Staff');
      }
    } catch (error) {
      console.error('❌ Error fetching current user:', error);
      setCurrentUserName('Admin Staff');
    }
  };

  // Load data on component mount
  useEffect(() => {
    console.log('🔄 useEffect triggered, currentUserEmail:', currentUserEmail);
    console.log('🔄 useEffect triggered, userEmail prop:', userEmail);
    console.log('🔄 useEffect triggered, localStorage userEmail:', localStorage.getItem('userEmail'));
    console.log('🔄 useEffect triggered, recentConversations length:', recentConversations.length);
    console.log('🔄 useEffect triggered, bookings length:', bookings.length);
    
    // Fetch current user info first
    fetchCurrentUser();
    
    if (currentUserEmail) {
      console.log('✅ Fetching all bookings and conversations...');
      fetchAllBookings();
    } else {
      console.log('⚠️ No currentUserEmail, but loading data anyway for testing...');
      fetchAllBookings();
    }
  }, [currentUserEmail]);

    // Set up auto-refresh for this booking only if enabled
    useEffect(() => {
      // Clear any existing interval first
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }

      if (autoRefreshEnabled && selectedBooking) {
        refreshIntervalRef.current = setInterval(async () => {
          if (selectedBooking && !messagesLoading) { // Only refresh if not already loading
            await fetchMessages(selectedBooking._id);
            // Also refresh conversations to keep them updated
            await refreshConversations();
          }
        }, 5000);
      }
      
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
          refreshTimeoutRef.current = null;
        }
      };
    }, [autoRefreshEnabled, selectedBooking?._id]); // Only depend on the ID, not the entire object

    // Auto-refresh conversations every 10 seconds
    useEffect(() => {
      const conversationInterval = setInterval(async () => {
        if (recentConversations.length > 0) {
          await refreshConversations();
        }
      }, 10000);
      
      return () => clearInterval(conversationInterval);
    }, [recentConversations.length]);

    // Cleanup effect to prevent memory leaks and chat disappearance
    useEffect(() => {
      return () => {
        // Clear all intervals and timeouts when component unmounts
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
          refreshTimeoutRef.current = null;
        }
      };
    }, []);

    const fetchAllBookings = async () => {
      try {
        console.log('🚀 fetchAllBookings started');
        setLoading(true);
        
        // Fetch recent conversations (bookings with messages, sorted by recent activity)
        console.log('📞 Fetching recent conversations...');
        const conversationsResponse = await fetch('https://workshop-backend-six.vercel.app/api/admin/recent-conversations');
        console.log('📞 Recent conversations response status:', conversationsResponse.status);
        console.log('📞 Recent conversations response ok:', conversationsResponse.ok);
        
        const conversationsData = await conversationsResponse.json();
        console.log('📞 Recent conversations raw data:', conversationsData);
        
        let conversations: any[] = [];
        if (conversationsData.success) {
          conversations = conversationsData.conversations || [];
        } else {
          console.error('❌ Failed to fetch recent conversations:', conversationsData.error);
        }
        
        // Also fetch all bookings for the dropdown
        console.log('📞 Fetching all bookings...');
        const response = await fetch('https://workshop-backend-six.vercel.app/api/bookings');
        const data = await response.json();
        
        let allBookings: any[] = [];
        if (data.success) {
          allBookings = data.bookings || [];
          console.log('📊 All bookings data:', allBookings.map((b: any) => ({
            service: b.service?.label,
            carReg: b.car?.registration,
            hasCar: !!b.car,
            hasCarReg: !!b.car?.registration
          })));
          setBookings(allBookings);
          console.log('✅ All bookings state set to:', allBookings.length, 'items');
        } else {
          console.error('Failed to fetch bookings:', data.error);
        }
        
        // Enrich recent conversations with car data from allBookings by _id
        if (conversations.length && allBookings.length) {
          const bookingById = new Map(allBookings.map((b: any) => [String(b._id), b]));
          conversations = conversations.map((c: any) => {
            const full = bookingById.get(String(c._id));
            const merged = full ? { ...c, car: full.car ?? c.car } : c;
            return merged;
          });
          console.log('🔗 Enriched conversations with car data:', conversations.map((c: any) => ({ id: c._id, reg: c.car?.registration })));
        }
        
        // Save conversations (enriched)
        if (conversations.length) {
          setRecentConversations(conversations);
          console.log('✅ Recent conversations state set to:', conversations.length, 'items');
        }
        
        setLoading(false);
        console.log('✅ fetchAllBookings completed');
      } catch (error) {
        console.error('❌ Error in fetchAllBookings:', error);
        setLoading(false);
      }
    };

    const fetchMessages = async (bookingId: string) => {
      try {
        console.log('🔍 fetchMessages called for booking:', bookingId);
        setMessagesLoading(true);
        const url = currentUserEmail 
          ? `https://workshop-backend-six.vercel.app/api/bookings/${bookingId}/messages?userEmail=${encodeURIComponent(currentUserEmail)}`
          : `https://workshop-backend-six.vercel.app/api/bookings/${bookingId}/messages`;
        
        console.log('🔍 Fetching messages from URL:', url);
        
        const response = await fetch(url);
        console.log('🔍 Messages response status:', response.status);
        console.log('🔍 Messages response ok:', response.ok);
        
        const data = await response.json();
        console.log('🔍 Messages response data:', data);
        
        if (data.success) {
          console.log('✅ Messages fetched successfully, count:', data.messages?.length || 0);
          setMessages(data.messages || []);
          // Refresh conversations to update unread counts after messages are marked as read
          // Refresh conversations to update unread counts
          await refreshConversations();
          console.log('✅ Conversations refreshed after messages fetched');
        } else {
          console.error('❌ Failed to fetch messages:', data.error);
          // Don't clear messages on error, just log it
        }
      } catch (err) {
        console.error('❌ Error fetching messages:', err);
        // Don't clear messages on error, just log it
        // Keep existing messages to prevent chat disappearance
      } finally {
        setMessagesLoading(false);
      }
    };

    const refreshMessages = async () => {
      if (selectedBooking) {
        // Clear any existing timeout
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }
        
        // Debounce the refresh to prevent rapid calls
        refreshTimeoutRef.current = setTimeout(async () => {
          setRefreshing(true);
          try {
            await fetchMessages(selectedBooking._id);
          } catch (error) {
            console.error('Error refreshing messages:', error);
          } finally {
            setRefreshing(false);
          }
        }, 100); // 100ms debounce
      }
    };

    const refreshConversations = async () => {
      try {
        console.log('🔄 Refreshing conversations...');
        const conversationsResponse = await fetch('https://workshop-backend-six.vercel.app/api/admin/recent-conversations');
        const conversationsData = await conversationsResponse.json();
        
        if (conversationsData.success) {
          console.log('✅ Conversations refreshed:', conversationsData.conversations.length, 'conversations');
          console.log('📊 Conversations data:', conversationsData.conversations.map((c: any) => ({
            service: c.service?.label,
            carReg: c.car?.registration,
            hasCar: !!c.car,
            hasCarReg: !!c.car?.registration
          })));
          console.log('📊 Unread counts:', conversationsData.conversations.map((c: any) => ({ service: c.service.label, unread: c.unreadCount })));
          
          // Enrich with bookings state (if available)
          if (bookings.length) {
            const bookingById = new Map(bookings.map((b: any) => [String(b._id), b]));
            const enriched = conversationsData.conversations.map((c: any) => {
              const full = bookingById.get(String(c._id));
              return full ? { ...c, car: full.car ?? c.car } : c;
            });
            console.log('🔁 Enriched refreshed conversations with car:', enriched.map((c: any) => ({ id: c._id, reg: c.car?.registration })));
            setRecentConversations(enriched);
          } else {
            setRecentConversations(conversationsData.conversations);
          }
        } else {
          console.error('❌ Failed to refresh conversations:', conversationsData.error);
        }
      } catch (err) {
        console.error('❌ Error refreshing conversations:', err);
      }
    };

    // Normalize registration strings: lowercase, remove spaces and non-alphanumerics
    const normalizeReg = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    // Filter conversations by car registration number
    const filteredRecentConversations = recentConversations.filter((c) => {
      // Debug: Log the current state
      console.log('🔍 Current recentConversations length:', recentConversations.length);
      console.log('🔍 Current carSearch:', carSearch);
      
      const term = normalizeReg(carSearch.trim());
      if (!term) return true;
      
      // Debug: Log the entire conversation object to see its structure
      console.log('🔍 Raw conversation object:', c);
      console.log('🔍 Car field:', (c as any)?.car);
      console.log('🔍 Car registration:', (c as any)?.car?.registration);
      
      const reg = normalizeReg(((c as any)?.car?.registration) || '');
      console.log('🔍 Filtering conversation:', {
        service: (c as any)?.service?.label,
        carReg: (c as any)?.car?.registration,
        normalizedReg: reg,
        searchTerm: term,
        matches: reg.includes(term)
      });
      return reg.includes(term);
    });

    const filteredAllBookings = bookings.filter((b) => {
      const term = normalizeReg(carSearch.trim());
      if (!term) return true;
      const reg = normalizeReg((b?.car?.registration) || '');
      console.log('🔍 Filtering booking:', {
        service: b?.service?.label,
        carReg: b?.car?.registration,
        normalizedReg: reg,
        searchTerm: term,
        matches: reg.includes(term)
      });
      return reg.includes(term);
    });

    const selectBooking = async (booking: Booking) => {
      // Clear any existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }

      setSelectedBooking(booking);
      setMessagesLoading(true); // Show loading state instead of clearing messages
      await fetchMessages(booking._id);
      
      // Set up auto-refresh for this booking only if enabled
      if (autoRefreshEnabled) {
        refreshIntervalRef.current = setInterval(async () => {
          if (selectedBooking && selectedBooking._id === booking._id) {
            await fetchMessages(booking._id);
          }
        }, 5000); // Refresh every 5 seconds
      }
    };

    const toggleAutoRefresh = () => {
      const newState = !autoRefreshEnabled;
      setAutoRefreshEnabled(newState);
      
      if (newState) {
        // Enable auto-refresh
        if (selectedBooking) {
          refreshIntervalRef.current = setInterval(async () => {
            if (selectedBooking) {
              await fetchMessages(selectedBooking._id);
              await refreshConversations(); // Also refresh conversations to keep them updated
            }
          }, 5000);
        }
      } else {
        // Disable auto-refresh
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      }
    };

    const sendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !selectedBooking) return;

      console.log('🚀 sendMessage called with:', {
        message: newMessage.trim(),
        senderName: currentUserName,
        senderEmail: currentUserEmail,
        senderType: 'admin',
        bookingId: selectedBooking._id
      });

      try {
        setSending(true);
        const messageData = {
          message: newMessage.trim(),
          senderName: currentUserName,
          senderEmail: currentUserEmail,
          senderType: 'admin'
        };

        console.log('📤 Sending message data:', messageData);

        const response = await fetch(`https://workshop-backend-six.vercel.app/api/bookings/${selectedBooking._id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messageData)
        });

        console.log('📥 Response status:', response.status);
        console.log('📥 Response ok:', response.ok);

        const data = await response.json();
        console.log('📥 Response data:', data);
        
        if (data.success) {
          console.log('✅ Message sent successfully');
          setNewMessage('');
          // Refresh messages to show the new one
          await fetchMessages(selectedBooking._id);
          // Also refresh conversations to update the order
          await refreshConversations();
        } else {
          console.error('❌ Failed to send message:', data.error);
          setError('Failed to send message: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        console.error('❌ Error sending message:', err);
        setError('Error sending message: ' + (err instanceof Error ? err.message : 'Unknown error'));
      } finally {
        setSending(false);
      }
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatLastMessageTime = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else {
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
      }
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

    // Auto-scroll to bottom function
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Smart auto-scroll - only scroll if user is near bottom
    const smartScrollToBottom = () => {
      const messagesContainer = document.querySelector('[style*="maxHeight: 300px"]') as HTMLElement;
      if (messagesContainer) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100; // Within 100px of bottom
        
        if (isNearBottom) {
          scrollToBottom();
        }
      }
    };

    // Scroll to bottom when messages change
    useEffect(() => {
      smartScrollToBottom();
    }, [messages]);

    // Temporarily disable admin check for testing
    // if (!currentUserEmail || localStorage.getItem('role') !== 'admin') {
    if (false) { // Temporarily disabled for testing
      return (
        <>
          <Navbar />
          <div style={{ background: '#111', minHeight: '100vh', padding: '48px 24px' }}>
            <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', color: '#fff' }}>
              <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2.2rem', marginBottom: '24px' }}>
                Admin Access Required
              </h1>
              <div style={{ color: '#bdbdbd', fontSize: '1.15rem', marginBottom: '32px' }}>
                You need admin privileges to access this page
              </div>
              <button 
                onClick={() => navigate('/dashboard')}
                style={{
                  background: '#ffd700',
                  color: '#111',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Back to Dashboard
              </button>
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
          <div style={{ background: '#111', minHeight: '100vh', padding: '48px 24px' }}>
            <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', color: '#fff' }}>
              <div>Loading bookings...</div>
            </div>
          </div>
          <Footer />
        </>
      );
    }

    return (
      <>
        <Navbar />
        <div id="ames"style={{ background: '#111', minHeight: '100vh', padding: '0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
            <div style={{ marginBottom: '32px' }}>
              <button 
                onClick={() => navigate('/dashboard')}
                style={{
                  background: 'transparent',
                  color: '#ffd700',
                  border: '2px solid #ffd700',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '20px',
                  fontWeight: 600
                }}
              >
                ← Back to Dashboard
              </button>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2.2rem', marginBottom: '8px' }}>
                    Admin Messages
                  </h1>
                  <div style={{ color: '#bdbdbd', fontSize: '1.15rem' }}>
                    Manage customer communications across all bookings
                  </div>
                </div>

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              {/* Bookings List */}
              <div>
                {/* Recent Conversations Section */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <h2 style={{ color: '#ffd700', fontSize: '1.5rem', margin: 0 }}>
                        💬 Recent Conversations ({filteredRecentConversations.length})
                      </h2>
                      <input
                        value={carSearch}
                        onChange={(e) => setCarSearch(e.target.value)}
                        placeholder="Search by car number"
                        style={{
                          background: '#1a1a1a',
                          color: '#fff',
                          border: '1px solid #333',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          width: '220px'
                        }}
                      />
                      {carSearch && (
                        <button
                          onClick={() => setCarSearch('')}
                          style={{
                            background: '#444', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', fontWeight: 600
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {recentConversations.length === 0 ? (
                      <div style={{ 
                        background: '#1a1a1a', 
                        padding: '40px', 
                        borderRadius: '12px', 
                        textAlign: 'center',
                        color: '#bdbdbd',
                        border: '1px solid #333'
                      }}>
                        <div style={{ fontSize: '1.1rem', marginBottom: '12px', color: '#888' }}>
                          📭 No conversations yet
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          {loading ? 'Loading conversations...' : 'When customers send messages, they will appear here as recent conversations.'}
                        </div>
                        {!loading && (
                          <button 
                            onClick={fetchAllBookings}
                            style={{
                              background: '#ffd700',
                              color: '#111',
                              padding: '8px 16px',
                              borderRadius: '6px',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 600,
                              marginTop: '12px'
                            }}
                          >
                            🔄 Reload Data
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredRecentConversations.map((conversation) => (
                        <div 
                          key={conversation._id}
                          style={{ 
                            background: selectedBooking?._id === conversation._id ? '#333' : '#232323', 
                            padding: '20px', 
                            borderRadius: '12px', 
                            marginBottom: '16px',
                            border: `2px solid ${selectedBooking?._id === conversation._id ? '#ffd700' : '#333'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                          }}
                          onClick={() => selectBooking(conversation)}
                        >
                          <div style={{ 
                            fontWeight: 700, 
                            fontSize: '1.1rem', 
                            color: '#ffd700', 
                            marginBottom: '8px' 
                          }}>
                            {conversation.service.label} - {conversation.service.sub}
                            {(conversation as any)?.car?.registration && (
                              <span style={{ color: '#bdbdbd', marginLeft: 8 }}>
                                • {(conversation as any).car.registration}
                              </span>
                            )}
                          </div>
                          <div style={{ color: '#bdbdbd', fontSize: '0.9rem', marginBottom: '8px' }}>
                            {formatDate(conversation.date)} at {conversation.time}
                          </div>
                          <div style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '8px' }}>
                            Customer: {conversation.customer.name}
                          </div>
                          
                          {/* Last Message Preview */}
                          {conversation.lastMessage && (
                            <div style={{ 
                              background: '#1a1a1a', 
                              padding: '12px', 
                              borderRadius: '8px', 
                              marginBottom: '12px',
                              borderLeft: '3px solid #ffd700'
                            }}>
                              <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '4px' }}>
                                Last message from {conversation.lastMessage.senderName}
                              </div>
                              <div style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '4px' }}>
                                {conversation.lastMessage.message.length > 50 
                                  ? conversation.lastMessage.message.substring(0, 50) + '...' 
                                  : conversation.lastMessage.message
                                }
                              </div>
                              <div style={{ color: '#666', fontSize: '0.8rem' }}>
                                {formatLastMessageTime(conversation.lastMessage.createdAt)}
                              </div>
                            </div>
                          )}
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ 
                              color: getStatusColor(conversation.status),
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              textTransform: 'capitalize'
                            }}>
                              Status: {conversation.status}
                            </div>
                            
                            {/* Message Count and Unread Badges */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {conversation.messageCount && (
                                <span style={{ 
                                  background: '#444', 
                                  color: '#fff', 
                                  padding: '4px 8px', 
                                  borderRadius: '12px', 
                                  fontSize: '0.8rem',
                                  fontWeight: '600'
                                }}>
                                  💬 {conversation.messageCount}
                                </span>
                              )}
                              {conversation.unreadCount && conversation.unreadCount > 0 && (
                                <span style={{ 
                                  color: '#e74c3c', 
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  fontStyle: 'italic'
                                }}>
                                  ✨ New Messages
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {/* All Bookings Section */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <h2 style={{ color: '#ffd700', fontSize: '1.5rem', margin: 0 }}>
                      📋 All Bookings ({filteredAllBookings.length})
                    </h2>
                    <input
                      value={carSearch}
                      onChange={(e) => setCarSearch(e.target.value)}
                      placeholder="Search by car number"
                      style={{
                        background: '#1a1a1a',
                        color: '#fff',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        width: '220px'
                      }}
                    />
                    {carSearch && (
                      <button
                        onClick={() => setCarSearch('')}
                        style={{ background: '#444', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {filteredAllBookings.map((booking) => (
                      <div 
                        key={booking._id}
                        style={{ 
                          background: selectedBooking?._id === booking._id ? '#333' : '#232323', 
                          padding: '20px', 
                          borderRadius: '12px', 
                          marginBottom: '16px',
                          border: `2px solid ${selectedBooking?._id === booking._id ? '#ffd700' : '#333'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => selectBooking(booking)}
                      >
                        <div style={{ 
                          fontWeight: 700, 
                          fontSize: '1.1rem', 
                          color: '#ffd700', 
                          marginBottom: '8px' 
                        }}>
                          {booking.service.label} - {booking.service.sub}
                          {booking.car?.registration && (
                            <span style={{ color: '#bdbdbd', marginLeft: 8 }}>
                              • {booking.car.registration}
                            </span>
                          )}
                        </div>
                        <div style={{ color: '#bdbdbd', fontSize: '0.9rem', marginBottom: '8px' }}>
                          {formatDate(booking.date)} at {booking.time}
                        </div>
                        <div style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '8px' }}>
                          Customer: {booking.customer.name}
                        </div>
                        <div style={{ 
                          color: getStatusColor(booking.status),
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}>
                          Status: {booking.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Messages Panel */}
              <div>
                {selectedBooking ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h2 style={{ color: '#ffd700', fontSize: '1.5rem', fontWeight: '600', marginBottom: '4px' }}>
                          Messages - {selectedBooking.customer.name}
                        </h2>
                        <div style={{ color: '#888', fontSize: '0.9rem' }}>
                          {autoRefreshEnabled ? '🔄 Auto-refresh active (5s)' : '⏸️ Auto-refresh paused'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={toggleAutoRefresh}
                          style={{ 
                            background: autoRefreshEnabled ? '#4CAF50' : '#666', 
                            color: '#fff', 
                            border: 'none',
                            borderRadius: '6px', 
                            padding: '6px 12px', 
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.8rem'
                          }}
                        >
                          {autoRefreshEnabled ? '🔄' : '⏸️'} {autoRefreshEnabled ? 'Auto' : 'Paused'}
                        </button>
                        <button 
                          onClick={refreshMessages}
                          disabled={refreshing}
                          style={{ 
                            background: refreshing ? '#666' : '#17a2b8', 
                            color: '#fff', 
                            border: 'none',
                            borderRadius: '6px', 
                            padding: '6px 12px', 
                            cursor: refreshing ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '0.8rem'
                          }}
                        >
                          {refreshing ? '⏳' : '🔄'} {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>

                      </div>
                    </div>
                    
                    <div style={{ 
                      background: '#232323', 
                      padding: '20px', 
                      borderRadius: '12px',
                      border: '1px solid #333',
                      marginBottom: '20px'
                    }}>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '16px', 
                        color: '#fff',
                        marginBottom: '20px'
                      }}>
                        <div>
                          <strong style={{ color: '#ffd700' }}>Service:</strong> {selectedBooking.service.label}
                        </div>
                        <div>
                          <strong style={{ color: '#ffd700' }}>Date:</strong> {formatDate(selectedBooking.date)}
                        </div>
                        <div>
                          <strong style={{ color: '#ffd700' }}>Customer:</strong> {selectedBooking.customer.name}
                        </div>
                        <div>
                          <strong style={{ color: '#ffd700' }}>Email:</strong> {selectedBooking.customer.email}
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ color: '#ffd700', marginBottom: '16px', fontSize: '1.2rem' }}>
                        Conversation ({messages.length} messages)
                      </h3>
                      
                      <div style={{ 
                        maxHeight: '300px', 
                        overflowY: 'auto',
                        marginBottom: '20px'
                      }}>
                        {messagesLoading ? (
                          <div style={{ 
                            background: '#1a1a1a', 
                            padding: '20px', 
                            borderRadius: '8px', 
                            textAlign: 'center',
                            color: '#bdbdbd',
                            border: '1px solid #444'
                          }}>
                            Loading messages...
                          </div>
                        ) : messages.length === 0 ? (
                          <div style={{ 
                            background: '#1a1a1a', 
                            padding: '20px', 
                            borderRadius: '8px', 
                            textAlign: 'center',
                            color: '#bdbdbd',
                            border: '1px solid #444'
                          }}>
                            No messages yet. Start the conversation!
                          </div>
                        ) : (
                          messages.map((message) => {
                            console.log('🔍 Message alignment debug:', {
                              id: message._id,
                              senderType: message.senderType,
                              senderName: message.senderName,
                              alignment: message.senderType === 'admin' ? 'right' : 'left'
                            });
                            
                            return (
                              <div key={message._id} style={{ display: 'flex', justifyContent: message.senderType === 'admin' ? 'flex-end' : 'flex-start' }}>
                                <div 
                                  style={{ 
                                    background: '#1a1a1a', 
                                    padding: '16px', 
                                    borderRadius: '12px', 
                                    marginBottom: '12px',
                                    border: '1px solid #444',
                                    borderLeft: `4px solid ${message.senderType === 'admin' ? '#ffd700' : '#4CAF50'}`,
                                    maxWidth: '75%'
                                  }}
                                >
                                  <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    marginBottom: '8px'
                                  }}>
                                    <div style={{ 
                                      color: message.senderType === 'admin' ? '#ffd700' : '#4CAF50',
                                      fontWeight: 700,
                                      fontSize: '0.9rem'
                                    }}>
                                      {message.senderName}
                                      {message.senderType === 'admin' && ' (Staff)'}
                                    </div>
                                    <div style={{ color: '#888', fontSize: '0.8rem', marginLeft: 12 }}>
                                      {formatDate(message.createdAt)}
                                    </div>
                                  </div>
                                  <div style={{ color: '#fff', lineHeight: '1.5', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                                    {message.message}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>

                    {/* Send Message Form */}
                    <div style={{ 
                      background: '#232323', 
                      padding: '20px', 
                      borderRadius: '12px',
                      border: '1px solid #333'
                    }}>
                      <h3 style={{ color: '#ffd700', marginBottom: '16px', fontSize: '1.1rem' }}>
                        Send Message to {selectedBooking.customer.name}
                      </h3>
                      
                      <form onSubmit={sendMessage}>
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message here..."
                          style={{
                            width: '100%',
                            minHeight: '80px',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #444',
                            background: '#1a1a1a',
                            color: '#fff',
                            fontSize: '14px',
                            resize: 'vertical',
                            marginBottom: '16px'
                          }}
                          disabled={sending}
                        />
                        
                        <button
                          type="submit"
                          disabled={!newMessage.trim() || sending}
                          style={{
                            background: newMessage.trim() && !sending ? '#ffd700' : '#444',
                            color: newMessage.trim() && !sending ? '#111' : '#888',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed',
                            opacity: newMessage.trim() && !sending ? 1 : 0.6
                          }}
                        >
                          {sending ? 'Sending...' : 'Send Message'}
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div style={{ 
                    background: '#232323', 
                    padding: '40px', 
                    borderRadius: '12px', 
                    textAlign: 'center',
                    color: '#bdbdbd',
                    border: '1px solid #333'
                  }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
                      Select a booking to view messages
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#888' }}>
                      Click on any booking from the left panel to start managing customer communications
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
};

export default AdminMessages; 
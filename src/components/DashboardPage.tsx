import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './Home.css';
import Footer from './Footer';
import dayjs from 'dayjs';

const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 12, verticalAlign: 'middle', display: 'inline-block' }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const BoxIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 12, verticalAlign: 'middle', display: 'inline-block' }}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22" x2="12" y2="12" />
  </svg>
);
const LookupIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, verticalAlign: 'middle', display: 'inline-block' }}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const cellPad = '44px 44px';
const headerFontSize = '1.18rem';
const timeFontSize = '1.12rem';

type ServiceItem = { _id?: string; label: string; sub: string; price?: number; labourHours?: number; labourCost?: number };

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'
];

type DashboardPageProps = {
  initialTab?: 'past' | 'upcoming' | 'messages';
};

const DashboardPage: React.FC<DashboardPageProps> = ({ initialTab }) => {
  const [showModal, setShowModal] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedService, setSelectedService] = useState(0);

  const [parts, setParts] = useState<any[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ServiceItem[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [partForm, setPartForm] = useState({ partNumber: '', name: '', supplier: '', cost: '', profit: '', price: '', qty: 1 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [dashboardDate, setDashboardDate] = useState(dayjs());
  const [scheduleDate, setScheduleDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customServices, setCustomServices] = useState<any[]>([]);
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({ label: '', sub: '', price: '', description: '', labourHours: '', labourCost: '' });
  const [showAddPart, setShowAddPart] = useState(false);
  const [addPartContext, setAddPartContext] = useState<'scheduled' | 'manual' | 'lookup'>('scheduled');
  const [showPartsModal, setShowPartsModal] = useState(false);
  const [partsTable, setPartsTable] = useState<any[]>([]);
  const [partRow, setPartRow] = useState({ partNumber: '', name: '', supplier: '', cost: '', profit: '20', price: '', qty: '', booked: '' });
  const [editPartId, setEditPartId] = useState<string | null>(null);
  const [editPartDraft, setEditPartDraft] = useState<{ partNumber?: string; name?: string; supplier?: string; cost?: string; profit?: string; price?: string; qty?: string; booked?: string }>({});
  const [regInput, setRegInput] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'past' | 'upcoming' | 'messages'>(initialTab || 'past');

  // Add state for user service tracking
  const [showUserServicesModal, setShowUserServicesModal] = useState(false);
  const [userServices, setUserServices] = useState<any[]>([]);
  const [userServicesSearch, setUserServicesSearch] = useState({ email: '', registration: '' });
  const [userServicesLoading, setUserServicesLoading] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('role') === 'admin');
    fetch('https://workshop-backend-six.vercel.app/api/services')
      .then(r => r.json())
      .then((list: ServiceItem[]) => setServiceOptions(list))
      .catch(() => setServiceOptions([]));
  }, []);

  const refreshServices = () => {
    console.log('🔧 Refreshing services from backend...');
    fetch('https://workshop-backend-six.vercel.app/api/services')
      .then(r => r.json())
      .then((list: ServiceItem[]) => {
        console.log('🔧 Services refreshed:', list.length, 'services loaded');
        console.log('🔧 Sample service with labour costs:', list.find(s => s.labourCost && s.labourCost > 0));
        setServiceOptions(list);
      })
      .catch(() => setServiceOptions([]));
  };

  // Add state for manual booking fields
  const [manualCar, setManualCar] = useState({ make: '', model: '', year: '', registration: '' });
  const [manualCustomer, setManualCustomer] = useState({ name: '', email: '', phone: '', postcode: '', address: '' });
  const [manualLoading, setManualLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  // Add time picker state for manual booking
  const [manualTime, setManualTime] = useState('09:00');
  const [manualDate, setManualDate] = useState(dayjs().format('YYYY-MM-DD'));

  // Add state for lookup booking modal
  const [showLookupBookingModal, setShowLookupBookingModal] = useState(false);
  const [lookupCar, setLookupCar] = useState<any>(null);
  const [lookupCustomer, setLookupCustomer] = useState({ name: '', email: '', phone: '', postcode: '', address: '' });
  const [lookupParts, setLookupParts] = useState<any[]>([]);
  const [lookupCustomServices, setLookupCustomServices] = useState<any[]>([]);
  const [lookupSelectedService, setLookupSelectedService] = useState(0);
  const [lookupManualTime, setLookupManualTime] = useState('09:00');
  const [lookupManualDate, setLookupManualDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [lookupLoadingState, setLookupLoadingState] = useState(false);

  // Add state for showing add service form in lookup modal
  const [showLookupAddService, setShowLookupAddService] = useState(false);
  const [lookupNewService, setLookupNewService] = useState({ label: '', sub: '', price: '', category: 'Maintenance', description: '', labourHours: '', labourCost: '' });



  const handlePartFormChange = (field: string, value: string) => {
    setPartForm(f => ({ 
      ...f, 
      [field]: field === 'qty' ? parseInt(value) || 1 : value 
    }));
  };

  const handleAddPart = async () => {
    if (!partForm.name || !partForm.partNumber) return;
    
    // Try to auto-fill details from database
    const autoFilledPart = await autoFillPartDetails(partForm.partNumber, partForm.name);
    
    if (autoFilledPart) {
      // Use auto-filled details
      let price = autoFilledPart.price;
      if (!price && autoFilledPart.cost && autoFilledPart.profit) {
        const cost = parseFloat(autoFilledPart.cost);
        const profit = parseFloat(autoFilledPart.profit);
        if (!isNaN(cost) && !isNaN(profit)) {
          price = (cost * (1 + profit / 100)).toFixed(2);
        }
      }
      
      const newPart = { 
        ...autoFilledPart, 
        price, 
        cost: parseFloat(autoFilledPart.cost || '0').toFixed(2), 
        qty: 1 
      };
      console.log('🔍 Adding part to parts array:', newPart);
      console.log('🔍 Current parts array before adding:', parts);
      setParts(p => {
        const newParts = [...p, newPart];
        console.log('🔍 New parts array after adding:', newParts);
        return newParts;
      });
    } else {
      // If part not found in database, show error
      alert('Part not found in database. Please check part number and name.');
      return;
    }
    
    setPartForm({ partNumber: '', name: '', supplier: '', cost: '', profit: '', price: '', qty: 1 });
    setShowAddPart(false);
  };

  const handlePartQty = (idx: number, delta: number) => {
    setParts(parts => {
      const updatedParts = parts.map((p, i) => i === idx ? { ...p, qty: Math.max(1, (p.qty || 1) + delta) } : p);
      console.log(`Updated part quantity at index ${idx}:`, updatedParts[idx]);
      return updatedParts;
    });
  };

  const handlePartProfit = (idx: number, value: string) => {
    setParts(parts => parts.map((p, i) => {
      if (i !== idx) return p;
      const cost = parseFloat(p.cost);
      const profit = parseFloat(value);
      let price = p.price;
      if (!isNaN(cost) && !isNaN(profit)) {
        price = (cost * (1 + profit / 100)).toFixed(2);
      }
      return { ...p, profit: value, price };
    }));
  };

  const handlePrevDay = () => setDashboardDate(dashboardDate.subtract(1, 'day'));
  const handleNextDay = () => setDashboardDate(dashboardDate.add(1, 'day'));

  const handleScheduleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScheduleDate(e.target.value);
    setSelectedTime('');
  };

  const handleCreateBooking = async () => {
    if (!scheduleDate || !selectedTime) return;
    
    // Create the booking
    const newBooking = {
      date: dayjs(scheduleDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      time: selectedTime,
      reg: 'KE14OYZ',
      price: 324,
      service: serviceOptions[selectedService].label,
      duration: serviceOptions[selectedService].sub,
    };
    
    setBookings(b => [...b, newBooking]);
    
    // Deduct parts from inventory if any parts were added
    if (parts.length > 0) {
      console.log('🔍 SCHEDULED BOOKING - Starting parts deduction for:', parts.length, 'parts');
      console.log('🔍 SCHEDULED BOOKING - Parts array contents:', JSON.stringify(parts, null, 2));
      for (const part of parts) {
        try {
          console.log(`🔍 SCHEDULED BOOKING - Deducting part ${part.partNumber} (${part.name}) - Quantity: ${part.qty}`);
          const deductResponse = await fetch(`https://workshop-backend-six.vercel.app/api/parts/${part.partNumber}/deduct`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: part.qty || 1 })
          });
          
          if (!deductResponse.ok) {
            const errorData = await deductResponse.json();
            console.error(`❌ SCHEDULED BOOKING - Failed to deduct part ${part.name}:`, errorData.error);
          } else {
            console.log(`✅ SCHEDULED BOOKING - Successfully deducted ${part.qty} of part ${part.partNumber}`);
          }
        } catch (error) {
          console.error(`❌ SCHEDULED BOOKING - Error deducting part ${part.name}:`, error);
        }
      }
    }
    
    setShowScheduleModal(false);
    setShowModal(false);
    setShowManual(false);
    setRegInput('');
    setLookupResult(null);
    setLookupError('');
    setLookupLoading(false);
    setSelectedTime('');
    setScheduleDate('');
    setSelectedService(0);
    setParts([]);
    setPartForm({ partNumber: '', name: '', supplier: '', cost: '', profit: '', price: '', qty: 1 });
    setCustomServices([]);
    setNewService({ label: '', sub: '', price: '', description: '', labourHours: '', labourCost: '' });
    setShowAddService(false);
    setShowAddPart(false);
    setPartsTable([]);
    setPartRow({ partNumber: '', name: '', supplier: '', cost: '', profit: '20', price: '', qty: '', booked: '' });
  };

  const bookingsForDate = bookings.filter(b => {
    console.log('🔍 Checking booking:', b);
    console.log('🔍 Booking date:', b.date, 'type:', typeof b.date);
    console.log('🔍 Dashboard date:', dashboardDate.format('YYYY-MM-DD'));
    
    // Handle both string and Date object formats
    let bookingDateStr = '';
    
    if (b.date instanceof Date) {
      bookingDateStr = b.date.toISOString().split('T')[0];
    } else if (typeof b.date === 'string') {
      // Handle ISO date strings like "2025-08-14T00:00:00.000Z"
      if (b.date.includes('T')) {
        bookingDateStr = b.date.split('T')[0];
      } else {
        bookingDateStr = b.date;
      }
    }
    
    const dashboardDateStr = dashboardDate.format('YYYY-MM-DD');
    const match = bookingDateStr === dashboardDateStr;
    
    if (match) {
      console.log('✅ Date match found:', bookingDateStr, 'for', dashboardDateStr);
    } else {
      console.log('❌ No date match:', bookingDateStr, 'vs', dashboardDateStr);
    }
    
    return match;
  });
  
  console.log('📅 Total bookings:', bookings.length);
  console.log('📅 Bookings for current date:', bookingsForDate.length);
  console.log('📅 Current dashboard date:', dashboardDate.format('YYYY-MM-DD'));
  console.log('📅 Today\'s date:', dayjs().format('YYYY-MM-DD'));
  
  // Debug: Show all bookings with their dates
  bookings.forEach((b, index) => {
    console.log(`📅 Booking ${index}:`, {
      id: b._id,
      date: b.date,
      dateType: typeof b.date,
      time: b.time,
      category: b.category,
      registration: b.car?.registration
    });
  });

  const handleDVLAlookup = async () => {
    setLookupLoading(true);
    setLookupError('');
    setLookupResult(null);
    try {
      const response = await fetch('https://workshop-backend-six.vercel.app/api/dvla-lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registrationNumber: regInput })
      });
      if (!response.ok) throw new Error('Vehicle not found or API error');
      const data = await response.json();
      setLookupResult(data);
    } catch (err: any) {
      setLookupError(err.message || 'Lookup failed');
    } finally {
      setLookupLoading(false);
    }
  };

  // Fetch all bookings on mount
  useEffect(() => {
    setBookingsLoading(true);
    fetch('https://workshop-backend-six.vercel.app/api/bookings')
      .then(res => res.json())
      .then(data => {
        console.log('📅 Fetched bookings:', data);
        console.log('📅 Current dashboard date:', dashboardDate.format('YYYY-MM-DD'));
        setBookings(data.success ? data.bookings : data);
      })
      .finally(() => setBookingsLoading(false));
  }, []);

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const response = await fetch('https://workshop-backend-six.vercel.app/api/admin/unread-messages');
        const data = await response.json();
        if (data.success) {
          setUnreadMessages(data.count);
        }
      } catch (error) {
        console.error('Error fetching unread messages:', error);
      }
    };

    fetchUnreadMessages();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate dynamic quote summary
  const getLabourHours = () => {
    const candidate = selectedService < serviceOptions.length
      ? serviceOptions[selectedService]?.sub
      : customServices[selectedService - serviceOptions.length]?.sub;
    const sub = typeof candidate === 'string' ? candidate : '';
    const match = sub.match(/([\d.]+)h/);
    return match ? parseFloat(match[1]) : 2; // default 2h
  };
  
  const getLabourCostPerHour = () => {
    const candidate = selectedService < serviceOptions.length
      ? serviceOptions[selectedService]?.labourCost
      : customServices[selectedService - serviceOptions.length]?.labourCost;
    console.log('🔧 getLabourCostPerHour - selectedService:', selectedService, 'serviceOptions.length:', serviceOptions.length);
    console.log('🔧 getLabourCostPerHour - candidate:', candidate, 'type:', typeof candidate);
    console.log('🔧 Available services with labour costs:', serviceOptions.map(s => ({ label: s.label, labourHours: s.labourHours, labourCost: s.labourCost })));
    return typeof candidate === 'number' ? candidate : 0;
  };
  
  const labourHours = getLabourHours();
  const labourCostPerHour = getLabourCostPerHour();
  const labourCost = labourHours * labourCostPerHour;
  console.log('🔧 Labour calculation - hours:', labourHours, 'cost per hour:', labourCostPerHour, 'total cost:', labourCost);
  const partsCost = parts.reduce((sum, p) => sum + (parseFloat(p.price || 0) * (p.qty || 1)), 0);
  const getServicePrice = () => {
    const candidate = selectedService < serviceOptions.length
      ? serviceOptions[selectedService]?.price
      : (customServices[selectedService - serviceOptions.length]?.price as any);
    const priceNum = typeof candidate === 'number' ? candidate : parseFloat(candidate || 0);
    return isNaN(priceNum) ? 0 : priceNum;
  };
  const servicePrice = getServicePrice();
  const subtotal = labourCost + partsCost + servicePrice;
  const vat = subtotal * 0.2;
  const total = subtotal + vat;

  // Category mapping system for admin dashboard
  const mapToAdminCategory = (serviceObj: any) => {
    if (!serviceObj || !serviceObj.sub) return 'service';
    
    const sub = serviceObj.sub.toLowerCase();
    const label = serviceObj.label.toLowerCase();
    
    // Tyres category
    if (sub.includes('tyres') || sub.includes('tyre') || label.includes('tyre') || label.includes('tyres')) {
      return 'tyres';
    }
    
    // Mechanical category
    if (sub.includes('mechanical') || 
        label.includes('brake') || 
        label.includes('clutch') || 
        label.includes('suspension') ||
        label.includes('engine') ||
        label.includes('spark') ||
        label.includes('transmission')) {
      return 'mechanical';
    }
    
    // Services category (default for maintenance, diagnostics, inspection)
    if (sub.includes('services') || 
        label.includes('service') || 
        label.includes('diagnostic') || 
        label.includes('inspection') ||
        label.includes('maintenance') ||
        label.includes('oil') ||
        label.includes('filter') ||
        label.includes('mot')) {
    return 'service';
    }
    
    return 'service'; // Default fallback
  };

  // Handle manual booking creation
  const extractCategory = (serviceObj: any) => {
    return mapToAdminCategory(serviceObj);
  };

  const handleManualBooking = async () => {
    setManualLoading(true);
    const selected = selectedService < serviceOptions.length ? serviceOptions[selectedService] : customServices[selectedService - serviceOptions.length];
    const category = extractCategory(selected);
    const bookingData = {
      car: manualCar,
      customer: manualCustomer,
      service: selected,
      parts,
      labourHours,
      labourCost,
      partsCost,
      subtotal,
      vat,
      total,
      date: manualDate,
      time: manualTime,
      category,
    };
    try {
      await fetch('https://workshop-backend-six.vercel.app/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      
      // Deduct parts from inventory after successful booking creation
      console.log('🔍 MANUAL BOOKING - Starting parts deduction for:', parts.length, 'parts');
      console.log('🔍 MANUAL BOOKING - Parts array contents:', JSON.stringify(parts, null, 2));
      for (const part of parts) {
        try {
          console.log(`🔍 MANUAL BOOKING - Deducting part ${part.partNumber} (${part.name}) - Quantity: ${part.qty}`);
          const deductResponse = await fetch(`https://workshop-backend-six.vercel.app/api/parts/${part.partNumber}/deduct`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: part.qty || 1 })
          });
          
          if (!deductResponse.ok) {
            const errorData = await deductResponse.json();
            console.error(`❌ MANUAL BOOKING - Failed to deduct part ${part.name}:`, errorData.error);
          } else {
            console.log(`✅ MANUAL BOOKING - Successfully deducted ${part.qty} of part ${part.partNumber}`);
          }
        } catch (error) {
          console.error(`❌ MANUAL BOOKING - Error deducting part ${part.name}:`, error);
        }
      }
      
      // Refresh bookings
      const res = await fetch('https://workshop-backend-six.vercel.app/api/bookings');
      setBookings(await res.json());
      setShowManual(false);
      // Reset manual form
      setManualCar({ make: '', model: '', year: '', registration: '' });
      setManualCustomer({ name: '', email: '', phone: '', postcode: '', address: '' });
      setParts([]);
      setSelectedService(0);
      setCustomServices([]);
      setManualTime('09:00');
      setManualDate(dayjs().format('YYYY-MM-DD'));
    } catch (e) {
      alert('Failed to save booking');
    } finally {
      setManualLoading(false);
    }
  };

  // Lookup modal: dynamic quote summary calculations
  const getLookupLabourHours = () => {
    const candidate = lookupSelectedService < serviceOptions.length
      ? serviceOptions[lookupSelectedService]?.sub
      : lookupCustomServices[lookupSelectedService - serviceOptions.length]?.sub;
    const sub = typeof candidate === 'string' ? candidate : '';
    const match = sub.match(/([\d.]+)h/);
    return match ? parseFloat(match[1]) : 2; // default 2h
  };

  // Extract category for lookup services
  const extractLookupCategory = (serviceObj: any) => {
    return mapToAdminCategory(serviceObj);
  };

  const getLookupLabourCostPerHour = () => {
    const candidate = lookupSelectedService < serviceOptions.length
      ? serviceOptions[lookupSelectedService]?.labourCost
      : lookupCustomServices[lookupSelectedService - serviceOptions.length]?.labourCost;
    console.log('🔧 getLookupLabourCostPerHour - lookupSelectedService:', lookupSelectedService, 'serviceOptions.length:', serviceOptions.length);
    console.log('🔧 getLookupLabourCostPerHour - candidate:', candidate, 'type:', typeof candidate);
    return typeof candidate === 'number' ? candidate : 0;
  };
  
  const lookupLabourHours = getLookupLabourHours();
  const lookupLabourCostPerHour = getLookupLabourCostPerHour();
  const lookupLabourCost = lookupLabourHours * lookupLabourCostPerHour;
  console.log('🔧 Lookup Labour calculation - hours:', lookupLabourHours, 'cost per hour:', lookupLabourCostPerHour, 'total cost:', lookupLabourCost);
  const lookupPartsCost = lookupParts.reduce((sum, p) => sum + (parseFloat(p.price || 0) * (p.qty || 1)), 0);
  const getLookupServicePrice = () => {
    const candidate = lookupSelectedService < serviceOptions.length
      ? serviceOptions[lookupSelectedService]?.price
      : (lookupCustomServices[lookupSelectedService - serviceOptions.length]?.price as any);
    const priceNum = typeof candidate === 'number' ? candidate : parseFloat(candidate || 0);
    return isNaN(priceNum) ? 0 : priceNum;
  };
  const lookupServicePrice = getLookupServicePrice();
  const lookupSubtotal = lookupLabourCost + lookupPartsCost + lookupServicePrice;
  const lookupVat = lookupSubtotal * 0.2;
  const lookupTotal = lookupSubtotal + lookupVat;
  // Calculate total parts cost (cost * qty) for lookup modal
  const lookupPartsCostRaw = lookupParts.reduce((sum, p) => sum + (parseFloat(p.cost || 0) * (p.qty || 1)), 0);

  // Lookup modal part handlers
  const handleLookupAddPart = async () => {
    if (!partForm.name || !partForm.partNumber) {
      alert('Please fill in Part Number and Name');
      return;
    }
    
    // Try to auto-fill details from database
    const autoFilledPart = await autoFillPartDetails(partForm.partNumber, partForm.name);
    
    if (autoFilledPart) {
      // Use auto-filled details
      let price = autoFilledPart.price;
      if (!price && autoFilledPart.cost && autoFilledPart.profit) {
        const cost = parseFloat(autoFilledPart.cost);
        const profit = parseFloat(autoFilledPart.profit);
        if (!isNaN(cost) && !isNaN(profit)) {
          price = (cost * (1 + profit / 100)).toFixed(2);
        }
      }
      
      const newPart = { 
        ...autoFilledPart, 
        price, 
        cost: parseFloat(autoFilledPart.cost || '0').toFixed(2), 
        qty: 1 
      };
      console.log('🔍 LOOKUP - Adding part to lookupParts array:', newPart);
      console.log('🔍 LOOKUP - Current lookupParts array before adding:', lookupParts);
      setLookupParts(p => {
        const newParts = [...p, newPart];
        console.log('🔍 LOOKUP - New lookupParts array after adding:', newParts);
        return newParts;
      });
    } else {
      // If part not found in database, show error
      alert('Part not found in database. Please check part number and name.');
      return;
    }
    
    setPartForm({ partNumber: '', name: '', supplier: '', cost: '', profit: '', price: '', qty: 1 });
    setShowAddPart(false);
  };
  const handleLookupPartQty = (idx: number, delta: number) => {
    setLookupParts(parts => {
      const updatedParts = parts.map((p, i) => i === idx ? { ...p, qty: Math.max(1, (p.qty || 1) + delta) } : p);
      console.log(`Updated lookup part quantity at index ${idx}:`, updatedParts[idx]);
      return updatedParts;
    });
  };
  const handleLookupPartProfit = (idx: number, value: string) => {
    setLookupParts(parts => parts.map((p, i) => {
      if (i !== idx) return p;
      const cost = parseFloat(p.cost);
      const profit = parseFloat(value);
      let price = p.price;
      if (!isNaN(cost) && !isNaN(profit)) {
        price = (cost * (1 + profit / 100)).toFixed(2);
      }
      return { ...p, profit: value, price };
    }));
  };

  // Handle editing parts in lookup context
  const handleLookupEditPart = (idx: number, field: string, value: string) => {
    setLookupParts(parts => parts.map((p, i) => {
      if (i !== idx) return p;
      const updatedPart = { ...p, [field]: value };
      
      // Recalculate price if cost or profit changes
      if (field === 'cost' || field === 'profit') {
        const cost = parseFloat(updatedPart.cost);
        const profit = parseFloat(updatedPart.profit);
        if (!isNaN(cost) && !isNaN(profit)) {
          updatedPart.price = (cost * (1 + profit / 100)).toFixed(2);
        }
      }
      
      return updatedPart;
    }));
  };

  // Handle deleting parts in lookup context
  const handleLookupDeletePart = (idx: number) => {
    setLookupParts(parts => parts.filter((_, i) => i !== idx));
  };

  const handleLookupBooking = async () => {
    setManualLoading(true);
    const selected = lookupSelectedService < serviceOptions.length
      ? serviceOptions[lookupSelectedService]
      : lookupCustomServices[lookupSelectedService - serviceOptions.length];
    const category = extractCategory(selected);
    const bookingData = {
      car: lookupCar,
      customer: lookupCustomer,
      service: selected,
      parts: lookupParts,
      labourHours: lookupLabourHours,
      labourCost: lookupLabourCost,
      partsCost: lookupPartsCost,
      subtotal: lookupSubtotal,
      vat: lookupVat,
      total: lookupTotal,
      date: lookupManualDate,
      time: lookupManualTime,
      category,
    };
    try {
      await fetch('https://workshop-backend-six.vercel.app/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      
      // Deduct parts from inventory after successful booking creation
      console.log('🔍 LOOKUP BOOKING - Starting parts deduction for:', lookupParts.length, 'parts');
      console.log('🔍 LOOKUP BOOKING - Parts array contents:', JSON.stringify(lookupParts, null, 2));
      for (const part of lookupParts) {
        try {
          console.log(`🔍 LOOKUP BOOKING - Deducting part ${part.partNumber} (${part.name}) - Quantity: ${part.qty}`);
          const deductResponse = await fetch(`https://workshop-backend-six.vercel.app/api/parts/${part.partNumber}/deduct`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: part.qty || 1 })
          });
          
          if (!deductResponse.ok) {
            const errorData = await deductResponse.json();
            console.error(`❌ LOOKUP BOOKING - Failed to deduct part ${part.name}:`, errorData.error);
            } else {
            console.log(`✅ LOOKUP BOOKING - Successfully deducted ${part.qty} of part ${part.partNumber}`);
          }
        } catch (error) {
          console.error(`❌ LOOKUP BOOKING - Error deducting part ${part.name}:`, error);
        }
      }
      
      // Refresh bookings
      const res = await fetch('https://workshop-backend-six.vercel.app/api/bookings');
      setBookings(await res.json());
      setShowLookupBookingModal(false);
      // Reset lookup form
      setLookupCar(null);
      setLookupCustomer({ name: '', email: '', phone: '', postcode: '', address: '' });
      setLookupParts([]);
      setLookupCustomServices([]);
      setLookupManualTime('09:00');
      setLookupManualDate(dayjs().format('YYYY-MM-DD'));
      setShowLookupAddService(false);
    } catch (e) {
      alert('Failed to save booking');
    } finally {
      setManualLoading(false);
    }
  };

  // Fetch all parts when the Parts Management modal opens
  useEffect(() => {
    if (showPartsModal) {
      fetch('https://workshop-backend-six.vercel.app/api/parts')
        .then(res => res.json())
        .then(setPartsTable);
    }
  }, [showPartsModal]);



  // Delete part from database and refresh list
  const handleDeletePartFromDB = async (id: string) => {
    await fetch(`https://workshop-backend-six.vercel.app/api/parts/${id}`, { method: 'DELETE' });
    fetch('https://workshop-backend-six.vercel.app/api/parts')
      .then(res => res.json())
      .then(setPartsTable);
  };

  // Open edit part modal
  const openEditPart = (part: any) => {
    setEditPartId(part._id || 'temp');
    setEditPartDraft({ ...part });
  };

  // Save edit part
  const saveEditPart = async () => {
    if (!editPartId) return;
    
    try {
      // If it's a temporary ID (from manual entry or lookup), just update the local state
      if (editPartId === 'temp') {
        // Find which context we're editing by checking if the part exists in lookupParts
        const isLookupPart = lookupParts.some(p => 
          p.partNumber === editPartDraft.partNumber && p.name === editPartDraft.name
        );
        
        if (isLookupPart) {
          // Update lookup parts
          setLookupParts(parts => parts.map(p => 
            p.partNumber === editPartDraft.partNumber && p.name === editPartDraft.name 
              ? { ...editPartDraft, _id: p._id } 
              : p
          ));
        } else {
          // Update manual entry parts
          setParts(parts => parts.map(p => 
            p.partNumber === editPartDraft.partNumber && p.name === editPartDraft.name 
              ? { ...editPartDraft, _id: p._id } 
              : p
          ));
        }
      } else {
        // It's a real part from the database, update it
        const response = await fetch(`https://workshop-backend-six.vercel.app/api/parts/${editPartId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editPartDraft),
        });
        
        if (response.ok) {
          // Refresh parts list
          fetch('https://workshop-backend-six.vercel.app/api/parts')
            .then(res => res.json())
            .then(setPartsTable);
        }
      }
      
      setEditPartId(null);
      setEditPartDraft({});
    } catch (error) {
      console.error('Failed to update part:', error);
    }
  };

  // Cancel edit part
  const cancelEditPart = () => {
    setEditPartId(null);
    setEditPartDraft({});
  };

  const handleDeleteService = async (service: ServiceItem, index: number) => {
    if (!isAdmin) return;
    if (service._id) {
      await fetch(`https://workshop-backend-six.vercel.app/api/services/${service._id}`, { method: 'DELETE' });
    }
    setServiceOptions(prev => prev.filter((_, i) => i !== index));
    if (selectedService >= serviceOptions.length - 1) setSelectedService(0);
  };

  const [editServiceIdx, setEditServiceIdx] = useState<number | null>(null);
  const [editServiceDraft, setEditServiceDraft] = useState<ServiceItem>({ label: '', sub: '', price: 0, labourHours: 0, labourCost: 0 });

  const openEditService = (srv: ServiceItem, idx: number) => {
    if (!isAdmin) return;
    setEditServiceIdx(idx);
    setEditServiceDraft({ _id: srv._id, label: srv.label, sub: srv.sub, price: srv.price || 0, labourHours: srv.labourHours || 0, labourCost: srv.labourCost || 0 });
  };

  const saveEditService = async () => {
    if (editServiceIdx === null) return;
    const payload = { 
      label: editServiceDraft.label, 
      sub: editServiceDraft.sub, 
      price: editServiceDraft.price || 0, 
      category: (editServiceDraft.sub.split(' - ')[1] || '').trim() || 'Maintenance', 
      description: (editServiceDraft as any).description || undefined,
      labourHours: (editServiceDraft as any).labourHours || 0,
      labourCost: (editServiceDraft as any).labourCost || 0
    };
    let saved: ServiceItem | null = null;
    if (editServiceDraft._id) {
      const res = await fetch(`https://workshop-backend-six.vercel.app/api/services/${editServiceDraft._id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      saved = await res.json();
    } else {
      const res = await fetch('https://workshop-backend-six.vercel.app/api/services', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      saved = await res.json();
    }
    setServiceOptions(list => list.map((s, i) => i === editServiceIdx ? (saved || payload) : s));
    setEditServiceIdx(null);
  };

  const addNewService = () => {
    if (!isAdmin) return;
    setEditServiceIdx(serviceOptions.length);
    setEditServiceDraft({ label: '', sub: '', price: 0 });
    setShowAddService(true);
  };

  const handleCreateService = async () => {
    if (newService.label && newService.sub) {
      try {
        await fetch('https://workshop-backend-six.vercel.app/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newService),
        });
        // Refresh services
        fetch('https://workshop-backend-six.vercel.app/api/services')
          .then(r => r.json())
          .then((list: ServiceItem[]) => setServiceOptions(list))
          .catch(() => setServiceOptions([]));
        setShowAddService(false);
        setNewService({ label: '', sub: '', price: '', description: '', labourHours: '', labourCost: '' });
      } catch (e) {
        alert('Failed to create service');
      }
    }
  };

  // Handle creating service for lookup context
  const handleCreateLookupService = async () => {
    if (lookupNewService.label && lookupNewService.sub) {
      try {
        const serviceData = {
          label: lookupNewService.label,
          sub: lookupNewService.sub,
          price: parseFloat(lookupNewService.price) || 0,
          category: lookupNewService.category || 'Maintenance',
          description: lookupNewService.sub,
          labourHours: parseFloat(lookupNewService.labourHours) || 0,
          labourCost: parseFloat(lookupNewService.labourCost) || 0
        };
        
        await fetch('https://workshop-backend-six.vercel.app/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceData),
        });
        
        // Add to lookup custom services
        setLookupCustomServices(prev => [...prev, serviceData]);
        
        // Reset form
                              setLookupNewService({ label: '', sub: '', price: '', category: 'Maintenance', description: '', labourHours: '', labourCost: '' });
        setShowLookupAddService(false);
        
        // Select the newly created service
        setLookupSelectedService(serviceOptions.length + lookupCustomServices.length);
      } catch (e) {
        alert('Failed to create service');
      }
    }
  };

  // User Service Tracking Functions
  const fetchUserServices = async (searchParams?: { email?: string; registration?: string }) => {
    setUserServicesLoading(true);
    try {
      let url = 'https://workshop-backend-six.vercel.app/api/user-services';
      if (searchParams) {
        const params = new URLSearchParams();
        if (searchParams.email) params.append('email', searchParams.email);
        if (searchParams.registration) params.append('registration', searchParams.registration);
        if (params.toString()) url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setUserServices(data);
      } else {
        setUserServices([]);
      }
    } catch (error) {
      console.error('Error fetching user services:', error);
      setUserServices([]);
    } finally {
      setUserServicesLoading(false);
    }
  };

  // Auto-fill part details from database
  const autoFillPartDetails = async (partNumber: string, name: string) => {
    try {
      const response = await fetch('https://workshop-backend-six.vercel.app/api/parts');
      if (response.ok) {
        const parts = await response.json();
        // Case-insensitive search by part number or name
        const foundPart = parts.find((part: any) => 
          part.partNumber?.toLowerCase() === partNumber.toLowerCase() ||
          part.name?.toLowerCase() === name.toLowerCase()
        );
        
        if (foundPart) {
          return {
            partNumber: foundPart.partNumber,
            name: foundPart.name,
            supplier: foundPart.supplier || '',
            cost: foundPart.cost?.toString() || '',
            profit: foundPart.profit?.toString() || '20',
            price: foundPart.price?.toString() || '',
            qty: 1,
            availableQty: foundPart.qty || 0
          };
        }
      }
    } catch (error) {
      console.error('Error fetching parts:', error);
    }
    return null;
  };

  const handleUserServicesSearch = () => {
    if (userServicesSearch.email || userServicesSearch.registration) {
      fetchUserServices(userServicesSearch);
    } else {
      fetchUserServices();
    }
  };

  const clearUserServicesSearch = () => {
    setUserServicesSearch({ email: '', registration: '' });
    fetchUserServices();
  };

  useEffect(() => {
    if (showUserServicesModal) {
      fetchUserServices();
    }
  }, [showUserServicesModal]);



  return (
    <>
      <style>{`
        .dashboard-modal-bg {
          position: fixed; z-index: 1000; left: 0; top: 0; width: 100vw; height: 100vh; background: #000a; display: flex; align-items: center; justify-content: center;
        }
        .dashboard-modal {
          background: #181818; border-radius: 18px; box-shadow: 0 4px 32px #000b; padding: 40px 40px 32px 40px; min-width: 340px; max-width: 480px; width: 95vw; color: #eaeaea; position: relative;
        }
        .dashboard-modal-wide {
          max-width: 700px; width: 98vw; min-width: 320px;
          max-height: 90vh; overflow-y: auto;
        }
        .dashboard-modal-close {
          position: absolute; right: 28px; top: 28px; color: #fff; background: none; border: none; font-size: 2.1rem; cursor: pointer; line-height: 1;
        }
        .dashboard-modal .modal-row { display: flex; align-items: center; gap: 18px; margin-bottom: 24px; }
        .dashboard-modal .modal-row input { flex: 1; background: #111; color: #eaeaea; border: 1.5px solid #232323; border-radius: 8px; padding: 14px 18px; font-size: 1.08rem; }
        .dashboard-modal .modal-btn-yellow {
          background: #ffd600; color: #111; border: none; border-radius: 10px; padding: 14px 32px; font-weight: 600; font-size: 1.08rem; cursor: pointer; display: flex; align-items: center; gap: 8px; margin-bottom: 0;
        }
        .dashboard-modal .modal-btn-outline {
          background: none; color: #fff; border: 2px solid #444; border-radius: 10px; padding: 14px 32px; font-weight: 600; font-size: 1.08rem; cursor: pointer; margin-bottom: 0;
        }
        .dashboard-modal .modal-btn-block { width: 100%; margin-bottom: 18px; }
        .dashboard-modal .modal-btn-row { display: flex; gap: 18px; margin-bottom: 18px; }
        .dashboard-modal .modal-btn-row .modal-btn-yellow, .dashboard-modal .modal-btn-row .modal-btn-outline { flex: 1; }
        .dashboard-modal .modal-btn-row:last-child { margin-bottom: 0; }
        .dashboard-modal label { font-weight: 500; margin-bottom: 8px; display: block; }
        .dashboard-modal h2 { font-size: 1.35rem; font-weight: 700; margin-bottom: 32px; color: #fff; }
        .dashboard-modal .modal-section-title { font-weight: 600; margin: 24px 0 12px 0; font-size: 1.08rem; color: #fff; }
        .dashboard-modal .modal-service-grid { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 18px; }
        .dashboard-modal .modal-service-btn {
          background: #232323; color: #eaeaea; border: none; border-radius: 10px; padding: 18px 22px; font-weight: 600; font-size: 1rem; cursor: pointer; min-width: 140px; flex: 1 1 180px; display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
        }
        .dashboard-modal .modal-service-btn.selected {
          background: #ffd600; color: #111;
        }
        .dashboard-modal .modal-service-btn .modal-service-sub { font-weight: 400; font-size: 0.95rem; color: #bdbdbd; }
        .dashboard-modal .modal-btn-add { background: #232323; color: #eaeaea; border: 1.5px solid #444; border-radius: 10px; padding: 14px 22px; font-weight: 600; font-size: 1rem; cursor: pointer; min-width: 140px; margin-bottom: 0; }
        .dashboard-modal .modal-quote-summary { background: #232323; border-radius: 10px; padding: 18px; margin-bottom: 18px; }
        .dashboard-modal .modal-quote-summary .modal-quote-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .dashboard-modal .modal-quote-summary .modal-quote-row:last-child { margin-bottom: 0; }
        .dashboard-modal .modal-quote-summary .modal-quote-total { font-weight: 700; color: #ffd600; font-size: 1.08rem; }
        @media (max-width: 600px) {
          .dashboard-modal { padding: 16px 4px 12px 4px !important; border-radius: 10px !important; }
          .dashboard-modal-wide { padding: 8px 2px 8px 2px !important; border-radius: 10px !important; }
          .dashboard-modal h2 { font-size: 1.08rem !important; }
        }
        .schedule-modal-date-input {
          width: 100%;
          background: #111;
          color: #eaeaea;
          border: 2px solid #ffd600;
          border-radius: 8px;
          padding: 16px 48px 16px 16px;
          font-size: 1.13rem;
          outline: none;
          box-shadow: 0 0 0 2px #ffd60055;
        }
        .schedule-modal-date-input::placeholder {
          color: #bdbdbd;
          opacity: 1;
        }
        .schedule-modal-date-icon {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }
        .schedule-modal-summary {
          background: #181818;
          border-radius: 10px;
          padding: 18px 18px 14px 18px;
          margin-top: 18px;
          margin-bottom: 24px;
          color: #fff;
        }
        .schedule-modal-summary-title {
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 1.08rem;
        }
        .schedule-modal-summary-list {
          margin: 0 0 8px 0;
          padding-left: 18px;
        }
        .schedule-modal-summary-total {
          font-weight: 600;
          color: #ffd600;
          font-size: 1.08rem;
        }
        .schedule-modal-btn-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 32px;
        }
        .schedule-modal-btn-back {
          background: none;
          color: #fff;
          border: 2px solid #444;
          border-radius: 10px;
          padding: 14px 32px;
          font-weight: 600;
          font-size: 1.08rem;
          cursor: pointer;
        }
        .schedule-modal-btn-create {
          background: #ffd600;
          color: #111;
          border: none;
          border-radius: 10px;
          padding: 14px 32px;
          font-weight: 600;
          font-size: 1.08rem;
          cursor: pointer;
        }
        .schedule-modal-time-row {
          display: flex;
          gap: 12px;
          margin: 18px 0 18px 0;
        }
        .schedule-modal-time-btn {
          background: none;
          color: #fff;
          border: 2px solid #444;
          border-radius: 10px;
          padding: 16px 32px;
          font-weight: 600;
          font-size: 1.13rem;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border 0.2s;
        }
        .schedule-modal-time-btn.selected {
          background: #ffd600;
          color: #111;
          border: 2px solid #ffd600;
        }
        .dashboard-table-responsive {
          width: 100%;
          overflow-x: auto;
        }
        @media (max-width: 700px) {
          .dashboard-table-responsive table {
            min-width: 520px !important;
            font-size: 0.95rem !important;
          }
          .dashboard-table-responsive th, .dashboard-table-responsive td {
            padding: 8px 6px !important;
            font-size: 0.95rem !important;
          }
          .dashboard-table-responsive th {
            font-size: 1rem !important;
          }
        }
        @media (max-width: 900px) {
          .dashboard-modal, .dashboard-modal-wide {
            padding: 16px 4px 12px 4px !important;
            border-radius: 10px !important;
            min-width: 0 !important;
            max-width: 98vw !important;
          }
          .dashboard-modal h2 {
            font-size: 1.08rem !important;
          }
          #rrrre > div {
            padding: 0 4px !important;
          }
        }
        @media (max-width: 700px) {
          #rrrre > div {
            padding: 0 2px !important;
          }
          .dashboard-modal, .dashboard-modal-wide {
            padding: 8px 2px 8px 2px !important;
            border-radius: 8px !important;
            min-width: 0 !important;
            max-width: 100vw !important;
          }
          .dashboard-modal h2 {
            font-size: 1rem !important;
          }
          .dashboard-table {
            min-width: 520px !important;
            font-size: 0.95rem !important;
          }
          .dashboard-table th, .dashboard-table td {
            padding: 8px 6px !important;
            font-size: 0.95rem !important;
          }
          .dashboard-table th {
            font-size: 1rem !important;
          }
          .dashboard-booking-card {
            padding: 10px 8px !important;
            font-size: 0.98rem !important;
            max-width: 98vw !important;
          }
          .dashboard-controls {
            flex-direction: column !important;
            gap: 8px !important;
            align-items: stretch !important;
          }
        }
      `}</style>
      <Navbar />
      <div id="rrrre">
        <div style={{ background: '#111', minHeight: '100vh', padding: 0 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ marginTop: 32, marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: '2.5rem', color: '#fff', marginBottom: 8 }}>Admin Dashboard</div>
              <div style={{ color: '#bdbdbd', fontSize: '1.15rem', marginBottom: 8 }}>Manage bookings, parts, and system administration.</div>
              <div style={{ width: 64, height: 4, background: '#ffd600', borderRadius: 2, marginBottom: 32 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }} className="dashboard-controls">
              <button onClick={handlePrevDay} style={{ background: 'none', color: '#fff', border: '2px solid #444', borderRadius: 8, padding: '10px 22px', fontWeight: 500, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>&lt; Previous Day</button>
              <div style={{ fontWeight: 600, fontSize: '1.15rem', color: '#fff', margin: '0 12px' }}>{dashboardDate.format('dddd, MMMM D, YYYY')}</div>
              <button onClick={handleNextDay} style={{ background: 'none', color: '#fff', border: '2px solid #444', borderRadius: 8, padding: '10px 22px', fontWeight: 500, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>Next Day &gt;</button>
              <div style={{ flex: 1 }} />
              <button onClick={() => setShowModal(true)} style={{ background: '#ffd600', color: '#111', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><PlusIcon />New Booking</button>
              <button onClick={() => setShowPartsModal(true)} style={{ background: '#232323', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 500, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><BoxIcon />Parts Management</button>
              <button onClick={() => { setShowUserServicesModal(true); fetchUserServices(); }} style={{ background: '#232323', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: '500', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>📊 User Services</button>
              <button onClick={() => window.location.href = '/dashboard/admin-messages'} style={{ background: '#232323', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: '500', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
                💬 Admin Messages
                {unreadMessages > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#ff4444',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600'
                  }}>
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </button>

            </div>



            <div style={{ background: '#181818', borderRadius: 16, boxShadow: '0 4px 24px #0006', padding: 0, overflow: 'hidden', minHeight: 600 }}>
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <table className="dashboard-table"
                  style={{
                    width: '100%',
                    minWidth: 700,
                    borderCollapse: 'collapse',
                    color: '#eaeaea',
                    fontSize: '1.08rem',
                    tableLayout: 'fixed'
                  }}
                >
                  <thead>
                    <tr style={{ background: '#181818', color: '#bdbdbd', fontWeight: 600, fontSize: headerFontSize }}>
                      <th style={{ padding: cellPad, textAlign: 'left', fontWeight: 600, width: 80 }}>Time</th>
                      <th style={{ padding: cellPad, textAlign: 'left', fontWeight: 600, width: 80 }}>Tyres</th>
                      <th style={{ padding: cellPad, textAlign: 'left', fontWeight: 600, width: 80 }}>Services</th>
                      <th style={{ padding: cellPad, textAlign: 'left', fontWeight: 600, width: 80 }}>Mechanical</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map(slot => (
                      <tr key={slot} style={{ borderTop: '1px solid #232323' }}>
                        <td style={{ padding: cellPad, color: '#bdbdbd', fontSize: timeFontSize, width: 80 }}>{slot}</td>
                        <td style={{ padding: cellPad, width: 80 }}>
                          {/* Tyres column: show only bookings with category 'tyres' */}
                          {bookingsForDate.filter(b => b.time === slot && (b.category || '').toLowerCase() === 'tyres').map((b, i) => (
                            <div key={i} className="dashboard-booking-card" style={{
                              background: '#ffd600',
                              color: '#111',
                              borderRadius: 10,
                              padding: '14px 18px',
                              fontWeight: 700,
                              fontSize: '1.08rem',
                              boxShadow: '0 2px 8px #0002',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: 16,
                              maxWidth: 260,
                              width: '100%',
                              marginLeft: '-70px',
                              marginRight: '170px'
                            }}>
                              <span style={{ fontWeight: 700, fontSize: '1.08rem', marginBottom: 2 }}>{b.car?.registration || 'N/A'}</span>
                              <span style={{ fontWeight: 500, fontSize: '1.01rem' }}>£{typeof b.total === 'number' ? b.total.toFixed(2) : (b.total ? Number(b.total).toFixed(2) : '0.00')}</span>
                            </div>
                          ))}
                        </td>
                        <td style={{ padding: cellPad, width: 80 }}>
                          {/* Services column: show only bookings with category 'service' */}
                          {bookingsForDate.filter(b => b.time === slot && (b.category || '').toLowerCase() === 'service').map((b, i) => (
                            <div key={i} className="dashboard-booking-card" style={{
                              background: '#ffd600',
                              color: '#111',
                              borderRadius: 10,
                              padding: '14px 18px',
                              fontWeight: 700,
                              fontSize: '1.08rem',
                              boxShadow: '0 2px 8px #0002',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: 16,
                              maxWidth: 260,
                              width: '100%',
                              marginLeft: '-50px',
                              marginRight: '170px'
                            }}>
                              <span style={{ fontWeight: 700, fontSize: '1.08rem', marginBottom: 2 }}>{b.car?.registration || 'N/A'}</span>
                              <span style={{ fontWeight: 500, fontSize: '1.01rem' }}>£{typeof b.total === 'number' ? b.total.toFixed(2) : (b.total ? Number(b.total).toFixed(2) : '0.00')}</span>
                            </div>
                          ))}
                        </td>
                        <td style={{ padding: cellPad, width: 80 }}>
                          {/* Mechanical column: show only bookings with category 'mechanical' */}
                          {bookingsForDate.filter(b => b.time === slot && (b.category || '').toLowerCase() === 'mechanical').map((b, i) => (
                            <div key={i} className="dashboard-booking-card" style={{
                              background: '#ffd600',
                              color: '#111',
                              borderRadius: 10,
                              padding: '14px 18px',
                              fontWeight: 700,
                              fontSize: '1.08rem',
                              boxShadow: '0 2px 8px #0002',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: 16,
                              maxWidth: 260,
                              width: '100%',
                              marginLeft: '-50px',
                              marginRight: '170px'
                            }}>
                              <span style={{ fontWeight: 700, fontSize: '1.08rem', marginBottom: 2 }}>{b.car?.registration || 'N/A'}</span>
                              <span style={{ fontWeight: 500, fontSize: '1.01rem' }}>£{typeof b.total === 'number' ? b.total.toFixed(2) : (b.total ? Number(b.total).toFixed(2) : '0.00')}</span>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
      {showModal && (
        <div className="dashboard-modal-bg">
          <div className="dashboard-modal">
            <button className="dashboard-modal-close" onClick={() => setShowModal(false)}>&times;</button>
            <h2>New Booking</h2>
            <div style={{ borderTop: '1.5px solid #232323', margin: '0 -40px 32px -40px' }} />
            <label htmlFor="reg" style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>Vehicle Registration</label>
            <div className="modal-row">
              <input id="reg" type="text" placeholder="Enter registration" value={regInput} onChange={e => setRegInput(e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }} />
              <button className="modal-btn-yellow" style={{ minWidth: 140 }} onClick={handleDVLAlookup} disabled={lookupLoading || !regInput}>
                {lookupLoading ? 'Looking up...' : (<><LookupIcon />Lookup</>)}
              </button>
            </div>
            {lookupError && <div style={{ color: '#ff6b6b', marginBottom: 8 }}>{lookupError}</div>}
            {lookupResult && (
              <div style={{ background: '#232323', borderRadius: 10, padding: 16, margin: '16px 0', color: '#fff' }}>
                <div><b>Registration Number:</b> {lookupResult.registrationNumber || 'N/A'}</div>
                <div><b>Tax Status:</b> {lookupResult.taxStatus || 'N/A'}</div>
                <div><b>Tax Due Date:</b> {lookupResult.taxDueDate || 'N/A'}</div>
                <div><b>MOT Status:</b> {lookupResult.motStatus || 'N/A'}</div>
                <div><b>MOT Expiry Date:</b> {lookupResult.motExpiryDate || 'N/A'}</div>
                <div><b>Make:</b> {lookupResult.make || 'N/A'}</div>
                <div><b>Year of Manufacture:</b> {lookupResult.yearOfManufacture || 'N/A'}</div>
                <div><b>Engine Capacity:</b> {lookupResult.engineCapacity || 'N/A'} cc</div>
                <div><b>CO2 Emissions:</b> {lookupResult.co2Emissions || 'N/A'}</div>
                <div><b>Fuel Type:</b> {lookupResult.fuelType || 'N/A'}</div>
                <div><b>Marked For Export:</b> {lookupResult.markedForExport ? 'Yes' : 'No'}</div>
                <div><b>Colour:</b> {lookupResult.colour || 'N/A'}</div>
                <div><b>Type Approval:</b> {lookupResult.typeApproval || 'N/A'}</div>
                <div><b>Date of Last V5C Issued:</b> {lookupResult.dateOfLastV5CIssued || 'N/A'}</div>
                <div><b>Wheelplan:</b> {lookupResult.wheelplan || 'N/A'}</div>
                <div><b>Month of First Registration:</b> {lookupResult.monthOfFirstRegistration || 'N/A'}</div>
                <button className="modal-btn-yellow" style={{ marginTop: 16 }} onClick={() => {
                  setShowModal(false);
                  setShowLookupBookingModal(true);
                  setLookupCar({
                    make: lookupResult.make,
                    model: lookupResult.model || '',
                    year: lookupResult.yearOfManufacture || '',
                    registration: lookupResult.registrationNumber || '',
                  });
                }}>Continue</button>
              </div>
            )}
            <div className="modal-btn-row">
              <button className="modal-btn-outline modal-btn-block" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="modal-btn-yellow modal-btn-block" onClick={() => { setShowModal(false); setShowManual(true); setAddPartContext('manual'); }}>Enter Manually</button>
            </div>
         
          </div>
        </div>
      )}
      {showManual && (
        <div className="dashboard-modal-bg">
          <div className="dashboard-modal dashboard-modal-wide">
            <button className="dashboard-modal-close" onClick={() => setShowManual(false)}>&times;</button>
            <h2>New Booking</h2>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Make *</label>
                <input type="text" required value={manualCar.make} onChange={e => setManualCar(c => ({ ...c, make: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Model *</label>
                <input type="text" required value={manualCar.model} onChange={e => setManualCar(c => ({ ...c, model: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Year *</label>
                <input type="text" required value={manualCar.year} onChange={e => setManualCar(c => ({ ...c, year: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Registration *</label>
                <input type="text" required value={manualCar.registration} onChange={e => setManualCar(c => ({ ...c, registration: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
            </div>
            <div className="modal-section-title">Customer Information</div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Full Name *</label>
                <input type="text" required value={manualCustomer.name} onChange={e => setManualCustomer(c => ({ ...c, name: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Email Address *</label>
                <input type="email" required value={manualCustomer.email} onChange={e => setManualCustomer(c => ({ ...c, email: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Phone Number *</label>
                <input type="text" required value={manualCustomer.phone} onChange={e => setManualCustomer(c => ({ ...c, phone: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Postcode *</label>
                <input type="text" required value={manualCustomer.postcode} onChange={e => setManualCustomer(c => ({ ...c, postcode: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Date *</label>
                <input type="date" required value={manualDate} onChange={e => setManualDate(e.target.value)} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Time *</label>
                <select required value={manualTime} onChange={e => setManualTime(e.target.value)} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }}>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="12:00">12:00</option>
                  <option value="13:00">13:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Address *</label>
              <input type="text" required value={manualCustomer.address} onChange={e => setManualCustomer(c => ({ ...c, address: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Booking Date *</label>
              <input
                type="date"
                required
                value={manualDate}
                min={dayjs().format('YYYY-MM-DD')}
                onChange={e => setManualDate(e.target.value)}
                style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Booking Time *</label>
              <input
                type="time"
                required
                value={manualTime}
                onChange={e => setManualTime(e.target.value)}
                style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, marginTop: 24 }}>
              <div className="modal-section-title" style={{ margin: 0 }}>Services Required</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="modal-btn-outline" style={{ margin: 0, fontSize: '0.9rem', padding: '6px 12px' }} onClick={refreshServices}>🔄 Refresh</button>
                <button className="modal-btn-add" style={{ margin: 0 }} onClick={() => setShowAddService(v => !v)}>+ Add Other Service</button>
              </div>
            </div>
            {showAddService && (
              <div style={{
                background: '#181818',
                borderRadius: 12,
                padding: '24px 24px 18px 24px',
                marginBottom: 18,
                marginTop: 8,
                boxShadow: '0 2px 12px #0006',
                maxWidth: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 2, minWidth: 120 }}>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Service Name *</label>
                    <input
                      type="text"
                      placeholder="Service Name"
                      value={newService.label}
                      onChange={e => setNewService(s => ({ ...s, label: e.target.value }))}
                      style={{ width: '100%', background: '#111', color: '#eaeaea', border: '2px solid #ffd600', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 80 }}>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Duration *</label>
                    <input
                      type="text"
                      placeholder="Duration (e.g. 1h)"
                      value={newService.sub.split(' - ')[0] || ''}
                      onChange={e => setNewService(s => ({ ...s, sub: e.target.value + (s.sub.includes(' - ') ? s.sub.slice(s.sub.indexOf(' - ')) : '') }))}
                      style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 80 }}>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Category *</label>
                    <select
                      value={newService.sub.includes(' - ') ? newService.sub.split(' - ')[1] : ''}
                      onChange={e => setNewService(s => ({ ...s, sub: (s.sub.split(' - ')[0] || '') + ' - ' + e.target.value }))}
                      style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }}
                    >
                      <option value="">Select category</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Repairs">Repairs</option>
                      <option value="Diagnostics">Diagnostics</option>
                      <option value="Inspection">Inspection</option>
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Service Price (£)</label>
                    <input
                      type="number"
                      placeholder="Price (£)"
                      value={newService.price}
                      onChange={e => setNewService(s => ({ ...s, price: e.target.value }))}
                      style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }}
                    />
                  </div>
                  <div style={{ width: '100%' }}>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Description</label>
                    <textarea
                      placeholder="Description (optional)"
                      value={newService.description}
                      onChange={e => setNewService(s => ({ ...s, description: e.target.value }))}
                      style={{ width: '100%', minHeight: 80, background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', width: '100%' }}>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Labour Hours</label>
                      <input
                        type="number"
                        placeholder="Labour Hours (e.g. 2.5)"
                        value={newService.labourHours}
                        onChange={e => setNewService(s => ({ ...s, labourHours: e.target.value }))}
                        style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Labour Cost per Hour (£)</label>
                      <input
                        type="number"
                        placeholder="Labour Cost per Hour (£)"
                        value={newService.labourCost}
                        onChange={e => setNewService(s => ({ ...s, labourCost: e.target.value }))}
                        style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                  <button className="modal-btn-outline" style={{ minWidth: 100 }} onClick={() => setShowAddService(false)}>Cancel</button>
                  <button className="modal-btn-yellow" style={{ minWidth: 100 }} onClick={handleCreateService}>Add Service</button>
                </div>
              </div>
            )}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '18px',
              width: '100%',
            }}>
              {serviceOptions.map((s, i) => {
                const adminCategory = mapToAdminCategory(s);
                const categoryColor = adminCategory === 'tyres' ? '#ff6b6b' : adminCategory === 'mechanical' ? '#4ecdc4' : '#ffd600';
                return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setSelectedService(i)}
                  style={{
                    background: selectedService === i ? '#ffd600' : '#181818',
                    color: selectedService === i ? '#111' : '#fff',
                    border: selectedService === i ? '2px solid #ffd600' : '2px solid #444',
                    borderRadius: 12,
                    padding: '32px 32px',
                    fontWeight: 600,
                    fontSize: '1.18rem',
                    cursor: 'pointer',
                    minWidth: 0,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 6,
                    boxSizing: 'border-box',
                    transition: 'background 0.2s, color 0.2s, border 0.2s',
                    position: 'relative'
                  }}
                >
                  <span>{s.label}</span>
                  <span style={{ fontWeight: 400, fontSize: '1.02rem', color: selectedService === i ? '#111' : '#bdbdbd' }}>{s.sub}</span>
                  {typeof s.price === 'number' && s.price > 0 && (
                    <span style={{ marginTop: 6, fontWeight: 700, color: selectedService === i ? '#111' : '#ffd600' }}>£{s.price.toFixed(2)}</span>
                  )}
                  {typeof s.labourHours === 'number' && s.labourHours > 0 && typeof s.labourCost === 'number' && s.labourCost > 0 && (
                    <span style={{ marginTop: 4, fontWeight: 500, fontSize: '0.9rem', color: selectedService === i ? '#111' : '#bdbdbd' }}>
                      Labour: {s.labourHours}h × £{s.labourCost}/h = £{(s.labourHours * s.labourCost).toFixed(2)}
                    </span>
                  )}
                  <span style={{ 
                    position: 'absolute', 
                    top: 8, 
                    left: 8, 
                    background: categoryColor, 
                    color: '#111', 
                    padding: '2px 8px', 
                    borderRadius: 12, 
                    fontSize: '0.8rem', 
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}>
                    {adminCategory}
                  </span>
                  {isAdmin && (
                    <div style={{ position: 'absolute', right: 10, top: 10, display: 'flex', gap: 8 }}>
                      <button type="button" onClick={(e) => { e.stopPropagation(); openEditService(s, i); }} style={{ background: '#232323', color: '#fff', border: '1px solid #444', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>Edit</button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteService(s, i); }} style={{ background: '#a33', color: '#fff', border: '1px solid #733', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer' }}>×</button>
                    </div>
                  )}
                </button>
              );
            })}
              {customServices.map((s, i) => {
                const adminCategory = mapToAdminCategory(s);
                const categoryColor = adminCategory === 'tyres' ? '#ff6b6b' : adminCategory === 'mechanical' ? '#4ecdc4' : '#ffd600';
                return (
                <button
                  key={s.label + s.sub + i}
                  type="button"
                  onClick={() => setSelectedService(serviceOptions.length + i)}
                  style={{
                    background: selectedService === serviceOptions.length + i ? '#ffd600' : '#181818',
                    color: selectedService === serviceOptions.length + i ? '#111' : '#fff',
                    border: selectedService === serviceOptions.length + i ? '2px solid #ffd600' : '2px solid #444',
                    borderRadius: 12,
                    padding: '32px 32px',
                    fontWeight: 600,
                    fontSize: '1.18rem',
                    cursor: 'pointer',
                    minWidth: 0,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 6,
                    boxSizing: 'border-box',
                    transition: 'background 0.2s, color 0.2s, border 0.2s',
                      position: 'relative'
                  }}
                >
                  <span>{s.label}</span>
                  <span style={{ fontWeight: 400, fontSize: '1.02rem', color: selectedService === serviceOptions.length + i ? '#111' : '#bdbdbd' }}>{s.sub}</span>
                  {typeof s.price === 'number' && s.price > 0 && (
                    <span style={{ marginTop: 6, fontWeight: 700, color: selectedService === serviceOptions.length + i ? '#111' : '#ffd600' }}>£{s.price.toFixed(2)}</span>
                  )}
                  {typeof s.labourHours === 'number' && s.labourHours > 0 && typeof s.labourCost === 'number' && s.labourCost > 0 && (
                    <span style={{ marginTop: 4, fontWeight: 500, fontSize: '0.9rem', color: selectedService === serviceOptions.length + i ? '#111' : '#bdbdbd' }}>
                      Labour: {s.labourHours}h × £{s.labourCost}/h = £{(s.labourHours * s.labourCost).toFixed(2)}
                    </span>
                  )}
                    <span style={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      background: categoryColor, 
                      color: '#111', 
                      padding: '2px 8px', 
                      borderRadius: 12, 
                      fontSize: '0.8rem', 
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {adminCategory}
                    </span>
                </button>
                );
              })}
            </div>
            {isAdmin && editServiceIdx !== null && (
              <div className="dashboard-modal-bg">
                <div className="dashboard-modal" style={{ maxWidth: 520 }}>
                  <button className="dashboard-modal-close" onClick={() => setEditServiceIdx(null)}>&times;</button>
                  <h2>Edit Service</h2>
                  <div className="modal-row">
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Service Name *</label>
                    <input type="text" placeholder="Service Name" value={editServiceDraft.label} onChange={e => setEditServiceDraft(s => ({ ...s, label: e.target.value }))} />
                  </div>
                  <div className="modal-row">
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Duration & Category *</label>
                    <input type="text" placeholder="Duration and category (e.g. 2h - services)" value={editServiceDraft.sub} onChange={e => setEditServiceDraft(s => ({ ...s, sub: e.target.value }))} />
                  </div>
                  <div className="modal-row">
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Service Price (£)</label>
                    <input type="number" placeholder="Price (optional)" value={editServiceDraft.price || 0} onChange={e => setEditServiceDraft(s => ({ ...s, price: Number(e.target.value) }))} />
                  </div>
                  <div className="modal-row">
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Labour Hours</label>
                    <input type="number" placeholder="Labour Hours (e.g. 2.5)" value={(editServiceDraft as any).labourHours || 0} onChange={e => setEditServiceDraft(s => ({ ...(s as any), labourHours: Number(e.target.value) }))} />
                  </div>
                  <div className="modal-row">
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Labour Cost per Hour (£)</label>
                    <input type="number" placeholder="Labour Cost per Hour (£)" value={(editServiceDraft as any).labourCost || 0} onChange={e => setEditServiceDraft(s => ({ ...(s as any), labourCost: Number(e.target.value) }))} />
                  </div>
                  <div className="modal-row">
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Description</label>
                    <textarea placeholder="Description (optional)" value={(editServiceDraft as any).description || ''} onChange={e => setEditServiceDraft(s => ({ ...(s as any), description: e.target.value }))} />
                  </div>
                  <div className="modal-btn-row">
                    <button className="modal-btn-outline" onClick={() => setEditServiceIdx(null)}>Cancel</button>
                    <button className="modal-btn-yellow" onClick={saveEditService}>Save</button>
                  </div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, marginTop: 24 }}>
              <div className="modal-section-title" style={{ margin: 0 }}>Parts Required</div>
              <button className="modal-btn-add" style={{ margin: 0 }} onClick={() => setShowAddPart(v => !v)}>+ Add New Part</button>
            </div>
            {showAddPart && (
              <div style={{
                background: '#181818',
                borderRadius: 12,
                padding: '32px 24px 24px 24px',
                marginBottom: 18,
                marginTop: 8,
                boxShadow: '0 2px 12px #0006',
                maxWidth: '100%',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <div>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Part Number *</label>
                    <input type="text" required value={partForm.partNumber} onChange={e => handlePartFormChange('partNumber', e.target.value)} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '2px solid #ffd600', borderRadius: 8, padding: '12px 14px', fontSize: '1rem', outline: 'none', boxShadow: '0 0 0 2px #ffd60055' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Name *</label>
                    <input type="text" required value={partForm.name} onChange={e => handlePartFormChange('name', e.target.value)} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18 }}>
                  <button className="modal-btn-outline" style={{ minWidth: 120 }} onClick={() => setShowAddPart(false)}>Cancel</button>
                  <button className="modal-btn-yellow" style={{ minWidth: 120 }} onClick={addPartContext === 'lookup' ? handleLookupAddPart : handleAddPart}>Add Part</button>
                </div>
              </div>
            )}
            {parts.length > 0 && parts.map((part, idx) => (
              <div key={idx} style={{
                background: '#181818',
                borderRadius: 12,
                padding: '18px 24px',
                marginTop: 8,
                marginBottom: 0,
                boxShadow: '0 2px 12px #0006',
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                maxWidth: '100%',
              }}>
                <div style={{ flex: 3 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.18rem', color: '#fff' }}>{part.name}</div>
                  <div style={{ color: '#bdbdbd', fontSize: '1.05rem', marginTop: 2 }}>{part.partNumber}</div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => handlePartQty(idx, -1)} style={{ width: 38, height: 38, border: '1.5px solid #444', background: 'none', color: '#fff', borderRadius: 8, fontSize: '1.3rem', cursor: 'pointer' }}>-</button>
                  <span style={{ minWidth: 24, textAlign: 'center', color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>{part.qty}</span>
                  <button onClick={() => handlePartQty(idx, 1)} style={{ width: 38, height: 38, border: '1.5px solid #444', background: 'none', color: '#fff', borderRadius: 8, fontSize: '1.3rem', cursor: 'pointer' }}>+</button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEditPart(part)} style={{ background: '#232323', color: '#fff', border: '1px solid #444', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: '0.9rem' }}>Edit</button>
                  <button onClick={() => setParts(parts => parts.filter((_, i) => i !== idx))} style={{ background: '#a33', color: '#fff', border: '1px solid #733', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: '0.9rem' }}>Remove</button>
                </div>
              </div>
            ))}
            
            <div className="modal-quote-summary">
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Quote Summary</div>
                <div className="modal-quote-row"><span>Labour ({labourHours} hours)</span><span>£{typeof labourCost === 'number' ? labourCost.toFixed(2) : (labourCost ? Number(labourCost).toFixed(2) : '0.00')}</span></div>
                <div className="modal-quote-row"><span>Service</span><span>£{typeof servicePrice === 'number' ? servicePrice.toFixed(2) : (servicePrice ? Number(servicePrice).toFixed(2) : '0.00')}</span></div>
                <div className="modal-quote-row"><span>Parts</span><span>£{typeof partsCost === 'number' ? partsCost.toFixed(2) : (partsCost ? Number(partsCost).toFixed(2) : '0.00')}</span></div>
                <div className="modal-quote-row"><span>Subtotal</span><span>£{typeof subtotal === 'number' ? subtotal.toFixed(2) : (subtotal ? Number(subtotal).toFixed(2) : '0.00')}</span></div>
                <div className="modal-quote-row"><span>VAT (20%)</span><span>£{typeof vat === 'number' ? vat.toFixed(2) : (vat ? Number(vat).toFixed(2) : '0.00')}</span></div>
                <div className="modal-quote-row modal-quote-total"><span>Total</span><span>£{typeof total === 'number' ? total.toFixed(2) : (total ? Number(total).toFixed(2) : '0.00')}</span></div>
              </div>
            <div className="modal-btn-row">
              <button className="modal-btn-outline modal-btn-block" onClick={() => { setShowManual(false); setShowModal(true); }}>Back</button>
              <button className="modal-btn-yellow modal-btn-block" onClick={handleManualBooking} disabled={manualLoading}>{manualLoading ? 'Saving...' : 'Create Booking'}</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Parts Edit Modal - Global */}
      {editPartId && (
        <div className="dashboard-modal-bg">
          <div className="dashboard-modal" style={{ maxWidth: 520 }}>
            <button className="dashboard-modal-close" onClick={cancelEditPart}>&times;</button>
            <h2>Edit Part</h2>
            <div className="modal-row">
              <input type="text" placeholder="Part Number" value={editPartDraft.partNumber || ''} onChange={e => setEditPartDraft(p => ({ ...p, partNumber: e.target.value }))} />
            </div>
            <div className="modal-row">
              <input type="text" placeholder="Name" value={editPartDraft.name || ''} onChange={e => setEditPartDraft(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="modal-row">
              <input type="text" placeholder="Supplier" value={editPartDraft.supplier || ''} onChange={e => setEditPartDraft(p => ({ ...p, supplier: e.target.value }))} />
            </div>
            <div className="modal-row">
              <input type="number" step="0.01" placeholder="Cost" value={editPartDraft.cost || ''} onChange={e => setEditPartDraft(p => ({ ...p, cost: e.target.value }))} />
            </div>
            <div className="modal-row">
              <input type="number" step="0.1" placeholder="Profit %" value={editPartDraft.profit || ''} onChange={e => setEditPartDraft(p => ({ ...p, profit: e.target.value }))} />
            </div>
            <div className="modal-row">
              <input type="number" step="0.01" placeholder="Price" value={editPartDraft.price || ''} onChange={e => setEditPartDraft(p => ({ ...p, price: e.target.value }))} />
            </div>
            <div className="modal-row">
              <input type="number" placeholder="Quantity" value={editPartDraft.qty || ''} onChange={e => setEditPartDraft(p => ({ ...p, qty: e.target.value }))} />
            </div>
            <div className="modal-btn-row">
              <button className="modal-btn-outline" onClick={cancelEditPart}>Cancel</button>
              <button className="modal-btn-yellow" onClick={saveEditPart}>Save</button>
            </div>
          </div>
        </div>
      )}
      
      {showScheduleModal && (
        <div className="dashboard-modal-bg">
          <div className="dashboard-modal" style={{ minWidth: 340, maxWidth: 480, width: '95vw', color: '#eaeaea', position: 'relative' }}>
            <button className="dashboard-modal-close" onClick={() => setShowScheduleModal(false)}>&times;</button>
            <h2 style={{ marginBottom: 24 }}>New Booking</h2>
            <div style={{ borderTop: '1.5px solid #232323', margin: '0 -40px 32px -40px' }} />
            <div style={{ fontWeight: 600, fontSize: '1.08rem', marginBottom: 16, color: '#fff' }}>Schedule Booking</div>
            <label htmlFor="schedule-date" style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>Select Date</label>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <input
                id="schedule-date"
                type="date"
                className="schedule-modal-date-input"
                value={scheduleDate}
                onChange={handleScheduleDateChange}
                style={{
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  background: '#111',
                  color: scheduleDate ? '#eaeaea' : '#bdbdbd',
                  border: '2px solid #ffd600',
                  borderRadius: 8,
                  padding: '16px 48px 16px 16px',
                  fontSize: '1.13rem',
                  outline: 'none',
                  boxShadow: '0 0 0 2px #ffd60055',
                  width: '100%',
                }}
              />
              <span className="schedule-modal-date-icon" style={{ pointerEvents: 'none' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffd600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </span>
            </div>
            {scheduleDate && (
              <>
                <div style={{ fontWeight: 600, fontSize: '1.08rem', marginBottom: 8, color: '#fff', marginTop: 18 }}>Services - Available Time Slots</div>
                <div className="schedule-modal-time-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '18px 0 18px 0', justifyContent: 'flex-start' }}>
                  {timeSlots.map(slot => (
                    <button
                      key={slot}
                      className={`schedule-modal-time-btn${selectedTime === slot ? ' selected' : ''}`}
                      onClick={() => setSelectedTime(slot)}
                      type="button"
                      style={{
                        flex: '1 1 120px',
                        minWidth: 100,
                        maxWidth: 'calc(50% - 12px)',
                        marginBottom: 8,
                        boxSizing: 'border-box',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="schedule-modal-summary">
              <div className="schedule-modal-summary-title">Booking Summary</div>
              <div style={{ marginBottom: 6 }}>Services:</div>
              <ul className="schedule-modal-summary-list">
                <li>{serviceOptions[selectedService].label} ({serviceOptions[selectedService].sub.split(' - ')[0]}){selectedTime ? ` - ${selectedTime}` : ''}</li>
              </ul>
              <div style={{ marginTop: 12, fontWeight: 600, color: '#ffd600' }}>Total: £{serviceOptions[selectedService].price || 0}</div>
            </div>
            <div className="modal-btn-row">
              <button className="modal-btn-outline modal-btn-block" onClick={() => setShowScheduleModal(false)}>Cancel</button>
              <button className="modal-btn-yellow modal-btn-block" onClick={handleCreateBooking}>Create Booking</button>
            </div>
          </div>
        </div>
      )}
      
      {/* User Services Tracking Modal */}
      {showUserServicesModal && (
        <div className="dashboard-modal-bg">
          <div className="dashboard-modal dashboard-modal-wide" style={{ maxWidth: 1200, width: '98vw', minWidth: 320, padding: 0, position: 'relative' }}>
            <button className="dashboard-modal-close" onClick={() => setShowUserServicesModal(false)}>&times;</button>
            <div style={{ padding: '36px 36px 0 36px' }}>
              <div style={{ fontWeight: 700, fontSize: '2rem', color: '#fff', marginBottom: 24 }}>User Services Tracking</div>
              
              {/* Search Section */}
              <div style={{ 
                background: '#232323', 
                borderRadius: '8px', 
                padding: '20px', 
                marginBottom: '24px',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-end',
                flexWrap: 'wrap'
              }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', color: '#bdbdbd', marginBottom: '8px', fontSize: '0.9rem' }}>Search by Email</label>
                  <input 
                    type="email" 
                    value={userServicesSearch.email} 
                    onChange={e => setUserServicesSearch(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter customer email"
                    style={{ 
                      width: '100%', 
                      background: '#181818', 
                      color: '#eaeaea', 
                      border: '1.5px solid #444', 
                      borderRadius: '6px', 
                      padding: '10px 12px', 
                      fontSize: '1rem' 
                    }} 
                  />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', color: '#bdbdbd', marginBottom: '8px', fontSize: '0.9rem' }}>Search by Registration</label>
                  <input 
                    type="text" 
                    value={userServicesSearch.registration} 
                    onChange={e => setUserServicesSearch(prev => ({ ...prev, registration: e.target.value }))}
                    placeholder="Enter car registration"
                    style={{ 
                      width: '100%', 
                      background: '#181818', 
                      color: '#eaeaea', 
                      border: '1.5px solid #444', 
                      borderRadius: '6px', 
                      padding: '10px 12px', 
                      fontSize: '1rem' 
                    }} 
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={handleUserServicesSearch}
                    disabled={userServicesLoading}
                    style={{ 
                      background: '#ffd600', 
                      color: '#111', 
                      border: 'none', 
                      borderRadius: '6px', 
                      padding: '10px 20px', 
                      fontWeight: '600', 
                      cursor: 'pointer',
                      opacity: userServicesLoading ? 0.6 : 1
                    }}
                  >
                    {userServicesLoading ? 'Searching...' : 'Search'}
                  </button>
                  <button 
                    onClick={clearUserServicesSearch}
                    style={{ 
                      background: '#444', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '6px', 
                      padding: '10px 20px', 
                      fontWeight: '500', 
                      cursor: 'pointer' 
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              {/* Results Section */}
              <div style={{ overflowX: 'auto', width: '100%' }}>
                {userServicesLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#bdbdbd' }}>Loading...</div>
                ) : userServices.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#bdbdbd' }}>
                    {userServicesSearch.email || userServicesSearch.registration ? 'No services found for the specified criteria.' : 'No user services found. Use the search above to find services.'}
                  </div>
                ) : (
                  <div style={{ 
                    background: '#181818', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    border: '1px solid #232323'
                  }}>
                    {userServices.map((service, index) => (
                      <div key={service._id || index} style={{ 
                        borderBottom: index < userServices.length - 1 ? '1px solid #232323' : 'none',
                        padding: '20px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                          <div style={{ flex: 1, minWidth: '300px' }}>
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
                              <div>
                                <span style={{ color: '#bdbdbd', fontSize: '0.9rem' }}>Customer:</span>
                                <div style={{ color: '#fff', fontWeight: '600', fontSize: '1.1rem' }}>{service.userName}</div>
                                <div style={{ color: '#ffd600', fontSize: '0.9rem' }}>{service.userEmail}</div>
                              </div>
                              <div>
                                <span style={{ color: '#bdbdbd', fontSize: '0.9rem' }}>Vehicle:</span>
                                <div style={{ color: '#fff', fontWeight: '600', fontSize: '1.1rem' }}>{service.car?.registration || 'N/A'}</div>
                                <div style={{ color: '#bdbdbd', fontSize: '0.9rem' }}>
                                  {service.car?.make} {service.car?.model} {service.car?.year}
                                </div>
                              </div>
                            </div>
                            <div>
                              <span style={{ color: '#bdbdbd', fontSize: '0.9rem' }}>Service:</span>
                              <div style={{ color: '#fff', fontWeight: '600', fontSize: '1.1rem' }}>{service.service?.label}</div>
                              <div style={{ color: '#bdbdbd', fontSize: '0.9rem' }}>{service.service?.sub}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', minWidth: '150px' }}>
                            <div style={{ color: '#ffd600', fontWeight: '700', fontSize: '1.3rem', marginBottom: '4px' }}>
                              £{typeof service.total === 'number' ? service.total.toFixed(2) : (service.total ? Number(service.total).toFixed(2) : '0.00')}
                            </div>
                            <div style={{ color: '#bdbdbd', fontSize: '0.9rem' }}>
                              {service.date} at {service.time}
                            </div>
                            <div style={{ 
                              background: service.category === 'Maintenance' ? '#28a745' : 
                                         service.category === 'Repairs' ? '#dc3545' : 
                                         service.category === 'Diagnostics' ? '#17a2b8' : 
                                         service.category === 'Inspection' ? '#ffc107' : '#6c757d',
                              color: '#fff',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              display: 'inline-block',
                              marginTop: '8px'
                            }}>
                              {service.category || 'Other'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Parts Used */}
                        {service.parts && service.parts.length > 0 && (
                          <div style={{ marginTop: '16px' }}>
                            <div style={{ color: '#bdbdbd', fontSize: '0.9rem', marginBottom: '8px' }}>Parts Used:</div>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                              {service.parts.map((part: any, partIndex: number) => (
                                <div key={partIndex} style={{ 
                                  background: '#232323', 
                                  padding: '8px 12px', 
                                  borderRadius: '6px',
                                  fontSize: '0.9rem'
                                }}>
                                  <div style={{ color: '#fff', fontWeight: '500' }}>{part.name}</div>
                                  <div style={{ color: '#bdbdbd', fontSize: '0.8rem' }}>
                                    {part.partNumber} - Qty: {part.qty} - £{part.price}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Service Details */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                          gap: '16px', 
                          marginTop: '16px',
                          padding: '16px',
                          background: '#232323',
                          borderRadius: '6px'
                        }}>
                          <div>
                            <span style={{ color: '#bdbdbd', fontSize: '0.8rem' }}>Labour Hours:</span>
                            <div style={{ color: '#fff', fontWeight: '500' }}>{service.labourHours || 0}</div>
                          </div>
                          <div>
                            <span style={{ color: '#bdbdbd', fontSize: '0.8rem' }}>Labour Cost:</span>
                            <div style={{ color: '#fff', fontWeight: '500' }}>£{service.labourCost || 0}</div>
                          </div>
                          <div>
                            <span style={{ color: '#bdbdbd', fontSize: '0.8rem' }}>Parts Cost:</span>
                            <div style={{ color: '#fff', fontWeight: '500' }}>£{service.partsCost || 0}</div>
                          </div>
                          <div>
                            <span style={{ color: '#bdbdbd', fontSize: '0.8rem' }}>Subtotal:</span>
                            <div style={{ color: '#fff', fontWeight: '500' }}>£{service.subtotal || 0}</div>
                          </div>
                          <div>
                            <span style={{ color: '#bdbdbd', fontSize: '0.8rem' }}>VAT:</span>
                            <div style={{ color: '#fff', fontWeight: '500' }}>£{service.vat || 0}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Lookup Booking Modal */}
      {showLookupBookingModal && (
        <div className="dashboard-modal-bg">
          <div className="dashboard-modal dashboard-modal-wide">
            <button className="dashboard-modal-close" onClick={() => setShowLookupBookingModal(false)}>&times;</button>
            <h2>New Booking</h2>
            
            {/* Car Information (Pre-filled from lookup) */}
            <div className="modal-section-title">Vehicle Information</div>
            <div style={{ background: '#232323', borderRadius: 8, padding: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Make *</label>
                  <input 
                    type="text" 
                    required
                    value={lookupCar?.make || ''} 
                                         onChange={e => setLookupCar((c: any) => ({ ...c, make: e.target.value }))}  
                    style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Model *</label>
                  <input 
                    type="text" 
                    required
                    value={lookupCar?.model || ''} 
                                         onChange={e => setLookupCar((c: any) => ({ ...c, model: e.target.value }))}  
                    style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Year *</label>
                  <input 
                    type="text" 
                    required
                    value={lookupCar?.year || ''} 
                                         onChange={e => setLookupCar((c: any) => ({ ...c, year: e.target.value }))}  
                    style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Registration *</label>
                  <input 
                    type="text" 
                    required
                    value={lookupCar?.registration || ''} 
                                         onChange={e => setLookupCar((c: any) => ({ ...c, registration: e.target.value }))}  
                    style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} 
                  />
                </div>
              </div>
            </div>
            
            {/* Customer Information */}
            <div className="modal-section-title">Customer Information</div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={lookupCustomer.name} 
                  onChange={e => setLookupCustomer(c => ({ ...c, name: e.target.value }))} 
                  style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Email Address *</label>
                <input 
                  type="email" 
                  required
                  value={lookupCustomer.email} 
                  onChange={e => setLookupCustomer(c => ({ ...c, email: e.target.value }))} 
                  style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} 
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Phone Number *</label>
                <input 
                  type="text" 
                  required
                  value={lookupCustomer.phone} 
                  onChange={e => setLookupCustomer(c => ({ ...c, phone: e.target.value }))} 
                  style={{ width: '100%', background: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Postcode *</label>
                <input 
                  type="text" 
                  required
                  value={lookupCustomer.postcode} 
                  onChange={e => setLookupCustomer(c => ({ ...c, postcode: e.target.value }))} 
                  style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} 
                />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Address *</label>
              <input 
                type="text" 
                required
                value={lookupCustomer.address} 
                onChange={e => setLookupCustomer(c => ({ ...c, address: e.target.value }))} 
                style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} 
              />
            </div>
            
            {/* Booking Date & Time */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Booking Date *</label>
                <input
                  type="date"
                  required
                  value={lookupManualDate}
                  min={dayjs().format('YYYY-MM-DD')}
                  onChange={e => setLookupManualDate(e.target.value)}
                  style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Booking Time *</label>
                <input
                  type="time"
                  required
                  value={lookupManualTime}
                  onChange={e => setLookupManualTime(e.target.value)}
                  style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }}
                />
              </div>
            </div>
            
            {/* Services */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, marginTop: 24 }}>
              <div className="modal-section-title" style={{ margin: 0 }}>Services Required</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="modal-btn-outline" style={{ margin: 0, fontSize: '0.9rem', padding: '6px 12px' }} onClick={refreshServices}>🔄 Refresh</button>
                <button className="modal-btn-add" style={{ margin: 0 }} onClick={() => setShowLookupAddService(v => !v)}>+ Add Other Service</button>
              </div>
            </div>
            {showLookupAddService && (
              <div style={{
                background: '#181818',
                borderRadius: 12,
                padding: '24px 24px 18px 24px',
                marginBottom: 18,
                marginTop: 8,
                boxShadow: '0 2px 12px #0006',
                maxWidth: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 2, minWidth: 120 }}>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Service Name *</label>
                    <input
                      type="text"
                      placeholder="Service Name"
                      value={lookupNewService.label}
                      onChange={e => setLookupNewService((c: any) => ({ ...c, label: e.target.value }))}
                      style={{ width: '100%', background: '#111', color: '#eaeaea', border: '2px solid #ffd600', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 80 }}>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Duration *</label>
                    <input
                      type="text"
                      placeholder="Duration (e.g. 1h)"
                      value={lookupNewService.sub.split(' - ')[0] || ''}
                      onChange={e => setLookupNewService((c: any) => ({ ...c, sub: e.target.value + (c.sub.includes(' - ') ? c.sub.slice(c.sub.indexOf(' - ')) : '') }))}
                      style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 80 }}>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Category *</label>
                    <select
                      value={lookupNewService.sub.includes(' - ') ? lookupNewService.sub.split(' - ')[1] : ''}
                      onChange={e => setLookupNewService((c: any) => ({ ...c, sub: (c.sub.split(' - ')[0] || '') + ' - ' + e.target.value }))}
                      style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }}
                    >
                      <option value="">Select category</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Repairs">Repairs</option>
                      <option value="Diagnostics">Diagnostics</option>
                      <option value="Inspection">Inspection</option>
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Service Price (£)</label>
                    <input
                      type="number"
                      placeholder="Price (£)"
                      value={lookupNewService.price}
                      onChange={e => setLookupNewService((c: any) => ({ ...c, price: e.target.value }))}
                      style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }}
                    />
                  </div>
                  <div style={{ width: '100%' }}>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Description</label>
                    <textarea
                      placeholder="Description (optional)"
                      value={lookupNewService.description || ''}
                      onChange={e => setLookupNewService((c: any) => ({ ...c, description: e.target.value }))}
                      style={{ width: '100%', minHeight: 80, background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', width: '100%' }}>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Labour Hours</label>
                      <input
                        type="number"
                        placeholder="Labour Hours (e.g. 2.5)"
                        value={lookupNewService.labourHours || ''}
                        onChange={e => setLookupNewService((c: any) => ({ ...c, labourHours: e.target.value }))}
                        style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Labour Cost per Hour (£)</label>
                      <input
                        type="number"
                        placeholder="Labour Cost per Hour (£)"
                        value={lookupNewService.labourCost || ''}
                        onChange={e => setLookupNewService((c: any) => ({ ...c, labourCost: e.target.value }))}
                        style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                  <button className="modal-btn-outline" style={{ minWidth: 100 }} onClick={() => setShowLookupAddService(false)}>Cancel</button>
                  <button className="modal-btn-yellow" style={{ minWidth: 100 }} onClick={handleCreateLookupService}>Add Service</button>
                </div>
              </div>
            )}
            
            {/* Service Selection */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '18px',
              width: '100%',
            }}>
              {serviceOptions.map((s, i) => {
                const adminCategory = mapToAdminCategory(s);
                const categoryColor = adminCategory === 'tyres' ? '#ff6b6b' : adminCategory === 'mechanical' ? '#4ecdc4' : '#ffd600';
                return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setLookupSelectedService(i)}
                  style={{
                    background: lookupSelectedService === i ? '#ffd600' : '#181818',
                    color: lookupSelectedService === i ? '#111' : '#fff',
                    border: lookupSelectedService === i ? '2px solid #ffd600' : '2px solid #444',
                    borderRadius: 12,
                    padding: '32px 32px',
                    fontWeight: 600,
                    fontSize: '1.18rem',
                    cursor: 'pointer',
                    minWidth: 0,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 6,
                    boxSizing: 'border-box',
                    transition: 'background 0.2s, color 0.2s, border 0.2s',
                    position: 'relative'
                  }}
                >
                  <span>{s.label}</span>
                  <span style={{ fontWeight: 400, fontSize: '1.02rem', color: lookupSelectedService === i ? '#111' : '#bdbdbd' }}>{s.sub}</span>
                  {typeof s.price === 'number' && s.price > 0 && (
                    <span style={{ marginTop: 6, fontWeight: 700, color: lookupSelectedService === i ? '#111' : '#ffd600' }}>£{s.price.toFixed(2)}</span>
                  )}
                  {typeof s.labourHours === 'number' && s.labourHours > 0 && typeof s.labourCost === 'number' && s.labourCost > 0 && (
                    <span style={{ marginTop: 4, fontWeight: 500, fontSize: '0.9rem', color: lookupSelectedService === i ? '#111' : '#bdbdbd' }}>
                      Labour: {s.labourHours}h × £{s.labourCost}/h = £{(s.labourHours * s.labourCost).toFixed(2)}
                    </span>
                  )}
                    <span style={{ 
                      position: 'absolute', 
                      top: 8, 
                      left: 8, 
                      background: categoryColor, 
                      color: '#111', 
                      padding: '2px 8px', 
                      borderRadius: 12, 
                      fontSize: '0.8rem', 
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {adminCategory}
                    </span>
                  {isAdmin && (
                    <div style={{ position: 'absolute', right: 10, top: 10, display: 'flex', gap: 8 }}>
                      <button type="button" onClick={(e) => { e.stopPropagation(); openEditService(s, i); }} style={{ background: '#232323', color: '#fff', border: '1px solid #444', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>Edit</button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteService(s, i); }} style={{ background: '#a33', color: '#fff', border: '1px solid #733', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer' }}>×</button>
                    </div>
                  )}
                </button>
                );
              })}
              {lookupCustomServices.map((s, i) => {
                const adminCategory = mapToAdminCategory(s);
                const categoryColor = adminCategory === 'tyres' ? '#ff6b6b' : adminCategory === 'mechanical' ? '#4ecdc4' : '#ffd600';
                return (
                <button
                  key={s.label + s.sub + i}
                  type="button"
                  onClick={() => setLookupSelectedService(serviceOptions.length + i)}
                  style={{
                    background: lookupSelectedService === serviceOptions.length + i ? '#ffd600' : '#181818',
                    color: lookupSelectedService === serviceOptions.length + i ? '#111' : '#fff',
                    border: lookupSelectedService === serviceOptions.length + i ? '2px solid #ffd600' : '2px solid #444',
                    borderRadius: 12,
                    padding: '32px 32px',
                    fontWeight: 600,
                    fontSize: '1.18rem',
                    cursor: 'pointer',
                    minWidth: 0,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 6,
                    boxSizing: 'border-box',
                    transition: 'background 0.2s, color 0.2s, border 0.2s',
                      position: 'relative'
                  }}
                >
                  <span>{s.label}</span>
                  <span style={{ fontWeight: 400, fontSize: '1.02rem', color: lookupSelectedService === serviceOptions.length + i ? '#111' : '#bdbdbd' }}>{s.sub}</span>
                    <span style={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      background: categoryColor, 
                      color: '#111', 
                      padding: '2px 8px', 
                      borderRadius: 12, 
                      fontSize: '0.8rem', 
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {adminCategory}
                    </span>
                </button>
                );
              })}
            </div>
            
            {/* Service Edit Modal for Lookup */}
            {isAdmin && editServiceIdx !== null && (
              <div className="dashboard-modal-bg">
                <div className="dashboard-modal" style={{ maxWidth: 520 }}>
                  <button className="dashboard-modal-close" onClick={() => setEditServiceIdx(null)}>&times;</button>
                  <h2>Edit Service</h2>
                  <div className="modal-row">
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Service Name *</label>
                    <input type="text" placeholder="Service Name" value={editServiceDraft.label} onChange={e => setEditServiceDraft(s => ({ ...s, label: e.target.value }))} />
                  </div>
                  <div className="modal-row">
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Duration & Category *</label>
                    <input type="text" placeholder="Duration and category (e.g. 2h - services)" value={editServiceDraft.sub} onChange={e => setEditServiceDraft(s => ({ ...s, sub: e.target.value }))} />
                  </div>
                  <div className="modal-row">
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Service Price (£)</label>
                    <input type="number" placeholder="Price (optional)" value={editServiceDraft.price || 0} onChange={e => setEditServiceDraft(s => ({ ...s, price: Number(e.target.value) }))} />
                  </div>
                  <div className="modal-row">
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Labour Hours</label>
                    <input type="number" placeholder="Labour Hours (e.g. 2.5)" value={(editServiceDraft as any).labourHours || 0} onChange={e => setEditServiceDraft(s => ({ ...(s as any), labourHours: Number(e.target.value) }))} />
                  </div>
                  <div className="modal-row">
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Labour Cost per Hour (£)</label>
                    <input type="number" placeholder="Labour Cost per Hour (£)" value={(editServiceDraft as any).labourCost || 0} onChange={e => setEditServiceDraft(s => ({ ...(s as any), labourCost: Number(e.target.value) }))} />
                  </div>
                  <div className="modal-row">
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#fff' }}>Description</label>
                    <textarea placeholder="Description (optional)" value={(editServiceDraft as any).description || ''} onChange={e => setEditServiceDraft(s => ({ ...(s as any), description: e.target.value }))} />
                  </div>
                  <div className="modal-btn-row">
                    <button className="modal-btn-outline" onClick={() => setEditServiceIdx(null)}>Cancel</button>
                    <button className="modal-btn-yellow" onClick={saveEditService}>Save</button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Parts */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, marginTop: 24 }}>
              <div className="modal-section-title" style={{ margin: 0 }}>Parts Required</div>
              <button className="modal-btn-add" style={{ margin: 0 }} onClick={() => { setAddPartContext('lookup'); setShowAddPart(true); }}>+ Add New Part</button>
            </div>
            {showAddPart && addPartContext === 'lookup' && (
              <div style={{
                background: '#181818',
                borderRadius: 12,
                padding: '32px 24px 24px 24px',
                marginBottom: 18,
                marginTop: 8,
                boxShadow: '0 2px 12px #0006',
                maxWidth: '100%',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <div>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Part Number</label>
                    <input type="text" value={partForm.partNumber} onChange={e => handlePartFormChange('partNumber', e.target.value)} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '2px solid #ffd600', borderRadius: 8, padding: '12px 14px', fontSize: '1rem', outline: 'none', boxShadow: '0 0 0 2px #ffd60055' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Name</label>
                    <input type="text" value={partForm.name} onChange={e => handlePartFormChange('name', e.target.value)} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18 }}>
                  <button className="modal-btn-outline" style={{ minWidth: 120 }} onClick={() => setShowAddPart(false)}>Cancel</button>
                  <button className="modal-btn-yellow" style={{ minWidth: 120 }} onClick={handleLookupAddPart}>Add Part</button>
                </div>
              </div>
            )}
            {lookupParts.length > 0 && lookupParts.map((part, idx) => (
              <div key={idx} style={{
                background: '#181818',
                borderRadius: 12,
                padding: '18px 24px',
                marginTop: 8,
                marginBottom: 0,
                boxShadow: '0 2px 12px #0006',
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                maxWidth: '100%',
              }}>
                <div style={{ flex: 3 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.18rem', color: '#fff' }}>{part.name}</div>
                  <div style={{ color: '#bdbdbd', fontSize: '1.05rem', marginTop: 2 }}>{part.partNumber}</div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => handleLookupPartQty(idx, -1)} style={{ width: 38, height: 38, border: '1.5px solid #444', background: 'none', color: '#fff', borderRadius: 8, fontSize: '1.3rem', cursor: 'pointer' }}>-</button>
                  <span style={{ minWidth: 24, textAlign: 'center', color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>{part.qty}</span>
                  <button onClick={() => handleLookupPartQty(idx, 1)} style={{ width: 38, height: 38, border: '1.5px solid #444', background: 'none', color: '#fff', borderRadius: 8, fontSize: '1.3rem', cursor: 'pointer' }}>+</button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEditPart(part)} style={{ background: '#232323', color: '#fff', border: '1px solid #444', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: '0.9rem' }}>Edit</button>
                  <button onClick={() => handleLookupDeletePart(idx)} style={{ background: '#a33', color: '#fff', border: '1px solid #733', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: '0.9rem' }}>Remove</button>
                </div>
              </div>
            ))}
            
            {/* Parts Edit Modal for Lookup */}
            {editPartId && (
              <div className="dashboard-modal-bg">
                <div className="dashboard-modal" style={{ maxWidth: 520 }}>
                  <button className="dashboard-modal-close" onClick={cancelEditPart}>&times;</button>
                  <h2>Edit Part</h2>
                  <div className="modal-row">
                    <input type="text" placeholder="Part Number" value={editPartDraft.partNumber || ''} onChange={e => setEditPartDraft(p => ({ ...p, partNumber: e.target.value }))} />
                  </div>
                  <div className="modal-row">
                    <input type="text" placeholder="Name" value={editPartDraft.name || ''} onChange={e => setEditPartDraft(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="modal-row">
                    <input type="text" placeholder="Supplier" value={editPartDraft.supplier || ''} onChange={e => setEditPartDraft(p => ({ ...p, supplier: e.target.value }))} />
                  </div>
                  <div className="modal-row">
                    <input type="number" step="0.01" placeholder="Cost" value={editPartDraft.cost || ''} onChange={e => setEditPartDraft(p => ({ ...p, cost: e.target.value }))} />
                  </div>
                  <div className="modal-row">
                    <input type="number" step="0.1" placeholder="Profit %" value={editPartDraft.profit || ''} onChange={e => setEditPartDraft(p => ({ ...p, profit: e.target.value }))} />
                  </div>
                  <div className="modal-row">
                    <input type="number" step="0.01" placeholder="Price" value={editPartDraft.price || ''} onChange={e => setEditPartDraft(p => ({ ...p, price: e.target.value }))} />
                  </div>
                  <div className="modal-row">
                    <input type="number" placeholder="Quantity" value={editPartDraft.qty || ''} onChange={e => setEditPartDraft(p => ({ ...p, qty: e.target.value }))} />
                  </div>
                  <div className="modal-btn-row">
                    <button className="modal-btn-outline" onClick={cancelEditPart}>Cancel</button>
                    <button className="modal-btn-yellow" onClick={saveEditPart}>Save</button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Quote Summary */}
            <div className="modal-quote-summary">
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Quote Summary</div>
              <div className="modal-quote-row">
                <span>Labour ({lookupLabourHours}h @ £{lookupLabourCostPerHour}/h):</span>
                <span>£{lookupLabourCost}</span>
              </div>
              <div className="modal-quote-row">
                <span>Parts Cost:</span>
                <span>£{lookupPartsCost}</span>
              </div>
              <div className="modal-quote-row">
                <span>Service Price:</span>
                <span>£{lookupServicePrice}</span>
              </div>
              <div className="modal-quote-row">
                <span>Subtotal:</span>
                <span>£{lookupSubtotal}</span>
              </div>
              <div className="modal-quote-row">
                <span>VAT (20%):</span>
                <span>£{lookupVat}</span>
              </div>
              <div className="modal-quote-row modal-quote-total">
                <span>Total:</span>
                <span>£{lookupTotal}</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="modal-btn-row">
              <button className="modal-btn-outline modal-btn-block" onClick={() => { setShowLookupBookingModal(false); setShowModal(true); }}>Back</button>
              <button className="modal-btn-yellow modal-btn-block" onClick={handleLookupBooking} disabled={manualLoading}>
                {manualLoading ? 'Creating...' : 'Create Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parts Management Modal */}
      {showPartsModal && (
        <div className="dashboard-modal-bg">
          <div className="dashboard-modal" style={{ maxWidth: '1200px', width: '90vw' }}>
            <button className="dashboard-modal-close" onClick={() => setShowPartsModal(false)}>&times;</button>
            <h2>Parts Management</h2>
            <p style={{ color: '#bdbdbd', marginBottom: 24, fontSize: '0.95rem' }}>
              Manage your parts inventory, add new parts, and monitor stock levels.
            </p>
            
            {/* Add New Part Section */}
            <div style={{ background: '#232323', borderRadius: 12, padding: 20, marginBottom: 24, border: '1px solid #444' }}>
              <h3 style={{ color: '#ffd600', marginBottom: 16 }}>Add New Part</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block', color: '#eaeaea' }}>Part Number *</label>
                  <input
                    type="text"
                    value={partForm.partNumber}
                    onChange={e => handlePartFormChange('partNumber', e.target.value)}
                    placeholder="Enter part number"
                    style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #444', borderRadius: 8, padding: '10px 14px', fontSize: '1rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block', color: '#eaeaea' }}>Name *</label>
                  <input
                    type="text"
                    value={partForm.name}
                    onChange={e => handlePartFormChange('name', e.target.value)}
                    placeholder="Enter part name"
                    style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #444', borderRadius: 8, padding: '10px 14px', fontSize: '1rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block', color: '#eaeaea' }}>Supplier</label>
                  <input
                    type="text"
                    value={partForm.supplier}
                    onChange={e => handlePartFormChange('supplier', e.target.value)}
                    placeholder="Enter supplier name"
                    style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #444', borderRadius: 8, padding: '10px 14px', fontSize: '1rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block', color: '#eaeaea' }}>Cost (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={partForm.cost}
                    onChange={e => handlePartFormChange('cost', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #444', borderRadius: 8, padding: '10px 14px', fontSize: '1rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block', color: '#eaeaea' }}>Profit (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={partForm.profit}
                    onChange={e => handlePartFormChange('profit', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #444', borderRadius: 8, padding: '10px 14px', fontSize: '1rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block', color: '#eaeaea' }}>Price (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={partForm.price}
                    onChange={e => handlePartFormChange('price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #444', borderRadius: 8, padding: '10px 14px', fontSize: '1rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block', color: '#eaeaea' }}>Quantity</label>
                  <input
                    type="number"
                    value={partForm.qty}
                    onChange={e => handlePartFormChange('qty', e.target.value)}
                    placeholder="0"
                    min="0"
                    style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #444', borderRadius: 8, padding: '10px 14px', fontSize: '1rem' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button 
                  className="modal-btn-outline" 
                  onClick={() => {
                    setPartForm({ partNumber: '', name: '', supplier: '', cost: '', profit: '', price: '', qty: 1 });
                  }}
                >
                  Clear Form
                </button>
                <button 
                  className="modal-btn-yellow" 
                  onClick={handleLookupAddPart}
                  disabled={!partForm.partNumber || !partForm.name}
                >
                  Add Part
                </button>
              </div>
            </div>

            {/* Parts Inventory Table */}
            <div style={{ background: '#181818', borderRadius: 12, padding: 20, border: '1px solid #444' }}>
              <h3 style={{ color: '#ffd600', marginBottom: 16 }}>Parts Inventory</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eaeaea' }}>
                  <thead>
                    <tr style={{ background: '#232323', color: '#bdbdbd' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #444' }}>Part Number</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #444' }}>Name</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #444' }}>Supplier</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #444' }}>Cost</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #444' }}>Profit</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #444' }}>Price</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #444' }}>Quantity</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #444' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partsTable.map((part, index) => (
                      <tr key={part._id || index} style={{ borderBottom: '1px solid #333' }}>
                        <td style={{ padding: '12px' }}>{part.partNumber}</td>
                        <td style={{ padding: '12px' }}>{part.name}</td>
                        <td style={{ padding: '12px' }}>{part.supplier}</td>
                        <td style={{ padding: '12px' }}>£{part.cost}</td>
                        <td style={{ padding: '12px' }}>{part.profit}%</td>
                        <td style={{ padding: '12px' }}>£{part.price}</td>
                        <td style={{ 
                          padding: '12px', 
                          color: Number(part.qty) < 5 ? '#ff6b6b' : Number(part.qty) < 10 ? '#ffd93d' : '#00ff88',
                          fontWeight: Number(part.qty) < 5 ? '600' : 'normal'
                        }}>
                          {part.qty}
                          {Number(part.qty) < 5 && <span style={{ marginLeft: 8, fontSize: '0.8rem', color: '#ff6b6b' }}>⚠️ Low Stock</span>}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => openEditPart(part)}
                              style={{ background: '#444', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePartFromDB(part._id)}
                              style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit Part Modal */}
            {editPartId && (
              <div className="dashboard-modal-bg" style={{ zIndex: 1001 }}>
                <div className="dashboard-modal">
                  <button className="dashboard-modal-close" onClick={cancelEditPart}>&times;</button>
                  <h2>Edit Part</h2>
                  <div className="modal-row">
                    <label>Part Number</label>
                    <input
                      type="text"
                      value={editPartDraft.partNumber || ''}
                      onChange={e => setEditPartDraft({ ...editPartDraft, partNumber: e.target.value })}
                      style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem' }}
                    />
                  </div>
                  <div className="modal-row">
                    <label>Name</label>
                    <input
                      type="text"
                      value={editPartDraft.name || ''}
                      onChange={e => setEditPartDraft({ ...editPartDraft, name: e.target.value })}
                      style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem' }}
                    />
                  </div>
                  <div className="modal-row">
                    <label>Supplier</label>
                    <input
                      type="text"
                      value={editPartDraft.supplier || ''}
                      onChange={e => setEditPartDraft({ ...editPartDraft, supplier: e.target.value })}
                      style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem' }}
                    />
                  </div>
                  <div className="modal-row">
                    <label>Cost (£)</label>
                    <input
                      type="number"
                      value={editPartDraft.cost || ''}
                      onChange={e => setEditPartDraft({ ...editPartDraft, cost: e.target.value })}
                      step="0.01"
                      style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem' }}
                    />
                  </div>
                  <div className="modal-row">
                    <label>Profit (%)</label>
                    <input
                      type="number"
                      value={editPartDraft.profit || ''}
                      onChange={e => setEditPartDraft({ ...editPartDraft, profit: e.target.value })}
                      style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem' }}
                    />
                  </div>
                  <div className="modal-row">
                    <label>Quantity</label>
                    <input
                      type="number"
                      value={editPartDraft.qty || ''}
                      onChange={e => setEditPartDraft({ ...editPartDraft, qty: e.target.value })}
                      min="0"
                      style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem' }}
                    />
                  </div>
                  <div className="modal-btn-row">
                    <button className="modal-btn-outline modal-btn-block" onClick={cancelEditPart}>Cancel</button>
                    <button className="modal-btn-yellow modal-btn-block" onClick={saveEditPart}>Save Changes</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardPage;
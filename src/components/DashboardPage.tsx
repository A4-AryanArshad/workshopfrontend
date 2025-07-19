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

const serviceOptions = [
  { label: 'Full Service', sub: '2h - services' },
  { label: 'Interim Service', sub: '1.5h - services' },
  { label: 'Four Tyres', sub: '1h - tyres' },
  { label: 'Two Tyres', sub: '0.5h - tyres' },
  { label: 'Brake Replacement', sub: '2h - mechanical' },
  { label: 'Spark Plugs', sub: '1h - mechanical' },
  { label: 'Diagnostics', sub: '1h - services' },
  { label: 'Oil Change', sub: '1h - services' },
];

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
  const [showAddPart, setShowAddPart] = useState(false);
  const [parts, setParts] = useState<any[]>([]);
  const [partForm, setPartForm] = useState({ partNumber: '', name: '', supplier: '', cost: '', profit: '20', price: '', qty: 1 });
  const [bookings, setBookings] = useState<any[]>([]);
  const [dashboardDate, setDashboardDate] = useState(dayjs());
  const [scheduleDate, setScheduleDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customServices, setCustomServices] = useState<any[]>([]);
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({ label: '', sub: '' });
  const [showPartsModal, setShowPartsModal] = useState(false);
  const [partsTable, setPartsTable] = useState<any[]>([]);
  const [partRow, setPartRow] = useState({ partNumber: '', name: '', supplier: '', cost: '', profit: '20', price: '', qty: '', booked: '' });
  const [regInput, setRegInput] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'past' | 'upcoming' | 'messages'>(initialTab || 'past');

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
  const [lookupNewService, setLookupNewService] = useState({ label: '', sub: '' });

  const handlePartFormChange = (field: string, value: string) => {
    setPartForm(f => ({ ...f, [field]: value }));
  };

  const handleAddPart = () => {
    if (!partForm.name || !partForm.partNumber || !partForm.cost) return;
    // Calculate price if not set
    let price = partForm.price;
    if (!price && partForm.cost && partForm.profit) {
      const cost = parseFloat(partForm.cost);
      const profit = parseFloat(partForm.profit);
      if (!isNaN(cost) && !isNaN(profit)) {
        price = (cost * (1 + profit / 100)).toFixed(2);
      }
    }
    setParts(p => [...p, { ...partForm, price, cost: parseFloat(partForm.cost).toFixed(2), qty: 1 }]);
    setPartForm({ partNumber: '', name: '', supplier: '', cost: '', profit: '20', price: '', qty: 1 });
    setShowAddPart(false);
  };

  const handlePartQty = (idx: number, delta: number) => {
    setParts(parts => parts.map((p, i) => i === idx ? { ...p, qty: Math.max(1, (p.qty || 1) + delta) } : p));
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

  const handleCreateBooking = () => {
    if (!scheduleDate || !selectedTime) return;
    setBookings(b => [
      ...b,
      {
        date: dayjs(scheduleDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
        time: selectedTime,
        reg: 'KE14OYZ',
        price: 324,
        service: serviceOptions[selectedService].label,
        duration: serviceOptions[selectedService].sub,
      },
    ]);
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
    setPartForm({ partNumber: '', name: '', supplier: '', cost: '', profit: '20', price: '', qty: 1 });
    setCustomServices([]);
    setNewService({ label: '', sub: '' });
    setShowAddService(false);
    setShowAddPart(false);
    setPartsTable([]);
    setPartRow({ partNumber: '', name: '', supplier: '', cost: '', profit: '20', price: '', qty: '', booked: '' });
  };

  const bookingsForDate = bookings.filter(b => b.date === dashboardDate.format('YYYY-MM-DD'));

  const handleDVLAlookup = async () => {
    setLookupLoading(true);
    setLookupError('');
    setLookupResult(null);
    try {
      const response = await fetch('https://workshop-backend-ox7a.vercel.app/api/dvla-lookup', {
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
    fetch('https://workshop-backend-ox7a.vercel.app/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(data))
      .finally(() => setBookingsLoading(false));
  }, []);

  // Calculate dynamic quote summary
  const getLabourHours = () => {
    let sub = '';
    if (selectedService < serviceOptions.length) {
      sub = serviceOptions[selectedService].sub;
    } else if (customServices[selectedService - serviceOptions.length]) {
      sub = customServices[selectedService - serviceOptions.length].sub;
    }
    const match = sub.match(/([\d.]+)h/);
    return match ? parseFloat(match[1]) : 2; // default 2h
  };
  const labourRate = 105; // £105 per hour
  const labourHours = getLabourHours();
  const labourCost = labourHours * labourRate;
  const partsCost = parts.reduce((sum, p) => sum + (parseFloat(p.price || 0) * (p.qty || 1)), 0);
  const subtotal = labourCost + partsCost;
  const vat = subtotal * 0.2;
  const total = subtotal + vat;

  // Handle manual booking creation
  const extractCategory = (serviceObj: any) => {
    if (!serviceObj || !serviceObj.sub) return 'service';
    const parts = serviceObj.sub.split('-');
    if (parts.length > 1) {
      const cat = parts[1].trim().toLowerCase();
      return cat === 'services' ? 'service' : (cat || 'service');
    }
    return 'service';
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
      await fetch('https://workshop-backend-ox7a.vercel.app/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      // Refresh bookings
      const res = await fetch('https://workshop-backend-ox7a.vercel.app/api/bookings');
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
    let sub = '';
    if (lookupSelectedService < serviceOptions.length) {
      sub = serviceOptions[lookupSelectedService].sub;
    } else if (lookupCustomServices[lookupSelectedService - serviceOptions.length]) {
      sub = lookupCustomServices[lookupSelectedService - serviceOptions.length].sub;
    }
    const match = sub.match(/([\d.]+)h/);
    return match ? parseFloat(match[1]) : 2; // default 2h
  };
  const lookupLabourRate = 105;
  const lookupLabourHours = getLookupLabourHours();
  const lookupLabourCost = lookupLabourHours * lookupLabourRate;
  const lookupPartsCost = lookupParts.reduce((sum, p) => sum + (parseFloat(p.price || 0) * (p.qty || 1)), 0);
  const lookupSubtotal = lookupLabourCost + lookupPartsCost;
  const lookupVat = lookupSubtotal * 0.2;
  const lookupTotal = lookupSubtotal + lookupVat;
  // Calculate total parts cost (cost * qty) for lookup modal
  const lookupPartsCostRaw = lookupParts.reduce((sum, p) => sum + (parseFloat(p.cost || 0) * (p.qty || 1)), 0);

  // Lookup modal part handlers
  const handleLookupAddPart = () => {
    if (!partForm.name || !partForm.partNumber || !partForm.cost) return;
    let price = partForm.price;
    if (!price && partForm.cost && partForm.profit) {
      const cost = parseFloat(partForm.cost);
      const profit = parseFloat(partForm.profit);
      if (!isNaN(cost) && !isNaN(profit)) {
        price = (cost * (1 + profit / 100)).toFixed(2);
      }
    }
    setLookupParts(p => [...p, { ...partForm, price, cost: parseFloat(partForm.cost).toFixed(2), qty: 1 }]);
    setPartForm({ partNumber: '', name: '', supplier: '', cost: '', profit: '20', price: '', qty: 1 });
    setShowAddPart(false);
  };
  const handleLookupPartQty = (idx: number, delta: number) => {
    setLookupParts(parts => parts.map((p, i) => i === idx ? { ...p, qty: Math.max(1, (p.qty || 1) + delta) } : p));
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
      await fetch('https://workshop-backend-ox7a.vercel.app/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      // Refresh bookings
      const res = await fetch('https://workshop-backend-ox7a.vercel.app/api/bookings');
      setBookings(await res.json());
      setShowLookupBookingModal(false);
      // Reset lookup form
      setLookupCar(null);
      setLookupCustomer({ name: '', email: '', phone: '', postcode: '', address: '' });
      setLookupParts([]);
      setLookupCustomServices([]);
      setLookupManualTime('09:00');
      setLookupManualDate(dayjs().format('YYYY-MM-DD'));
    } catch (e) {
      alert('Failed to save booking');
    } finally {
      setManualLoading(false);
    }
  };

  // Fetch all parts when the Parts Management modal opens
  useEffect(() => {
    if (showPartsModal) {
      fetch('https://workshop-backend-ox7a.vercel.app/api/parts')
        .then(res => res.json())
        .then(setPartsTable);
    }
  }, [showPartsModal]);

  // Add part to database and refresh list
  const handleAddPartToDB = async () => {
    if (partRow.partNumber && partRow.name && partRow.supplier && partRow.cost) {
      let price = partRow.price;
      if (!price && partRow.cost && partRow.profit) {
        const cost = parseFloat(partRow.cost);
        const profit = parseFloat(partRow.profit);
        if (!isNaN(cost) && !isNaN(profit)) {
          price = (cost * (1 + profit / 100)).toFixed(2);
        }
      }
      const newPart = {
        ...partRow,
        price: price,
        cost: parseFloat(partRow.cost).toFixed(2),
        profit: partRow.profit,
        qty: partRow.qty || '1',
        booked: partRow.booked || new Date().toISOString().slice(0, 10).split('-').reverse().join('/'),
      };
      await fetch('https://workshop-backend-ox7a.vercel.app/api/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPart),
      });
      // Refresh parts list
      fetch('https://workshop-backend-ox7a.vercel.app/api/parts')
        .then(res => res.json())
        .then(setPartsTable);
      setPartRow({ partNumber: '', name: '', supplier: '', cost: '', profit: '20', price: '', qty: '', booked: '' });
    }
  };

  // Delete part from database and refresh list
  const handleDeletePartFromDB = async (id: string) => {
    await fetch(`https://workshop-backend-ox7a.vercel.app/api/parts/${id}`, { method: 'DELETE' });
    fetch('https://workshop-backend-ox7a.vercel.app/api/parts')
      .then(res => res.json())
      .then(setPartsTable);
  };

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
              <div style={{ fontWeight: 700, fontSize: '2.5rem', color: '#fff', marginBottom: 8 }}>User Dashboard</div>
              <div style={{ color: '#bdbdbd', fontSize: '1.15rem', marginBottom: 8 }}>View your past services, upcoming appointments, and messages.</div>
              <div style={{ width: 64, height: 4, background: '#ffd600', borderRadius: 2, marginBottom: 32 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }} className="dashboard-controls">
              <button onClick={handlePrevDay} style={{ background: 'none', color: '#fff', border: '2px solid #444', borderRadius: 8, padding: '10px 22px', fontWeight: 500, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>&lt; Previous Day</button>
              <div style={{ fontWeight: 600, fontSize: '1.15rem', color: '#fff', margin: '0 12px' }}>{dashboardDate.format('dddd, MMMM D, YYYY')}</div>
              <button onClick={handleNextDay} style={{ background: 'none', color: '#fff', border: '2px solid #444', borderRadius: 8, padding: '10px 22px', fontWeight: 500, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>Next Day &gt;</button>
              <div style={{ flex: 1 }} />
              <button onClick={() => setShowModal(true)} style={{ background: '#ffd600', color: '#111', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><PlusIcon />New Booking</button>
              <button onClick={() => setShowPartsModal(true)} style={{ background: '#232323', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 500, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><BoxIcon />Parts Management</button>
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
              <button className="modal-btn-yellow modal-btn-block" onClick={() => { setShowModal(false); setShowManual(true); }}>Enter Manually</button>
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
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Make</label>
                <input type="text" value={manualCar.make} onChange={e => setManualCar(c => ({ ...c, make: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Model</label>
                <input type="text" value={manualCar.model} onChange={e => setManualCar(c => ({ ...c, model: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Year</label>
                <input type="text" value={manualCar.year} onChange={e => setManualCar(c => ({ ...c, year: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Registration</label>
                <input type="text" value={manualCar.registration} onChange={e => setManualCar(c => ({ ...c, registration: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
            </div>
            <div className="modal-section-title">Customer Information</div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Full Name</label>
                <input type="text" value={manualCustomer.name} onChange={e => setManualCustomer(c => ({ ...c, name: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Email Address</label>
                <input type="email" value={manualCustomer.email} onChange={e => setManualCustomer(c => ({ ...c, email: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Phone Number</label>
                <input type="text" value={manualCustomer.phone} onChange={e => setManualCustomer(c => ({ ...c, phone: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Postcode</label>
                <input type="text" value={manualCustomer.postcode} onChange={e => setManualCustomer(c => ({ ...c, postcode: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Address</label>
              <input type="text" value={manualCustomer.address} onChange={e => setManualCustomer(c => ({ ...c, address: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Booking Date</label>
              <input
                type="date"
                value={manualDate}
                min={dayjs().format('YYYY-MM-DD')}
                onChange={e => setManualDate(e.target.value)}
                style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Booking Time</label>
              <input
                type="time"
                value={manualTime}
                onChange={e => setManualTime(e.target.value)}
                style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, marginTop: 24 }}>
              <div className="modal-section-title" style={{ margin: 0 }}>Services Required</div>
              <button className="modal-btn-add" style={{ margin: 0 }} onClick={() => setShowAddService(v => !v)}>+ Add Other Service</button>
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
                  <input
                    type="text"
                    placeholder="Service Name"
                    value={newService.label}
                    onChange={e => setNewService(s => ({ ...s, label: e.target.value }))}
                    style={{ flex: 2, minWidth: 120, background: '#111', color: '#eaeaea', border: '2px solid #ffd600', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g. 1h)"
                    value={newService.sub.split(' - ')[0] || ''}
                    onChange={e => setNewService(s => ({ ...s, sub: e.target.value + (s.sub.includes(' - ') ? s.sub.slice(s.sub.indexOf(' - ')) : '') }))}
                    style={{ flex: 1, minWidth: 80, background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Category (e.g. services)"
                    value={newService.sub.includes(' - ') ? newService.sub.split(' - ')[1] : ''}
                    onChange={e => setNewService(s => ({ ...s, sub: (s.sub.split(' - ')[0] || '') + ' - ' + e.target.value }))}
                    style={{ flex: 1, minWidth: 80, background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                  <button className="modal-btn-outline" style={{ minWidth: 100 }} onClick={() => setShowAddService(false)}>Cancel</button>
                  <button className="modal-btn-yellow" style={{ minWidth: 100 }} onClick={() => {
                    if (newService.label && newService.sub) {
                      setCustomServices(cs => [...cs, newService]);
                      setNewService({ label: '', sub: '' });
                      setShowAddService(false);
                    }
                  }}>Add Service</button>
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
              {serviceOptions.map((s, i) => (
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
                  }}
                >
                  <span>{s.label}</span>
                  <span style={{ fontWeight: 400, fontSize: '1.02rem', color: selectedService === i ? '#111' : '#bdbdbd' }}>{s.sub}</span>
                </button>
              ))}
              {customServices.map((s, i) => (
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
                  }}
                >
                  <span>{s.label}</span>
                  <span style={{ fontWeight: 400, fontSize: '1.02rem', color: selectedService === serviceOptions.length + i ? '#111' : '#bdbdbd' }}>{s.sub}</span>
                </button>
              ))}
            </div>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 18 }}>
                  <div>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Part Number</label>
                    <input type="text" value={partForm.partNumber} onChange={e => handlePartFormChange('partNumber', e.target.value)} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '2px solid #ffd600', borderRadius: 8, padding: '12px 14px', fontSize: '1rem', outline: 'none', boxShadow: '0 0 0 2px #ffd60055' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Name</label>
                    <input type="text" value={partForm.name} onChange={e => handlePartFormChange('name', e.target.value)} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Supplier</label>
                    <input type="text" value={partForm.supplier} onChange={e => handlePartFormChange('supplier', e.target.value)} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Cost Price</label>
                    <input type="text" value={partForm.cost} onChange={e => handlePartFormChange('cost', e.target.value)} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <div>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Profit %</label>
                    <input type="text" value={partForm.profit} onChange={e => handlePartFormChange('profit', e.target.value)} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Selling Price</label>
                    <input type="text" value={partForm.price} onChange={e => handlePartFormChange('price', e.target.value)} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18 }}>
                  <button className="modal-btn-outline" style={{ minWidth: 120 }} onClick={() => setShowAddPart(false)}>Cancel</button>
                  <button className="modal-btn-yellow" style={{ minWidth: 120 }} onClick={handleAddPart}>Add Part</button>
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
                <div style={{ flex: 2 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.18rem', color: '#fff' }}>{part.name}</div>
                  <div style={{ color: '#bdbdbd', fontSize: '1.05rem', marginTop: 2 }}>{part.partNumber}</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 500, color: '#bdbdbd', marginBottom: 2 }}>Profit %</div>
                  <input type="text" value={part.profit} onChange={e => handlePartProfit(idx, e.target.value)} style={{ width: 60, background: '#111', color: '#eaeaea', border: '1.5px solid #444', borderRadius: 8, padding: '8px 10px', fontSize: '1rem', textAlign: 'center' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div style={{ fontWeight: 700, color: '#ffd600', fontSize: '1.18rem' }}>£{part.price}</div>
                  <div style={{ color: '#bdbdbd', fontSize: '1.02rem', marginTop: 2 }}>Cost: £{part.cost}</div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => handlePartQty(idx, -1)} style={{ width: 38, height: 38, border: '1.5px solid #444', background: 'none', color: '#fff', borderRadius: 8, fontSize: '1.3rem', cursor: 'pointer' }}>-</button>
                  <span style={{ minWidth: 24, textAlign: 'center', color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>{part.qty}</span>
                  <button onClick={() => handlePartQty(idx, 1)} style={{ width: 38, height: 38, border: '1.5px solid #444', background: 'none', color: '#fff', borderRadius: 8, fontSize: '1.3rem', cursor: 'pointer' }}>+</button>
                </div>
              </div>
            ))}
            <div className="modal-quote-summary">
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Quote Summary</div>
              <div className="modal-quote-row"><span>Labour ({labourHours} hours)</span><span>£{typeof labourCost === 'number' ? labourCost.toFixed(2) : (labourCost ? Number(labourCost).toFixed(2) : '0.00')}</span></div>
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
              <div className="schedule-modal-summary-total" style={{ color: '#ffd600', fontWeight: 700 }}>Total Cost: £324.00</div>
            </div>
            <div className="schedule-modal-btn-row">
              <button className="schedule-modal-btn-back" onClick={() => { setShowScheduleModal(false); setShowManual(true); }}>Back</button>
              <button className="schedule-modal-btn-create" onClick={handleCreateBooking}>Create Booking</button>
            </div>
          </div>
        </div>
      )}
      {showPartsModal && (
        <div className="dashboard-modal-bg">
          <div className="dashboard-modal dashboard-modal-wide" style={{ maxWidth: 1200, width: '98vw', minWidth: 320, padding: 0, position: 'relative' }}>
            <button className="dashboard-modal-close" onClick={() => setShowPartsModal(false)}>&times;</button>
            <div style={{ padding: '36px 36px 0 36px' }}>
              <div style={{ fontWeight: 700, fontSize: '2rem', color: '#fff', marginBottom: 24 }}>Parts Management</div>
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, color: '#eaeaea', fontSize: '1.08rem', minWidth: 900 }}>
                  <thead>
                    <tr style={{ background: 'none', color: '#bdbdbd', fontWeight: 600, fontSize: '1.08rem' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Part Number</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Supplier</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Cost Price</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Profit %</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Selling Price</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Quantity</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}></th>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 16px' }}><input type="text" value={partRow.partNumber} onChange={e => setPartRow(r => ({ ...r, partNumber: e.target.value }))} style={{ width: '100%', background: '#181818', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 12px', fontSize: '1rem' }} /></td>
                      <td style={{ padding: '8px 16px' }}><input type="text" value={partRow.name} onChange={e => setPartRow(r => ({ ...r, name: e.target.value }))} style={{ width: '100%', background: '#181818', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 12px', fontSize: '1rem' }} /></td>
                      <td style={{ padding: '8px 16px' }}><input type="text" value={partRow.supplier} onChange={e => setPartRow(r => ({ ...r, supplier: e.target.value }))} style={{ width: '100%', background: '#181818', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 12px', fontSize: '1rem' }} /></td>
                      <td style={{ padding: '8px 16px' }}><input type="text" value={partRow.cost} onChange={e => setPartRow(r => ({ ...r, cost: e.target.value }))} style={{ width: '100%', background: '#181818', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 12px', fontSize: '1rem' }} /></td>
                      <td style={{ padding: '8px 16px' }}><input type="text" value={partRow.profit} onChange={e => setPartRow(r => ({ ...r, profit: e.target.value }))} style={{ width: '100%', background: '#181818', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 12px', fontSize: '1rem' }} /></td>
                      <td style={{ padding: '8px 16px' }}><input type="text" value={partRow.price} onChange={e => setPartRow(r => ({ ...r, price: e.target.value }))} style={{ width: '100%', background: '#181818', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 12px', fontSize: '1rem' }} /></td>
                      <td style={{ padding: '8px 16px' }}><input type="text" value={partRow.qty} onChange={e => setPartRow(r => ({ ...r, qty: e.target.value }))} style={{ width: '100%', background: '#181818', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 12px', fontSize: '1rem' }} /></td>
                      <td style={{ padding: '8px 0', textAlign: 'center' }}>
                        <button onClick={handleAddPartToDB} style={{ background: '#ffd600', color: '#111', border: 'none', borderRadius: '0 8px 8px 0', padding: '0 18px', height: 44, fontWeight: 700, fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ height: 12 }}></tr>
                    <tr style={{ background: 'none', color: '#bdbdbd', fontWeight: 600, fontSize: '1.08rem' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Part Number</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Supplier</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Cost Price</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Selling Price</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Profit</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Quantity</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Booked In</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Actions</th>
                    </tr>
                    {partsTable.map((part, idx) => (
                      <tr key={part._id || idx} style={{ borderTop: '1px solid #232323', background: 'none' }}>
                        <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 500 }}>{part.partNumber}</td>
                        <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 500 }}>{part.name}</td>
                        <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 500 }}>{part.supplier}</td>
                        <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 500 }}>£{part.cost}</td>
                        <td style={{ padding: '12px 16px', color: '#ffd600', fontWeight: 700 }}>£{part.price}</td>
                        <td style={{ padding: '12px 16px', color: '#ffd600', fontWeight: 700 }}>{parseFloat(part.profit).toFixed(1)}%</td>
                        <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 500 }}>{part.qty}</td>
                        <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 500 }}>{part.booked}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button onClick={() => handleDeletePartFromDB(part._id)} style={{ background: idx % 2 === 0 ? '#232323' : '#a33', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      {showLookupBookingModal && (
        <div className="dashboard-modal-bg">
          <div className="dashboard-modal dashboard-modal-wide">
            <button className="dashboard-modal-close" onClick={() => setShowLookupBookingModal(false)}>&times;</button>
            <h2>New Booking</h2>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Make</label>
                <input type="text" value={lookupCar?.make || ''} readOnly style={{ width: '100%', background: '#222', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Model</label>
                <input type="text" value={lookupCar?.model || ''} readOnly style={{ width: '100%', background: '#222', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Year</label>
                <input type="text" value={lookupCar?.year || ''} readOnly style={{ width: '100%', background: '#222', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Registration</label>
                <input type="text" value={lookupCar?.registration || ''} readOnly style={{ width: '100%', background: '#222', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
            </div>
            <div className="modal-section-title">Customer Information</div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Full Name</label>
                <input type="text" value={lookupCustomer.name} onChange={e => setLookupCustomer(c => ({ ...c, name: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Email Address</label>
                <input type="email" value={lookupCustomer.email} onChange={e => setLookupCustomer(c => ({ ...c, email: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Phone Number</label>
                <input type="text" value={lookupCustomer.phone} onChange={e => setLookupCustomer(c => ({ ...c, phone: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Postcode</label>
                <input type="text" value={lookupCustomer.postcode} onChange={e => setLookupCustomer(c => ({ ...c, postcode: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Address</label>
              <input type="text" value={lookupCustomer.address} onChange={e => setLookupCustomer(c => ({ ...c, address: e.target.value }))} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Booking Date</label>
              <input
                type="date"
                value={lookupManualDate}
                min={dayjs().format('YYYY-MM-DD')}
                onChange={e => setLookupManualDate(e.target.value)}
                style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Booking Time</label>
              <input
                type="time"
                value={lookupManualTime}
                onChange={e => setLookupManualTime(e.target.value)}
                style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, marginTop: 24 }}>
              <div className="modal-section-title" style={{ margin: 0 }}>Services Required</div>
              <button className="modal-btn-add" style={{ margin: 0 }} onClick={() => setShowLookupAddService(v => !v)}>+ Add Other Service</button>
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
                  <input
                    type="text"
                    placeholder="Service Name"
                    value={lookupNewService.label}
                    onChange={e => setLookupNewService(s => ({ ...s, label: e.target.value }))}
                    style={{ flex: 2, minWidth: 120, background: '#111', color: '#eaeaea', border: '2px solid #ffd600', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g. 1h)"
                    value={lookupNewService.sub.split(' - ')[0] || ''}
                    onChange={e => setLookupNewService(s => ({ ...s, sub: e.target.value + (s.sub.includes(' - ') ? s.sub.slice(s.sub.indexOf(' - ')) : '') }))}
                    style={{ flex: 1, minWidth: 80, background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Category (e.g. service)"
                    value={lookupNewService.sub.includes(' - ') ? lookupNewService.sub.split(' - ')[1] : ''}
                    onChange={e => setLookupNewService(s => ({ ...s, sub: (s.sub.split(' - ')[0] || '') + ' - ' + e.target.value }))}
                    style={{ flex: 1, minWidth: 80, background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                  <button className="modal-btn-outline" style={{ minWidth: 100 }} onClick={() => setShowLookupAddService(false)}>Cancel</button>
                  <button className="modal-btn-yellow" style={{ minWidth: 100 }} onClick={() => {
                    if (lookupNewService.label && lookupNewService.sub) {
                      setLookupCustomServices(cs => [...cs, lookupNewService]);
                      setLookupNewService({ label: '', sub: '' });
                      setShowLookupAddService(false);
                    }
                  }}>Add Service</button>
                </div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px', width: '100%' }}>
              {serviceOptions.map((s, i) => (
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
                  }}
                >
                  <span>{s.label}</span>
                  <span style={{ fontWeight: 400, fontSize: '1.02rem', color: lookupSelectedService === i ? '#111' : '#bdbdbd' }}>{s.sub}</span>
                </button>
              ))}
              {lookupCustomServices.map((s, i) => (
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
                  }}
                >
                  <span>{s.label}</span>
                  <span style={{ fontWeight: 400, fontSize: '1.02rem', color: lookupSelectedService === serviceOptions.length + i ? '#111' : '#bdbdbd' }}>{s.sub}</span>
                </button>
              ))}
            </div>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 18 }}>
                  <div>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Part Number</label>
                    <input type="text" value={partForm.partNumber} onChange={e => handlePartFormChange('partNumber', e.target.value)} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '2px solid #ffd600', borderRadius: 8, padding: '12px 14px', fontSize: '1rem', outline: 'none', boxShadow: '0 0 0 2px #ffd60055' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Name</label>
                    <input type="text" value={partForm.name} onChange={e => handlePartFormChange('name', e.target.value)} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Supplier</label>
                    <input type="text" value={partForm.supplier} onChange={e => handlePartFormChange('supplier', e.target.value)} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Cost Price</label>
                    <input type="text" value={partForm.cost} onChange={e => handlePartFormChange('cost', e.target.value)} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <div>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Profit %</label>
                    <input type="text" value={partForm.profit} onChange={e => handlePartFormChange('profit', e.target.value)} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Selling Price</label>
                    <input type="text" value={partForm.price} onChange={e => handlePartFormChange('price', e.target.value)} style={{ width: '100%', background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '12px 14px', fontSize: '1rem' }} />
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
                <div style={{ flex: 2 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.18rem', color: '#fff' }}>{part.name}</div>
                  <div style={{ color: '#bdbdbd', fontSize: '1.05rem', marginTop: 2 }}>{part.partNumber}</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 500, color: '#bdbdbd', marginBottom: 2 }}>Profit %</div>
                  <input type="text" value={part.profit} onChange={e => handleLookupPartProfit(idx, e.target.value)} style={{ width: 60, background: '#111', color: '#eaeaea', border: '1.5px solid #444', borderRadius: 8, padding: '8px 10px', fontSize: '1rem', textAlign: 'center' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div style={{ fontWeight: 700, color: '#ffd600', fontSize: '1.18rem' }}>£{part.price}</div>
                  <div style={{ color: '#bdbdbd', fontSize: '1.02rem', marginTop: 2 }}>Cost: £{part.cost}</div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => handleLookupPartQty(idx, -1)} style={{ width: 38, height: 38, border: '1.5px solid #444', background: 'none', color: '#fff', borderRadius: 8, fontSize: '1.3rem', cursor: 'pointer' }}>-</button>
                  <span style={{ minWidth: 24, textAlign: 'center', color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>{part.qty}</span>
                  <button onClick={() => handleLookupPartQty(idx, 1)} style={{ width: 38, height: 38, border: '1.5px solid #444', background: 'none', color: '#fff', borderRadius: 8, fontSize: '1.3rem', cursor: 'pointer' }}>+</button>
                </div>
              </div>
            ))}
            <div className="modal-quote-summary">
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Quote Summary</div>
              <div className="modal-quote-row"><span>Labour ({lookupLabourHours} hours)</span><span>£{typeof lookupLabourCost === 'number' ? lookupLabourCost.toFixed(2) : (lookupLabourCost ? Number(lookupLabourCost).toFixed(2) : '0.00')}</span></div>
              <div className="modal-quote-row"><span>Parts Cost</span><span>£{typeof lookupPartsCostRaw === 'number' ? lookupPartsCostRaw.toFixed(2) : (lookupPartsCostRaw ? Number(lookupPartsCostRaw).toFixed(2) : '0.00')}</span></div>
              <div className="modal-quote-row"><span>Parts</span><span>£{typeof lookupPartsCost === 'number' ? lookupPartsCost.toFixed(2) : (lookupPartsCost ? Number(lookupPartsCost).toFixed(2) : '0.00')}</span></div>
              <div className="modal-quote-row"><span>Subtotal</span><span>£{typeof lookupSubtotal === 'number' ? lookupSubtotal.toFixed(2) : (lookupSubtotal ? Number(lookupSubtotal).toFixed(2) : '0.00')}</span></div>
              <div className="modal-quote-row"><span>VAT (20%)</span><span>£{typeof lookupVat === 'number' ? lookupVat.toFixed(2) : (lookupVat ? Number(lookupVat).toFixed(2) : '0.00')}</span></div>
              <div className="modal-quote-row modal-quote-total"><span>Total</span><span>£{typeof lookupTotal === 'number' ? lookupTotal.toFixed(2) : (lookupTotal ? Number(lookupTotal).toFixed(2) : '0.00')}</span></div>
            </div>
            <div className="modal-btn-row">
              <button className="modal-btn-outline modal-btn-block" onClick={() => { setShowLookupBookingModal(false); setShowModal(true); }}>Back</button>
              <button className="modal-btn-yellow modal-btn-block" onClick={handleLookupBooking} disabled={manualLoading}>{manualLoading ? 'Saving...' : 'Create Booking'}</button>
            </div>
          </div>
        </div>
      )}
   
   
    </>
  );
};

export default DashboardPage; 
import React, { useRef } from 'react';
import { Navigate } from 'react-router-dom';

import Home from './components/Home';
import OurServicesPage from './components/OurServicesPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import DashboardPage from './components/DashboardPage';
import PastServicesPage from './components/PastServicesPage';
import UpcomingAppointmentsPage from './components/UpcomingAppointmentsPage';
import MessagesPage from './components/MessagesPage';
import AdminRoute from './components/AdminRoute';
import AddImagesPage from './components/AddImagesPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/our-services" element={<OurServicesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<AdminRoute><DashboardPage /></AdminRoute>} />
        <Route path="/dashboard/add-images" element={<AdminRoute><AddImagesPage /></AdminRoute>} />
        <Route path="/dashboard/past-services" element={<PastServicesPage />} />
        <Route path="/dashboard/upcoming" element={<UpcomingAppointmentsPage />} />
        <Route path="/dashboard/messages" element={<MessagesPage />} />
      </Routes>
    </Router>
  );
};

export default App;

// API Configuration
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://workshop-backend-six.vercel.app'
  : 'https://workshop-backend-six.vercel.app'; // Use deployed backend for both production and development

// Environment Configuration
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Admin Configuration
export const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'aryanarshad5413@gmail.com'; 
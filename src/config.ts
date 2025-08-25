// Configuration file for API endpoints
export const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'https://workshop-backend-six.vercel.app'  // Temporarily use production backend for testing
  : 'https://workshop-backend-six.vercel.app';

// Alternative: Force local development for testing
// export const API_BASE_URL = 'http://localhost:5001';

export const config = {
  apiBaseUrl: API_BASE_URL,
  environment: process.env.NODE_ENV || 'development'
}; 
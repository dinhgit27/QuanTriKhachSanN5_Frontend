// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
};

// Environment variables can be set in .env file:
// REACT_APP_API_URL=http://your-backend-url:port/api
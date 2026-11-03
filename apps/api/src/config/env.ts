import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'pragyam-brokerage-super-secure-jwt-key-2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'pragyam-brokerage-super-refresh-key-2026',
  JWT_EXPIRATION: '24h',
  JWT_REFRESH_EXPIRATION: '7d',
  ADMIN_BOOTSTRAP_EMAIL: process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@pragyam.com',
  ADMIN_BOOTSTRAP_PASSWORD: process.env.ADMIN_BOOTSTRAP_PASSWORD || 'Pragyam@Admin2026!',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret',
  COMPANY_NAME: 'Pragyam Enterprises',
  COMPANY_GSTIN: '06AAACP1234F1Z8',
  COMPANY_ADDRESS: 'G.T. Road, Near Grain Market, Karnal, Haryana - 132001',
  COMPANY_PHONE: '+91 98120 00000',
  COMPANY_EMAIL: 'contact@pragyam.com'
};

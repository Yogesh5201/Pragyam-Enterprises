import { app } from './app';
import { ENV } from './config/env';

const server = app.listen(ENV.PORT, () => {
  console.log(`=======================================================`);
  console.log(`  🌾 PRAGYAM ENTERPRISES - RICE BROKERAGE BACKEND API  `);
  console.log(`  Running on: http://localhost:${ENV.PORT}             `);
  console.log(`  Environment: ${ENV.NODE_ENV}                         `);
  console.log(`  Confidentiality Engine: ACTIVE & ENFORCED            `);
  console.log(`=======================================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

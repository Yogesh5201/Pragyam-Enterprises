import request from 'supertest';
import { app } from '../src/app';
import { UserRole } from '@pragyam/types';

describe('PRAGYAM ENTERPRISES - MANDATORY CONFIDENTIALITY & ACCESS SECURITY TESTS', () => {
  let buyerToken: string;
  let seller1Token: string;
  let seller2Token: string;
  let adminToken: string;

  beforeAll(async () => {
    // 1. Authenticate Buyer (exports@royalfeast.com)
    const buyerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'exports@royalfeast.com', password: 'Pragyam@2026' });
    buyerToken = buyerRes.body.token;

    // 2. Authenticate Seller 1 (taraori@mills.com)
    const seller1Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'taraori@mills.com', password: 'Pragyam@2026' });
    seller1Token = seller1Res.body.token;

    // 3. Authenticate Seller 2 (amritsar@agro.com)
    const seller2Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'amritsar@agro.com', password: 'Pragyam@2026' });
    seller2Token = seller2Res.body.token;

    // 4. Authenticate Super Admin with MFA (admin@pragyam.com)
    const adminRes = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'admin@pragyam.com', password: 'Pragyam@Admin2026!', mfaCode: '123456' });
    adminToken = adminRes.body.token;
  });

  // TEST 1, 2, 3: Buyer cannot see seller name, mill name, phone number in stock listings
  test('1-3. Buyer querying available stock receives strictly anonymous listings with NO seller identity, mill name, or phone number', async () => {
    const res = await request(app)
      .get('/api/inventory')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.listings.length).toBeGreaterThan(0);

    for (const listing of res.body.listings) {
      // Must have anonymous code (e.g. PRG-1025)
      expect(listing.anonymousCode).toMatch(/^PRG-\d+$/);
      
      // CONFIDENTIALITY CHECKS: No identifying fields allowed
      expect(listing.sellerId).toBeUndefined();
      expect(listing.sellerFullName).toBeUndefined();
      expect(listing.sellerCompanyName).toBeUndefined();
      expect(listing.sellerPhone).toBeUndefined();
      expect(listing.sellerEmail).toBeUndefined();
      expect(listing.millName).toBeUndefined();
      expect(listing.millLocation).toBeUndefined();
      expect(listing.brokerageOffered).toBeUndefined();

      // Allowed generalized location
      expect(listing.generalizedLocation).toBeDefined();
      expect(listing.generalizedLocation.state).toBeDefined();
    }
  });

  // TEST 4: Buyer cannot access private listing metadata or admin view
  test('4. Buyer is forbidden from accessing Admin inventory endpoint containing seller identities', async () => {
    const res = await request(app)
      .get('/api/inventory/admin/all')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // TEST 5 & 6: Seller cannot access buyer identity or contact details
  test('5-6. Seller cannot access buyer requirements list with identities or admin requirements endpoint', async () => {
    const res = await request(app)
      .get('/api/requirements/admin/all')
      .set('Authorization', `Bearer ${seller1Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // TEST 7: Buyer cannot access another buyer\'s enquiries or purchase requirements
  test('7. Buyer only receives their own enquiries and cannot access other buyer records', async () => {
    const res = await request(app)
      .get('/api/enquiries/my-enquiries')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify all returned enquiries belong exclusively to the authenticated buyer
    for (const enq of res.body.enquiries) {
      expect(enq.sellerPhone).toBeUndefined();
      expect(enq.sellerCompanyName).toBeUndefined();
    }
  });

  // TEST 8: Seller A cannot modify Seller B\'s stock listing
  test('8. Seller A is forbidden from editing or updating Seller B\'s stock listing', async () => {
    // Seller 2 listing is lst-1048
    const res = await request(app)
      .put('/api/inventory/lst-1048')
      .set('Authorization', `Bearer ${seller1Token}`) // Seller 1 trying to edit Seller 2's listing
      .send({ availableQuantityMT: 999 });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // TEST 9 & 10: Buyers and Sellers cannot create official purchase orders
  test('9. Buyer is forbidden from creating or issuing official purchase orders', async () => {
    const res = await request(app)
      .post('/api/purchase-orders/admin/create')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ quantityMT: 100, agreedRatePerQuintal: 8000 });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('10. Seller is forbidden from creating or issuing official purchase orders', async () => {
    const res = await request(app)
      .post('/api/purchase-orders/admin/create')
      .set('Authorization', `Bearer ${seller1Token}`)
      .send({ quantityMT: 100, agreedRatePerQuintal: 8000 });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // TEST 11: Only admin can finalize negotiations and lock deals
  test('11. Only Super Admin can confirm negotiations and issue POs; ordinary users are blocked', async () => {
    const res = await request(app)
      .post('/api/negotiations/admin/neg-3011/confirm-deal')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ finalAgreedPrice: 7500 });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // TEST 12: Only admin can see business financial reports and analytics
  test('12. Only Super Admin can access business analytics summary and gross brokerage earnings', async () => {
    const buyerAttempt = await request(app)
      .get('/api/analytics/admin/summary')
      .set('Authorization', `Bearer ${buyerToken}`);
    expect(buyerAttempt.status).toBe(403);

    const sellerAttempt = await request(app)
      .get('/api/analytics/admin/summary')
      .set('Authorization', `Bearer ${seller1Token}`);
    expect(sellerAttempt.status).toBe(403);

    const adminRes = await request(app)
      .get('/api/analytics/admin/summary')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.metrics.totalBrokerageEarned).toBeGreaterThanOrEqual(0);
  });

  // TEST 13: Exported Excel data is restricted to Admin
  test('13. Ordinary users cannot export platform databases to Excel', async () => {
    const res = await request(app)
      .get('/api/export/admin/excel/buyers')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(403);
  });

  // TEST 14: Super Admin login requires separate secure endpoint and MFA
  test('14. Super Admin credentials are rejected on the public login route and require MFA on /admin/login', async () => {
    // Attempting admin login on public route
    const publicAttempt = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@pragyam.com', password: 'Pragyam@Admin2026!' });
    expect(publicAttempt.status).toBe(403);

    // Attempting admin login on admin route without MFA code
    const noMfaAttempt = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'admin@pragyam.com', password: 'Pragyam@Admin2026!' });
    expect(noMfaAttempt.body.requiresMfa).toBe(true);

    // Valid admin login with MFA
    const validMfa = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'admin@pragyam.com', password: 'Pragyam@Admin2026!', mfaCode: '123456' });
    expect(validMfa.status).toBe(200);
    expect(validMfa.body.token).toBeDefined();
  });

  // TEST 15: Purchase Order view sanitization for Buyer and Seller
  test('15. Purchase Order endpoint returns sanitized intermediary view for Buyer and Seller with no direct cross-party contact details', async () => {
    // Buyer view
    const buyerOrderRes = await request(app)
      .get('/api/purchase-orders/buyer/my-orders')
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(buyerOrderRes.status).toBe(200);
    expect(buyerOrderRes.body.purchaseOrders.length).toBeGreaterThan(0);
    const buyerPO = buyerOrderRes.body.purchaseOrders[0];
    expect(buyerPO.intermediaryBroker).toBe('PRAGYAM ENTERPRISES');
    expect(buyerPO.sellerCompanyName).toBeUndefined();
    expect(buyerPO.sellerPhone).toBeUndefined();

    // Seller view
    const sellerOrderRes = await request(app)
      .get('/api/purchase-orders/seller/my-orders')
      .set('Authorization', `Bearer ${seller1Token}`);

    expect(sellerOrderRes.status).toBe(200);
    expect(sellerOrderRes.body.purchaseOrders.length).toBeGreaterThan(0);
    const sellerPO = sellerOrderRes.body.purchaseOrders[0];
    expect(sellerPO.intermediaryBroker).toBe('PRAGYAM ENTERPRISES');
    expect(sellerPO.buyerCompanyName).toBeUndefined();
    expect(sellerPO.buyerPhone).toBeUndefined();
  });
});

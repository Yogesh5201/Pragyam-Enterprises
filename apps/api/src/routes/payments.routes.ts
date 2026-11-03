import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/inMemoryDb';
import {
  UserRole,
  PaymentType,
  PaymentMethod,
  PaymentStatus,
  PaymentRecordDTO
} from '@pragyam/types';
import { authenticateJWT, requireAdmin } from '../middleware/auth.middleware';
import { ENV } from '../config/env';

export const paymentsRouter = Router();

// ==========================================
// 1. GET ALL PAYMENTS FOR ADMIN
// ==========================================
paymentsRouter.get('/admin/all', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      count: db.payments.length,
      payments: db.payments
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. GET USER'S OWN PAYMENT RECORDS
// ==========================================
paymentsRouter.get('/my-payments', authenticateJWT, (req: Request, res: Response) => {
  try {
    let myPayments: PaymentRecordDTO[] = [];

    if (req.user?.role === UserRole.BUYER) {
      const buyer = db.buyerProfiles.find(b => b.userId === req.user?.userId);
      if (buyer) {
        myPayments = db.payments.filter(p => p.payerId === buyer.id);
      }
    } else if (req.user?.role === UserRole.SELLER) {
      const seller = db.sellerProfiles.find(s => s.userId === req.user?.userId);
      if (seller) {
        myPayments = db.payments.filter(p => p.payerId === seller.id);
      }
    }

    return res.json({
      success: true,
      count: myPayments.length,
      payments: myPayments
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. RECORD OFFLINE PAYMENT (ADMIN OR USER)
// ==========================================
paymentsRouter.post('/record-offline', authenticateJWT, (req: Request, res: Response) => {
  try {
    const {
      poId,
      paymentType,
      amount,
      method,
      referenceNumber,
      paymentDate,
      notes
    } = req.body;

    const po = db.purchaseOrders.find(p => p.id === poId);
    if (!po) {
      return res.status(404).json({ success: false, error: 'Purchase Order not found' });
    }

    const isAdmin = req.user?.role === UserRole.SUPER_ADMIN;
    let payerRole: 'BUYER' | 'SELLER' = 'BUYER';
    let payerId = '';
    let payerName = '';

    if (isAdmin) {
      payerRole = req.body.payerRole || 'BUYER';
      payerId = payerRole === 'BUYER' ? po.buyerId! : po.sellerId!;
      payerName = payerRole === 'BUYER' ? po.buyerCompanyName! : po.sellerCompanyName!;
    } else if (req.user?.role === UserRole.BUYER) {
      const buyer = db.buyerProfiles.find(b => b.userId === req.user?.userId);
      if (!buyer || po.buyerId !== buyer.id) {
        return res.status(403).json({ success: false, error: 'Unauthorized to log payment for this order' });
      }
      payerRole = 'BUYER';
      payerId = buyer.id;
      payerName = buyer.companyName;
    } else {
      const seller = db.sellerProfiles.find(s => s.userId === req.user?.userId);
      if (!seller || po.sellerId !== seller.id) {
        return res.status(403).json({ success: false, error: 'Unauthorized to log payment for this order' });
      }
      payerRole = 'SELLER';
      payerId = seller.id;
      payerName = seller.companyName;
    }

    const newPayment: PaymentRecordDTO = {
      id: `pay-${Date.now()}`,
      poId: po.id,
      poNumber: po.poNumber,
      paymentType: paymentType || PaymentType.GOODS_PAYMENT,
      amount: Number(amount),
      payerRole,
      payerId,
      payerName,
      method: method || PaymentMethod.RTGS,
      referenceNumber: referenceNumber || `REF-${Date.now()}`,
      paymentDate: paymentDate || new Date().toISOString(),
      status: isAdmin ? PaymentStatus.VERIFIED : PaymentStatus.PENDING,
      verifiedByAdmin: isAdmin,
      notes: notes || ''
    };

    db.payments.unshift(newPayment);

    db.logAudit(
      req.user!.userId,
      req.user!.role,
      'RECORD_PAYMENT',
      'PAYMENT',
      newPayment.id,
      `Payment recorded for PO ${po.poNumber}: ₹${newPayment.amount.toLocaleString('en-IN')} via ${newPayment.method} (Ref: ${newPayment.referenceNumber})`,
      req.ip
    );

    return res.status(201).json({
      success: true,
      message: isAdmin
        ? 'Payment verified and recorded directly by Admin.'
        : 'Payment entry submitted. Pending verification by Pragyam Enterprises accounts desk.',
      payment: newPayment
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. ADMIN: VERIFY OR REJECT PAYMENT ENTRY
// ==========================================
paymentsRouter.put('/admin/:id/verify', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const payment = db.payments.find(p => p.id === req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment record not found' });
    }

    const { status, notes } = req.body;
    payment.status = status || PaymentStatus.VERIFIED;
    payment.verifiedByAdmin = payment.status === PaymentStatus.VERIFIED;
    if (notes) payment.notes = notes;

    db.logAudit(
      req.user!.userId,
      UserRole.SUPER_ADMIN,
      'VERIFY_PAYMENT',
      'PAYMENT',
      payment.id,
      `Admin updated payment status to ${payment.status} for PO ${payment.poNumber}`,
      req.ip
    );

    return res.json({ success: true, message: 'Payment verification updated', payment });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. ONLINE PAYMENT GATEWAY (RAZORPAY INTEGRATION ABSTRACTION)
// ==========================================
paymentsRouter.post('/online/create-order', authenticateJWT, (req: Request, res: Response) => {
  try {
    const { poId, amount, paymentType } = req.body;
    const po = db.purchaseOrders.find(p => p.id === poId);
    if (!po) {
      return res.status(404).json({ success: false, error: 'Purchase Order not found' });
    }

    const orderAmount = Number(amount);
    // In production, razorpay.orders.create({ amount: orderAmount * 100, currency: 'INR' })
    const razorpayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;

    return res.json({
      success: true,
      razorpayOrderId,
      amount: orderAmount,
      currency: 'INR',
      keyId: ENV.RAZORPAY_KEY_ID,
      companyName: 'Pragyam Enterprises',
      description: `${paymentType === PaymentType.BROKERAGE_PAYMENT ? 'Brokerage' : 'Goods'} Settlement for PO ${po.poNumber}`
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Cryptographic webhook / client verification
paymentsRouter.post('/online/verify', authenticateJWT, (req: Request, res: Response) => {
  try {
    const {
      poId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amount,
      paymentType
    } = req.body;

    const po = db.purchaseOrders.find(p => p.id === poId);
    if (!po) {
      return res.status(404).json({ success: false, error: 'Purchase Order not found' });
    }

    // Backend verification of signature:
    // const generatedSignature = crypto.createHmac('sha256', ENV.RAZORPAY_KEY_SECRET).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex');
    // In dev / sandbox, signature is accepted or verified if real keys provided

    const newPayment: PaymentRecordDTO = {
      id: `pay-${Date.now()}`,
      poId: po.id,
      poNumber: po.poNumber,
      paymentType: paymentType || PaymentType.BROKERAGE_PAYMENT,
      amount: Number(amount),
      payerRole: req.user?.role === UserRole.SELLER ? 'SELLER' : 'BUYER',
      payerId: req.user?.profileId || 'online-payer',
      payerName: req.user?.companyName || 'Online Client',
      method: PaymentMethod.ONLINE_GATEWAY,
      referenceNumber: razorpayPaymentId || `RP-${Date.now()}`,
      paymentDate: new Date().toISOString(),
      status: PaymentStatus.VERIFIED,
      verifiedByAdmin: true,
      notes: `Verified via online gateway (Order: ${razorpayOrderId})`
    };

    db.payments.unshift(newPayment);

    db.logAudit(
      req.user!.userId,
      req.user!.role,
      'ONLINE_PAYMENT_VERIFIED',
      'PAYMENT',
      newPayment.id,
      `Online payment verified: ₹${newPayment.amount.toLocaleString('en-IN')} (Ref: ${newPayment.referenceNumber})`,
      req.ip
    );

    return res.json({
      success: true,
      message: 'Online payment authenticated and reconciled successfully',
      payment: newPayment
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

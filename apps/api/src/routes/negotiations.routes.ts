import { Router, Request, Response } from 'express';
import { db } from '../db/inMemoryDb';
import {
  UserRole,
  BrokerageType,
  BrokeragePayee,
  NegotiationRecordDTO
} from '@pragyam/types';
import { authenticateJWT, requireAdmin } from '../middleware/auth.middleware';

export const negotiationsRouter = Router();

// ==========================================
// 1. ADMIN: GET ALL NEGOTIATION RECORDS
// ==========================================
negotiationsRouter.get('/admin/all', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      count: db.negotiations.length,
      negotiations: db.negotiations
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. ADMIN: CREATE / INITIATE NEGOTIATION FROM ENQUIRY
// ==========================================
negotiationsRouter.post('/admin/initiate', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      enquiryId,
      listingId,
      buyerId,
      sellerId,
      sellerInitialPrice,
      buyerTargetPrice,
      brokeragePerUnit,
      brokerageType,
      brokeragePayee,
      notes
    } = req.body;

    const buyer = db.buyerProfiles.find(b => b.id === buyerId);
    const seller = db.sellerProfiles.find(s => s.id === sellerId);
    const listing = db.listings.find(l => l.id === listingId);

    if (!buyer || !seller || !listing) {
      return res.status(400).json({ success: false, error: 'Invalid buyer, seller, or listing ID' });
    }

    const newNeg: NegotiationRecordDTO = {
      id: `neg-${Date.now()}`,
      enquiryId: enquiryId || `enq-direct-${Date.now()}`,
      listingId: listing.id,
      anonymousListingCode: listing.anonymousCode,
      buyerId: buyer.id,
      buyerCompanyName: buyer.companyName,
      sellerId: seller.id,
      sellerCompanyName: seller.companyName,
      sellerInitialPrice: Number(sellerInitialPrice || listing.askingPricePerQuintal),
      buyerTargetPrice: Number(buyerTargetPrice || listing.askingPricePerQuintal),
      adminNegotiatedPrice: Number(sellerInitialPrice || listing.askingPricePerQuintal),
      finalAgreedPrice: Number(sellerInitialPrice || listing.askingPricePerQuintal),
      agreedQuantityMT: Number(listing.availableQuantityMT),
      brokeragePerUnit: Number(brokeragePerUnit || listing.brokerageOffered || 100),
      brokerageType: brokerageType || BrokerageType.PER_METRIC_TONNE,
      brokeragePayee: brokeragePayee || BrokeragePayee.SELLER,
      buyerAgreed: false,
      sellerAgreed: false,
      adminConfirmed: false,
      notes: notes || 'Admin initiated negotiation round between Buyer and Seller.',
      status: 'ACTIVE',
      updatedAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          note: 'Admin initiated negotiation deal file.',
          price: Number(sellerInitialPrice || listing.askingPricePerQuintal),
          actor: 'ADMIN'
        }
      ]
    };

    db.negotiations.unshift(newNeg);

    db.logAudit(
      req.user!.userId,
      UserRole.SUPER_ADMIN,
      'INITIATE_NEGOTIATION',
      'NEGOTIATION',
      newNeg.id,
      `Admin initiated negotiation for listing ${listing.anonymousCode} between ${buyer.companyName} and ${seller.companyName}`,
      req.ip
    );

    return res.status(201).json({ success: true, negotiation: newNeg });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. ADMIN: RECORD COUNTER-OFFER / NOTE IN NEGOTIATION
// ==========================================
negotiationsRouter.post('/admin/:id/record-round', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const neg = db.negotiations.find(n => n.id === req.params.id);
    if (!neg) {
      return res.status(404).json({ success: false, error: 'Negotiation record not found' });
    }

    const {
      adminNegotiatedPrice,
      agreedQuantityMT,
      brokeragePerUnit,
      buyerAgreed,
      sellerAgreed,
      note,
      actor
    } = req.body;

    if (adminNegotiatedPrice !== undefined) neg.adminNegotiatedPrice = Number(adminNegotiatedPrice);
    if (agreedQuantityMT !== undefined) neg.agreedQuantityMT = Number(agreedQuantityMT);
    if (brokeragePerUnit !== undefined) neg.brokeragePerUnit = Number(brokeragePerUnit);
    if (buyerAgreed !== undefined) neg.buyerAgreed = Boolean(buyerAgreed);
    if (sellerAgreed !== undefined) neg.sellerAgreed = Boolean(sellerAgreed);

    neg.history.push({
      timestamp: new Date().toISOString(),
      note: note || `Admin recorded update: Price ₹${neg.adminNegotiatedPrice}/Qtl`,
      price: neg.adminNegotiatedPrice,
      actor: actor || 'ADMIN'
    });
    neg.updatedAt = new Date().toISOString();

    db.logAudit(
      req.user!.userId,
      UserRole.SUPER_ADMIN,
      'UPDATE_NEGOTIATION',
      'NEGOTIATION',
      neg.id,
      `Admin updated negotiation round: Agreed Price ₹${neg.adminNegotiatedPrice}/Qtl`,
      req.ip
    );

    return res.json({ success: true, message: 'Negotiation round recorded', negotiation: neg });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. ADMIN: CONFIRM DEAL & LOCK FINAL PRICE
// ==========================================
negotiationsRouter.post('/admin/:id/confirm-deal', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const neg = db.negotiations.find(n => n.id === req.params.id);
    if (!neg) {
      return res.status(404).json({ success: false, error: 'Negotiation record not found' });
    }

    const { finalAgreedPrice, agreedQuantityMT, brokeragePerUnit, brokeragePayee, notes } = req.body;

    neg.finalAgreedPrice = Number(finalAgreedPrice || neg.adminNegotiatedPrice);
    if (agreedQuantityMT) neg.agreedQuantityMT = Number(agreedQuantityMT);
    if (brokeragePerUnit) neg.brokeragePerUnit = Number(brokeragePerUnit);
    if (brokeragePayee) neg.brokeragePayee = brokeragePayee;
    if (notes) neg.notes = notes;

    neg.buyerAgreed = true;
    neg.sellerAgreed = true;
    neg.adminConfirmed = true;
    neg.status = 'AGREED';
    neg.updatedAt = new Date().toISOString();

    neg.history.push({
      timestamp: new Date().toISOString(),
      note: `DEAL CONFIRMED by Pragyam Broker at ₹${neg.finalAgreedPrice}/Qtl across ${neg.agreedQuantityMT} MT. Ready for PO creation.`,
      price: neg.finalAgreedPrice,
      actor: 'ADMIN'
    });

    db.logAudit(
      req.user!.userId,
      UserRole.SUPER_ADMIN,
      'CONFIRM_DEAL',
      'NEGOTIATION',
      neg.id,
      `Admin finalized deal at ₹${neg.finalAgreedPrice}/Qtl for ${neg.agreedQuantityMT} MT`,
      req.ip
    );

    return res.json({
      success: true,
      message: 'Deal confirmed and locked. You can now issue the Official Purchase Order.',
      negotiation: neg
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

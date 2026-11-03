import { Router, Request, Response } from 'express';
import { db } from '../db/inMemoryDb';
import {
  UserRole,
  RiceCategory,
  RiceClassification,
  PackagingType,
  PurchaseRequirementDTO
} from '@pragyam/types';
import { mtToQuintals, pricePerQuintalToMT } from '@pragyam/shared';
import { authenticateJWT, requireBuyer, requireAdmin } from '../middleware/auth.middleware';

export const requirementsRouter = Router();

// ==========================================
// 1. BUYER: SUBMIT PURCHASE REQUIREMENT
// ==========================================
requirementsRouter.post('/', authenticateJWT, requireBuyer, (req: Request, res: Response) => {
  try {
    const buyerProfile = db.buyerProfiles.find(b => b.userId === req.user?.userId);
    if (!buyerProfile) {
      return res.status(404).json({ success: false, error: 'Buyer profile not found' });
    }

    const {
      category,
      variety,
      classification,
      requiredQuantityMT,
      targetPricePerQuintal,
      qualitySpecs,
      packagingRequirement,
      deliveryLocation,
      requiredDeliveryDate,
      additionalNotes
    } = req.body;

    if (!category || !variety || !requiredQuantityMT || !targetPricePerQuintal) {
      return res.status(400).json({
        success: false,
        error: 'Missing mandatory fields (category, variety, requiredQuantityMT, targetPricePerQuintal)'
      });
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const anonymousCode = `REQ-${randomNum}`;

    const newReq: PurchaseRequirementDTO = {
      id: `req-${Date.now()}`,
      anonymousCode,
      buyerId: buyerProfile.id,
      buyerName: buyerProfile.fullName,
      buyerCompanyName: buyerProfile.companyName,
      category,
      variety,
      classification: classification || RiceClassification.BASMATI,
      requiredQuantityMT: Number(requiredQuantityMT),
      requiredQuantityQuintals: mtToQuintals(Number(requiredQuantityMT)),
      targetPricePerQuintal: Number(targetPricePerQuintal),
      targetPricePerMT: pricePerQuintalToMT(Number(targetPricePerQuintal)),
      qualitySpecs: {
        grainLengthMm: qualitySpecs?.grainLengthMm ? Number(qualitySpecs.grainLengthMm) : 8.2,
        whiteness: qualitySpecs?.whiteness ? Number(qualitySpecs.whiteness) : 40.0,
        moisturePercent: qualitySpecs?.moisturePercent ? Number(qualitySpecs.moisturePercent) : 12.0,
        brokenPercent: qualitySpecs?.brokenPercent ? Number(qualitySpecs.brokenPercent) : 1.0,
        foreignMatterPercent: qualitySpecs?.foreignMatterPercent ? Number(qualitySpecs.foreignMatterPercent) : 0.05,
        damagedGrainPercent: qualitySpecs?.damagedGrainPercent ? Number(qualitySpecs.damagedGrainPercent) : 0.5,
        chalkyGrainPercent: qualitySpecs?.chalkyGrainPercent ? Number(qualitySpecs.chalkyGrainPercent) : 1.0,
        yellowGrainPercent: qualitySpecs?.yellowGrainPercent ? Number(qualitySpecs.yellowGrainPercent) : 0.5,
        sortex: qualitySpecs?.sortex !== undefined ? Boolean(qualitySpecs.sortex) : true,
        cropYear: qualitySpecs?.cropYear || '2025-2026'
      },
      packagingRequirement: packagingRequirement || PackagingType.PP_BAG_50KG,
      deliveryLocation: {
        city: deliveryLocation?.city || buyerProfile.city,
        district: deliveryLocation?.district || buyerProfile.district,
        state: deliveryLocation?.state || buyerProfile.state,
        pinCode: deliveryLocation?.pinCode || buyerProfile.pinCode
      },
      requiredDeliveryDate: requiredDeliveryDate || new Date().toISOString(),
      additionalNotes: additionalNotes || '',
      status: 'OPEN',
      createdAt: new Date().toISOString()
    };

    db.requirements.unshift(newReq);

    db.logAudit(
      req.user!.userId,
      UserRole.BUYER,
      'CREATE_PURCHASE_REQUIREMENT',
      'REQUIREMENT',
      newReq.id,
      `Buyer submitted requirement ${newReq.anonymousCode}: ${newReq.variety} (${newReq.requiredQuantityMT} MT at ₹${newReq.targetPricePerQuintal}/Qtl)`,
      req.ip
    );

    return res.status(201).json({
      success: true,
      message: 'Purchase requirement recorded. Pragyam Enterprises broker will review matching stock.',
      requirement: newReq
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. BUYER: GET OWN REQUIREMENTS
// ==========================================
requirementsRouter.get('/my-requirements', authenticateJWT, requireBuyer, (req: Request, res: Response) => {
  try {
    const buyerProfile = db.buyerProfiles.find(b => b.userId === req.user?.userId);
    if (!buyerProfile) {
      return res.status(404).json({ success: false, error: 'Buyer profile not found' });
    }

    const myReqs = db.requirements.filter(r => r.buyerId === buyerProfile.id);
    return res.json({ success: true, count: myReqs.length, requirements: myReqs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. ADMIN: ALL REQUIREMENTS WITH BUYER IDENTITIES
// ==========================================
requirementsRouter.get('/admin/all', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      count: db.requirements.length,
      requirements: db.requirements
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

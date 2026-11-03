import { Router, Request, Response } from 'express';
import { db } from '../db/inMemoryDb';
import { UserRole, PurchaseEnquiryDTO } from '@pragyam/types';
import { authenticateJWT, requireBuyer, requireAdmin } from '../middleware/auth.middleware';

export const enquiriesRouter = Router();

// ==========================================
// 1. BUYER: SUBMIT ENQUIRY ON ANONYMOUS LISTING
// ==========================================
enquiriesRouter.post('/', authenticateJWT, requireBuyer, (req: Request, res: Response) => {
  try {
    const buyerProfile = db.buyerProfiles.find(b => b.userId === req.user?.userId);
    if (!buyerProfile) {
      return res.status(404).json({ success: false, error: 'Buyer profile not found' });
    }

    const { listingId, requestedQuantityMT, targetPricePerQuintal, buyerNotes } = req.body;
    if (!listingId || !requestedQuantityMT) {
      return res.status(400).json({ success: false, error: 'Listing ID and requested quantity are required' });
    }

    const listing = db.listings.find(l => l.id === listingId);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Rice listing not found' });
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const enquiryCode = `ENQ-${randomNum}`;

    const newEnquiry: PurchaseEnquiryDTO = {
      id: `enq-${Date.now()}`,
      enquiryCode,
      listingId: listing.id,
      anonymousListingCode: listing.anonymousCode,
      category: listing.category,
      variety: listing.variety,
      buyerId: buyerProfile.id,
      buyerCompanyName: buyerProfile.companyName,
      requestedQuantityMT: Number(requestedQuantityMT),
      targetPricePerQuintal: targetPricePerQuintal ? Number(targetPricePerQuintal) : listing.askingPricePerQuintal,
      buyerNotes: buyerNotes || '',
      adminStatus: 'PENDING_REVIEW',
      adminNotes: 'Enquiry received. Desk broker will verify inventory with mill.',
      createdAt: new Date().toISOString()
    };

    db.enquiries.unshift(newEnquiry);

    db.logAudit(
      req.user!.userId,
      UserRole.BUYER,
      'CREATE_ENQUIRY',
      'ENQUIRY',
      newEnquiry.id,
      `Buyer submitted enquiry ${newEnquiry.enquiryCode} on listing ${listing.anonymousCode} (${newEnquiry.requestedQuantityMT} MT)`,
      req.ip
    );

    return res.status(201).json({
      success: true,
      message: 'Enquiry submitted directly to Pragyam Enterprises Brokerage Desk.',
      enquiry: {
        id: newEnquiry.id,
        enquiryCode: newEnquiry.enquiryCode,
        anonymousListingCode: newEnquiry.anonymousListingCode,
        category: newEnquiry.category,
        variety: newEnquiry.variety,
        requestedQuantityMT: newEnquiry.requestedQuantityMT,
        targetPricePerQuintal: newEnquiry.targetPricePerQuintal,
        adminStatus: newEnquiry.adminStatus,
        createdAt: newEnquiry.createdAt
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. BUYER: GET OWN ENQUIRIES
// ==========================================
enquiriesRouter.get('/my-enquiries', authenticateJWT, requireBuyer, (req: Request, res: Response) => {
  try {
    const buyerProfile = db.buyerProfiles.find(b => b.userId === req.user?.userId);
    if (!buyerProfile) {
      return res.status(404).json({ success: false, error: 'Buyer profile not found' });
    }

    const myEnquiries = db.enquiries
      .filter(e => e.buyerId === buyerProfile.id)
      .map(e => ({
        id: e.id,
        enquiryCode: e.enquiryCode,
        listingId: e.listingId,
        anonymousListingCode: e.anonymousListingCode,
        category: e.category,
        variety: e.variety,
        requestedQuantityMT: e.requestedQuantityMT,
        targetPricePerQuintal: e.targetPricePerQuintal,
        buyerNotes: e.buyerNotes,
        adminStatus: e.adminStatus,
        adminNotes: e.adminNotes,
        createdAt: e.createdAt
      }));

    return res.json({ success: true, count: myEnquiries.length, enquiries: myEnquiries });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. ADMIN: ALL ENQUIRIES (FULL DETAILS)
// ==========================================
enquiriesRouter.get('/admin/all', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const enriched = db.enquiries.map(e => {
      const buyer = db.buyerProfiles.find(b => b.id === e.buyerId);
      const listing = db.listings.find(l => l.id === e.listingId);
      const seller = listing ? db.sellerProfiles.find(s => s.id === listing.sellerId) : null;
      return {
        ...e,
        buyerFullName: buyer?.fullName,
        buyerCompanyName: buyer?.companyName,
        buyerPhone: buyer?.phone,
        sellerFullName: seller?.fullName,
        sellerCompanyName: seller?.companyName,
        sellerPhone: seller?.phone,
        sellerAskingPrice: listing?.askingPricePerQuintal
      };
    });

    return res.json({ success: true, count: enriched.length, enquiries: enriched });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. ADMIN: UPDATE ENQUIRY STATUS & NOTES
// ==========================================
enquiriesRouter.put('/admin/:id/status', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const enquiry = db.enquiries.find(e => e.id === req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, error: 'Enquiry not found' });
    }

    const { adminStatus, adminNotes } = req.body;
    if (adminStatus) enquiry.adminStatus = adminStatus;
    if (adminNotes !== undefined) enquiry.adminNotes = adminNotes;

    db.logAudit(
      req.user!.userId,
      UserRole.SUPER_ADMIN,
      'UPDATE_ENQUIRY_STATUS',
      'ENQUIRY',
      enquiry.id,
      `Admin updated enquiry ${enquiry.enquiryCode} status to ${enquiry.adminStatus}`,
      req.ip
    );

    return res.json({ success: true, message: 'Enquiry updated successfully', enquiry });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

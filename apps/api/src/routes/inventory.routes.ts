import { Router, Request, Response } from 'express';
import { db, DbListing } from '../db/inMemoryDb';
import {
  UserRole,
  ListingStatus,
  RiceCategory,
  RiceClassification,
  PackagingType,
  BrokerageType
} from '@pragyam/types';
import {
  sanitizeListingForBuyer,
  mtToQuintals,
  pricePerQuintalToMT
} from '@pragyam/shared';
import { authenticateJWT, requireSeller, requireAdmin } from '../middleware/auth.middleware';

export const inventoryRouter = Router();

// ==========================================
// 1. ANONYMOUS LISTINGS FOR BUYERS & PUBLIC
// ==========================================
inventoryRouter.get('/', (req: Request, res: Response) => {
  try {
    const {
      category,
      variety,
      classification,
      minGrainLength,
      maxMoisture,
      maxBroken,
      maxPrice,
      state
    } = req.query;

    let results = db.listings.filter(
      l => l.status === ListingStatus.ACTIVE && !l.moderationFlagged
    );

    if (category) {
      results = results.filter(l => l.category === category);
    }
    if (variety) {
      results = results.filter(l =>
        l.variety.toLowerCase().includes(String(variety).toLowerCase())
      );
    }
    if (classification) {
      results = results.filter(l => l.classification === classification);
    }
    if (minGrainLength) {
      results = results.filter(
        l => l.qualitySpecs.grainLengthMm >= Number(minGrainLength)
      );
    }
    if (maxMoisture) {
      results = results.filter(
        l => l.qualitySpecs.moisturePercent <= Number(maxMoisture)
      );
    }
    if (maxBroken) {
      results = results.filter(
        l => l.qualitySpecs.brokenPercent <= Number(maxBroken)
      );
    }
    if (maxPrice) {
      results = results.filter(
        l => l.askingPricePerQuintal <= Number(maxPrice)
      );
    }
    if (state) {
      results = results.filter(
        l => l.generalizedState.toLowerCase() === String(state).toLowerCase()
      );
    }

    // STRICT CONFIDENTIALITY: ALWAYS sanitize for Buyer view
    const anonymousListings = results.map(sanitizeListingForBuyer);

    return res.json({
      success: true,
      count: anonymousListings.length,
      listings: anonymousListings
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. SINGLE ANONYMOUS LISTING DETAIL
// ==========================================
inventoryRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const listing = db.listings.find(l => l.id === req.params.id);
    if (!listing || listing.status !== ListingStatus.ACTIVE) {
      return res.status(404).json({ success: false, error: 'Listing not found or unavailable' });
    }

    return res.json({
      success: true,
      listing: sanitizeListingForBuyer(listing)
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. SELLER: GET OWN LISTINGS
// ==========================================
inventoryRouter.get('/seller/my-listings', authenticateJWT, requireSeller, (req: Request, res: Response) => {
  try {
    const sellerProfile = db.sellerProfiles.find(s => s.userId === req.user?.userId);
    if (!sellerProfile) {
      return res.status(404).json({ success: false, error: 'Seller profile not found' });
    }

    const sellerListings = db.listings.filter(l => l.sellerId === sellerProfile.id);

    return res.json({
      success: true,
      count: sellerListings.length,
      listings: sellerListings
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. SELLER: CREATE NEW STOCK LISTING
// ==========================================
inventoryRouter.post('/', authenticateJWT, requireSeller, (req: Request, res: Response) => {
  try {
    const sellerProfile = db.sellerProfiles.find(s => s.userId === req.user?.userId);
    if (!sellerProfile) {
      return res.status(404).json({ success: false, error: 'Seller profile not found' });
    }

    const {
      category,
      variety,
      classification,
      availableQuantityMT,
      minOrderQuantityMT,
      maxOrderQuantityMT,
      askingPricePerQuintal,
      brokerageOffered,
      brokerageType,
      millLocation,
      dispatchLocation,
      generalizedDistrict,
      generalizedState,
      qualitySpecs,
      packaging,
      availabilityDate,
      cropYear,
      stockImages,
      notes
    } = req.body;

    if (!category || !variety || !availableQuantityMT || !askingPricePerQuintal) {
      return res.status(400).json({
        success: false,
        error: 'Missing required listing fields (category, variety, availableQuantityMT, askingPricePerQuintal)'
      });
    }

    // Auto-generate anonymous ID (e.g. PRG-3091)
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const anonymousCode = `PRG-${randomCode}`;

    const newListing: DbListing = {
      id: `lst-${Date.now()}`,
      sellerId: sellerProfile.id,
      anonymousCode,
      category,
      variety,
      classification: classification || RiceClassification.BASMATI,
      availableQuantityMT: Number(availableQuantityMT),
      minOrderQuantityMT: minOrderQuantityMT ? Number(minOrderQuantityMT) : 25,
      maxOrderQuantityMT: maxOrderQuantityMT ? Number(maxOrderQuantityMT) : Number(availableQuantityMT),
      askingPricePerQuintal: Number(askingPricePerQuintal),
      brokerageOffered: brokerageOffered ? Number(brokerageOffered) : 100,
      brokerageType: brokerageType || BrokerageType.PER_METRIC_TONNE,
      millLocation: millLocation || sellerProfile.millName,
      dispatchLocation: dispatchLocation || sellerProfile.city,
      generalizedDistrict: generalizedDistrict || sellerProfile.district,
      generalizedState: generalizedState || sellerProfile.state,
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
        cropYear: cropYear || '2025-2026'
      },
      packaging: packaging || PackagingType.PP_BAG_50KG,
      availabilityDate: availabilityDate || new Date().toISOString(),
      cropYear: cropYear || '2025-2026',
      stockImages: Array.isArray(stockImages) && stockImages.length > 0
        ? stockImages
        : ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'],
      notes: notes || '',
      status: ListingStatus.ACTIVE, // Auto-published as per requirement!
      moderationFlagged: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.listings.unshift(newListing);

    db.logAudit(
      req.user!.userId,
      UserRole.SELLER,
      'CREATE_LISTING',
      'INVENTORY',
      newListing.id,
      `Seller added stock ${newListing.variety} (${newListing.availableQuantityMT} MT) as ${newListing.anonymousCode}`,
      req.ip
    );

    return res.status(201).json({
      success: true,
      message: 'Rice listing published successfully to platform catalog',
      listing: newListing
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. SELLER: UPDATE STOCK QUANTITY OR PRICE
// ==========================================
inventoryRouter.put('/:id', authenticateJWT, requireSeller, (req: Request, res: Response) => {
  try {
    const sellerProfile = db.sellerProfiles.find(s => s.userId === req.user?.userId);
    const listing = db.listings.find(l => l.id === req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    if (listing.sellerId !== sellerProfile?.id) {
      return res.status(403).json({ success: false, error: 'Forbidden: You can only edit your own listings' });
    }

    const { availableQuantityMT, askingPricePerQuintal, status, notes } = req.body;
    if (availableQuantityMT !== undefined) listing.availableQuantityMT = Number(availableQuantityMT);
    if (askingPricePerQuintal !== undefined) listing.askingPricePerQuintal = Number(askingPricePerQuintal);
    if (status) listing.status = status;
    if (notes !== undefined) listing.notes = notes;
    listing.updatedAt = new Date().toISOString();

    db.logAudit(
      req.user!.userId,
      UserRole.SELLER,
      'UPDATE_LISTING',
      'INVENTORY',
      listing.id,
      `Seller updated listing ${listing.anonymousCode}: Qty ${listing.availableQuantityMT} MT, Price ₹${listing.askingPricePerQuintal}/Qtl`,
      req.ip
    );

    return res.json({ success: true, message: 'Listing updated successfully', listing });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. ADMIN: ALL LISTINGS WITH SELLER DETAILS
// ==========================================
inventoryRouter.get('/admin/all', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const fullListings = db.listings.map(l => {
      const seller = db.sellerProfiles.find(s => s.id === l.sellerId);
      return {
        ...l,
        sellerFullName: seller?.fullName || 'Unknown',
        sellerCompanyName: seller?.companyName || 'Unknown Mill',
        sellerPhone: seller?.phone || '',
        sellerEmail: seller?.userId ? db.users.find(u => u.id === seller.userId)?.email : '',
        sellerGstin: seller?.gstin || ''
      };
    });

    return res.json({
      success: true,
      count: fullListings.length,
      listings: fullListings
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. ADMIN: MODERATE / FLAG / SUSPEND LISTING
// ==========================================
inventoryRouter.post('/admin/:id/moderate', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const listing = db.listings.find(l => l.id === req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    const { status, moderationFlagged, moderationReason } = req.body;
    if (status) listing.status = status;
    if (moderationFlagged !== undefined) listing.moderationFlagged = Boolean(moderationFlagged);
    if (moderationReason !== undefined) listing.moderationReason = moderationReason;
    listing.updatedAt = new Date().toISOString();

    db.logAudit(
      req.user!.userId,
      UserRole.SUPER_ADMIN,
      'MODERATE_LISTING',
      'INVENTORY',
      listing.id,
      `Admin moderated listing ${listing.anonymousCode}: Status=${listing.status}, Flagged=${listing.moderationFlagged}`,
      req.ip
    );

    return res.json({ success: true, message: 'Listing moderation applied', listing });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

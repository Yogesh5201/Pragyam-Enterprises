import { Router, Request, Response } from 'express';
import { db } from '../db/inMemoryDb';
import {
  UserRole,
  PurchaseOrderStatus,
  PurchaseOrderDTO,
  BrokerageType,
  BrokeragePayee
} from '@pragyam/types';
import {
  sanitizePOForBuyer,
  sanitizePOForSeller,
  calculateBrokerage,
  mtToQuintals,
  pricePerQuintalToMT
} from '@pragyam/shared';
import {
  authenticateJWT,
  requireAdmin,
  requireBuyer,
  requireSeller
} from '../middleware/auth.middleware';
import { generatePurchaseOrderPdf } from '../services/pdf.service';

export const purchaseOrdersRouter = Router();

// ==========================================
// 1. ADMIN: CREATE & ISSUE OFFICIAL PURCHASE ORDER
// ==========================================
purchaseOrdersRouter.post('/admin/create', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      negotiationId,
      listingId,
      buyerId,
      sellerId,
      quantityMT,
      agreedRatePerQuintal,
      brokerageType,
      brokeragePerUnit,
      brokeragePayee,
      dispatchLocation,
      deliveryLocation,
      deliveryDate,
      paymentTerms,
      specialInstructions
    } = req.body;

    const buyer = db.buyerProfiles.find(b => b.id === buyerId);
    const seller = db.sellerProfiles.find(s => s.id === sellerId);
    const listing = db.listings.find(l => l.id === listingId);

    if (!buyer || !seller || !listing || !quantityMT || !agreedRatePerQuintal) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields for PO creation (buyerId, sellerId, listingId, quantityMT, agreedRatePerQuintal)'
      });
    }

    const qMT = Number(quantityMT);
    const rateQtl = Number(agreedRatePerQuintal);
    const qQtl = mtToQuintals(qMT);
    const totalGoodsValue = Number((qQtl * rateQtl).toFixed(2));

    const bType = brokerageType || BrokerageType.PER_METRIC_TONNE;
    const bRate = brokeragePerUnit !== undefined ? Number(brokeragePerUnit) : 100;
    const bCalc = calculateBrokerage(qMT, rateQtl, bType, bRate);

    const year = new Date().getFullYear();
    const poCount = db.purchaseOrders.length + 1;
    const poNumber = `PE-PO-${year}-${String(poCount).padStart(3, '0')}`;

    const newPO: PurchaseOrderDTO = {
      id: `po-${Date.now()}`,
      poNumber,
      orderDate: new Date().toISOString(),
      riceCategory: listing.category,
      riceVariety: listing.variety,
      classification: listing.classification,
      quantityMT: qMT,
      quantityQuintals: qQtl,
      agreedRatePerQuintal: rateQtl,
      agreedRatePerMT: pricePerQuintalToMT(rateQtl),
      totalGoodsValue,
      qualitySpecs: listing.qualitySpecs,
      packaging: listing.packaging,
      dispatchLocation: dispatchLocation || listing.millLocation,
      deliveryLocation: deliveryLocation || `${buyer.city}, ${buyer.state}`,
      deliveryDate: deliveryDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      paymentTerms: paymentTerms || '20% Advance against Bilty, Balance 80% on delivery inspection',
      brokerageAmount: bCalc.brokerageTotal,
      brokerageType: bType,
      brokeragePayee: brokeragePayee || BrokeragePayee.SELLER,
      status: PurchaseOrderStatus.CONFIRMED,
      specialInstructions: specialInstructions || 'Compliance with quality specifications strictly required.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      buyerId: buyer.id,
      buyerCompanyName: buyer.companyName,
      sellerId: seller.id,
      sellerCompanyName: seller.companyName
    };

    db.purchaseOrders.unshift(newPO);

    // If negotiationId was passed, mark it as CONVERTED_TO_PO
    if (negotiationId) {
      const neg = db.negotiations.find(n => n.id === negotiationId);
      if (neg) {
        neg.status = 'CONVERTED_TO_PO';
        neg.updatedAt = new Date().toISOString();
      }
    }

    // Deduct stock from listing
    if (listing.availableQuantityMT >= qMT) {
      listing.availableQuantityMT = Number((listing.availableQuantityMT - qMT).toFixed(2));
      if (listing.availableQuantityMT === 0) {
        listing.status = 'SOLD_OUT' as any;
      }
    }

    db.logAudit(
      req.user!.userId,
      UserRole.SUPER_ADMIN,
      'CREATE_PURCHASE_ORDER',
      'PURCHASE_ORDER',
      newPO.id,
      `Super Admin issued Official PO ${newPO.poNumber}: ${newPO.riceVariety} (${newPO.quantityMT} MT at ₹${newPO.agreedRatePerQuintal}/Qtl). Total ₹${newPO.totalGoodsValue.toLocaleString('en-IN')}`,
      req.ip
    );

    return res.status(201).json({
      success: true,
      message: `Official Purchase Order ${newPO.poNumber} issued successfully.`,
      purchaseOrder: newPO
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. BUYER: GET OWN PURCHASE ORDERS (SANITIZED)
// ==========================================
purchaseOrdersRouter.get('/buyer/my-orders', authenticateJWT, requireBuyer, (req: Request, res: Response) => {
  try {
    const buyerProfile = db.buyerProfiles.find(b => b.userId === req.user?.userId);
    if (!buyerProfile) {
      return res.status(404).json({ success: false, error: 'Buyer profile not found' });
    }

    const orders = db.purchaseOrders
      .filter(p => p.buyerId === buyerProfile.id)
      .map(sanitizePOForBuyer);

    return res.json({ success: true, count: orders.length, purchaseOrders: orders });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. SELLER: GET OWN ORDERS (SANITIZED)
// ==========================================
purchaseOrdersRouter.get('/seller/my-orders', authenticateJWT, requireSeller, (req: Request, res: Response) => {
  try {
    const sellerProfile = db.sellerProfiles.find(s => s.userId === req.user?.userId);
    if (!sellerProfile) {
      return res.status(404).json({ success: false, error: 'Seller profile not found' });
    }

    const orders = db.purchaseOrders
      .filter(p => p.sellerId === sellerProfile.id)
      .map(sanitizePOForSeller);

    return res.json({ success: true, count: orders.length, purchaseOrders: orders });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. ADMIN: GET ALL PURCHASE ORDERS (COMPLETE)
// ==========================================
purchaseOrdersRouter.get('/admin/all', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      count: db.purchaseOrders.length,
      purchaseOrders: db.purchaseOrders
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. ADMIN: UPDATE PURCHASE ORDER STATUS
// ==========================================
purchaseOrdersRouter.put('/admin/:id/status', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const po = db.purchaseOrders.find(p => p.id === req.params.id);
    if (!po) {
      return res.status(404).json({ success: false, error: 'Purchase Order not found' });
    }

    const { status, specialInstructions } = req.body;
    if (status) po.status = status;
    if (specialInstructions !== undefined) po.specialInstructions = specialInstructions;
    po.updatedAt = new Date().toISOString();

    db.logAudit(
      req.user!.userId,
      UserRole.SUPER_ADMIN,
      'UPDATE_PO_STATUS',
      'PURCHASE_ORDER',
      po.id,
      `Admin changed status of PO ${po.poNumber} to ${po.status}`,
      req.ip
    );

    return res.json({ success: true, message: 'Purchase Order status updated', purchaseOrder: po });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. DOWNLOAD PO PDF (ROLE-BASED SANITIZED)
// ==========================================
purchaseOrdersRouter.get('/:id/pdf', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const po = db.purchaseOrders.find(p => p.id === req.params.id);
    if (!po) {
      return res.status(404).json({ success: false, error: 'Purchase Order not found' });
    }

    const role = req.user!.role as 'ADMIN' | 'BUYER' | 'SELLER';

    // Verify access
    if (role === UserRole.BUYER) {
      const buyer = db.buyerProfiles.find(b => b.userId === req.user?.userId);
      if (po.buyerId !== buyer?.id) {
        return res.status(403).json({ success: false, error: 'Unauthorized to view this purchase order' });
      }
    } else if (role === UserRole.SELLER) {
      const seller = db.sellerProfiles.find(s => s.userId === req.user?.userId);
      if (po.sellerId !== seller?.id) {
        return res.status(403).json({ success: false, error: 'Unauthorized to view this purchase order' });
      }
    }

    const pdfBuffer = await generatePurchaseOrderPdf(po, role);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${po.poNumber}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

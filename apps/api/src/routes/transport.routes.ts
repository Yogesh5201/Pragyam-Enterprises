import { Router, Request, Response } from 'express';
import { db } from '../db/inMemoryDb';
import { UserRole, TransportStatus, TransportRecordDTO } from '@pragyam/types';
import { authenticateJWT, requireAdmin } from '../middleware/auth.middleware';

export const transportRouter = Router();

// ==========================================
// 1. GET TRANSPORT RECORD FOR A PO
// ==========================================
transportRouter.get('/:poId', authenticateJWT, (req: Request, res: Response) => {
  try {
    const transport = db.transportRecords.find(t => t.poId === req.params.poId);
    if (!transport) {
      return res.status(404).json({ success: false, error: 'Transport record not found for this order' });
    }

    const po = db.purchaseOrders.find(p => p.id === transport.poId);

    // Permission check
    if (req.user?.role === UserRole.BUYER) {
      const buyer = db.buyerProfiles.find(b => b.userId === req.user?.userId);
      if (po?.buyerId !== buyer?.id) {
        return res.status(403).json({ success: false, error: 'Unauthorized to view this transport record' });
      }
    } else if (req.user?.role === UserRole.SELLER) {
      const seller = db.sellerProfiles.find(s => s.userId === req.user?.userId);
      if (po?.sellerId !== seller?.id) {
        return res.status(403).json({ success: false, error: 'Unauthorized to view this transport record' });
      }
    }

    return res.json({ success: true, transport });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. ADMIN: ASSIGN TRANSPORT & CREATE BILTY
// ==========================================
transportRouter.post('/admin/assign', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      poId,
      transporterName,
      vehicleNumber,
      driverName,
      driverPhone,
      biltyNumber,
      ewayBillNumber,
      loadingLocation,
      deliveryLocation,
      loadingDate,
      dispatchDate,
      expectedDeliveryDate,
      quantityLoadedMT,
      bagCount,
      freightCharges,
      freightStatus
    } = req.body;

    const po = db.purchaseOrders.find(p => p.id === poId);
    if (!po) {
      return res.status(404).json({ success: false, error: 'Purchase Order not found' });
    }

    const existingTransport = db.transportRecords.find(t => t.poId === poId);
    if (existingTransport) {
      return res.status(409).json({ success: false, error: 'Transport record already assigned to this PO' });
    }

    const newTransport: TransportRecordDTO = {
      id: `trp-${Date.now()}`,
      poId: po.id,
      poNumber: po.poNumber,
      transporterName: transporterName || 'Pragyam Certified Carrier Network',
      vehicleNumber: vehicleNumber || 'HR-05-AB-1234',
      driverName: driverName || 'Designated Driver',
      driverPhone: driverPhone || '+91 98000 00000',
      biltyNumber: biltyNumber || `LR-PRG-${Date.now()}`,
      ewayBillNumber: ewayBillNumber || '',
      loadingLocation: loadingLocation || po.dispatchLocation,
      deliveryLocation: deliveryLocation || po.deliveryLocation,
      loadingDate: loadingDate || new Date().toISOString(),
      dispatchDate: dispatchDate || new Date().toISOString(),
      expectedDeliveryDate: expectedDeliveryDate || po.deliveryDate,
      quantityLoadedMT: quantityLoadedMT ? Number(quantityLoadedMT) : po.quantityMT,
      bagCount: bagCount ? Number(bagCount) : Math.round(po.quantityQuintals * 2), // 50kg bags
      freightCharges: freightCharges ? Number(freightCharges) : 35000,
      freightStatus: freightStatus || 'PAID_BY_BUYER',
      status: TransportStatus.TRANSPORT_ASSIGNED,
      statusLogs: [
        {
          status: TransportStatus.TRANSPORT_ASSIGNED,
          timestamp: new Date().toISOString(),
          locationNote: `Vehicle ${vehicleNumber} assigned by Pragyam Enterprises logistics desk.`
        }
      ]
    };

    db.transportRecords.unshift(newTransport);

    // Update PO status to PROCESSING or READY_FOR_DISPATCH
    po.status = 'READY_FOR_DISPATCH' as any;
    po.updatedAt = new Date().toISOString();

    db.logAudit(
      req.user!.userId,
      UserRole.SUPER_ADMIN,
      'ASSIGN_TRANSPORT',
      'TRANSPORT',
      newTransport.id,
      `Transport assigned for PO ${po.poNumber}: Vehicle ${vehicleNumber}, Bilty ${newTransport.biltyNumber}`,
      req.ip
    );

    return res.status(201).json({
      success: true,
      message: 'Transport assigned and Bilty record initialized successfully',
      transport: newTransport
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. ADMIN: UPDATE DISPATCH / TRANSIT STATUS
// ==========================================
transportRouter.put('/admin/:id/status', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const transport = db.transportRecords.find(t => t.id === req.params.id);
    if (!transport) {
      return res.status(404).json({ success: false, error: 'Transport record not found' });
    }

    const { status, locationNote, proofOfDispatchUrl, proofOfDeliveryUrl } = req.body;
    if (status) transport.status = status;
    if (proofOfDispatchUrl) transport.proofOfDispatchUrl = proofOfDispatchUrl;
    if (proofOfDeliveryUrl) transport.proofOfDeliveryUrl = proofOfDeliveryUrl;

    transport.statusLogs.push({
      status: transport.status,
      timestamp: new Date().toISOString(),
      locationNote: locationNote || `Status updated to ${transport.status}`
    });

    // Sync PO status
    const po = db.purchaseOrders.find(p => p.id === transport.poId);
    if (po) {
      if (status === TransportStatus.DISPATCHED) po.status = 'DISPATCHED' as any;
      else if (status === TransportStatus.IN_TRANSIT) po.status = 'IN_TRANSIT' as any;
      else if (status === TransportStatus.DELIVERED) po.status = 'DELIVERED' as any;
      po.updatedAt = new Date().toISOString();
    }

    db.logAudit(
      req.user!.userId,
      UserRole.SUPER_ADMIN,
      'UPDATE_TRANSPORT_STATUS',
      'TRANSPORT',
      transport.id,
      `Transport status updated to ${transport.status}: ${locationNote || ''}`,
      req.ip
    );

    return res.json({ success: true, message: 'Transport tracking status updated', transport });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

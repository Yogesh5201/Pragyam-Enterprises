import { Router, Request, Response } from 'express';
import { db } from '../db/inMemoryDb';
import { DashboardMetricsDTO, ListingStatus, TransportStatus } from '@pragyam/types';
import { authenticateJWT, requireAdmin } from '../middleware/auth.middleware';

export const analyticsRouter = Router();

analyticsRouter.get('/admin/summary', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const totalTransactionValue = db.purchaseOrders.reduce((sum, po) => sum + (po.totalGoodsValue || 0), 0);
    const totalSalesMT = db.purchaseOrders.reduce((sum, po) => sum + (po.quantityMT || 0), 0);
    const totalBrokerageEarned = db.purchaseOrders.reduce((sum, po) => sum + (po.brokerageAmount || 0), 0);

    const completedOrders = db.purchaseOrders.filter(p => p.status === 'COMPLETED' || p.status === 'DELIVERED').length;
    const pendingOrders = db.purchaseOrders.filter(p => p.status !== 'COMPLETED' && p.status !== 'CANCELLED').length;
    const cancelledOrders = db.purchaseOrders.filter(p => p.status === 'CANCELLED').length;

    const activeBuyers = db.buyerProfiles.length;
    const activeSellers = db.sellerProfiles.length;

    const totalStockAvailableMT = db.listings
      .filter(l => l.status === ListingStatus.ACTIVE)
      .reduce((sum, l) => sum + (l.availableQuantityMT || 0), 0);

    const receivedPayments = db.payments
      .filter(p => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);

    const outstandingPayments = Math.max(0, totalTransactionValue + totalBrokerageEarned - receivedPayments);

    const pendingDispatches = db.transportRecords.filter(
      t => t.status !== TransportStatus.DELIVERED
    ).length;

    // Category breakdown
    const categoryMap: { [key: string]: { count: number; volumeMT: number } } = {};
    db.listings.forEach(l => {
      if (!categoryMap[l.category]) {
        categoryMap[l.category] = { count: 0, volumeMT: 0 };
      }
      categoryMap[l.category].count += 1;
      categoryMap[l.category].volumeMT += l.availableQuantityMT;
    });

    const categoryDistribution = Object.keys(categoryMap).map(cat => ({
      category: cat.replace('_', ' '),
      count: categoryMap[cat].count,
      volumeMT: categoryMap[cat].volumeMT
    }));

    // Monthly trends (seed simulated data + real)
    const monthlySalesTrend = [
      { month: 'Jul 2026', amount: 14200000, volumeMT: 180 },
      { month: 'Aug 2026', amount: 21500000, volumeMT: 260 },
      { month: 'Sep 2026', amount: 28400000, volumeMT: 340 },
      { month: 'Oct 2026', amount: totalTransactionValue || 35600000, volumeMT: totalSalesMT || 420 },
      { month: 'Nov 2026 (MTD)', amount: totalTransactionValue, volumeMT: totalSalesMT }
    ];

    const metrics: DashboardMetricsDTO = {
      totalTransactionValue,
      totalSalesMT,
      totalPurchaseOrders: db.purchaseOrders.length,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      activeBuyers,
      activeSellers,
      totalStockAvailableMT,
      totalBrokerageEarned,
      outstandingPayments,
      receivedPayments,
      pendingDispatches,
      monthlySalesTrend,
      categoryDistribution
    };

    return res.json({ success: true, metrics });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

import { Router, Request, Response } from 'express';
import * as XLSX from 'xlsx';
import { db } from '../db/inMemoryDb';
import { authenticateJWT, requireAdmin } from '../middleware/auth.middleware';

export const exportRouter = Router();

exportRouter.get('/admin/excel/:dataset', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const { dataset } = req.params;
    const wb = XLSX.utils.book_new();

    let data: any[] = [];
    let sheetName = 'Report';

    switch (dataset) {
      case 'buyers':
        sheetName = 'Registered Buyers';
        data = db.buyerProfiles.map(b => ({
          'Buyer ID': b.id,
          'Full Name': b.fullName,
          'Company Name': b.companyName,
          'Phone': b.phone,
          'City': b.city,
          'District': b.district,
          'State': b.state,
          'GSTIN': b.gstin || 'N/A',
          'PAN': b.panNumber || 'N/A',
          'Business Type': b.businessType,
          'Verified': b.isVerified ? 'YES' : 'NO',
          'Registered On': b.createdAt
        }));
        break;

      case 'sellers':
        sheetName = 'Registered Mills & Sellers';
        data = db.sellerProfiles.map(s => ({
          'Seller ID': s.id,
          'Full Name': s.fullName,
          'Company Name': s.companyName,
          'Mill Name': s.millName,
          'Phone': s.phone,
          'City': s.city,
          'District': s.district,
          'State': s.state,
          'GSTIN': s.gstin || 'N/A',
          'Capacity (MT/Day)': s.millCapacityMTPerDay || 0,
          'Verified': s.isVerified ? 'YES' : 'NO',
          'Registered On': s.createdAt
        }));
        break;

      case 'inventory':
        sheetName = 'Rice Stock Inventory';
        data = db.listings.map(l => {
          const seller = db.sellerProfiles.find(s => s.id === l.sellerId);
          return {
            'Listing Code': l.anonymousCode,
            'Rice Variety': l.variety,
            'Category': l.category,
            'Classification': l.classification,
            'Available (MT)': l.availableQuantityMT,
            'Price (₹/Qtl)': l.askingPricePerQuintal,
            'Brokerage Offered': l.brokerageOffered,
            'Grain Length (mm)': l.qualitySpecs.grainLengthMm,
            'Moisture (%)': l.qualitySpecs.moisturePercent,
            'Broken (%)': l.qualitySpecs.brokenPercent,
            'Whiteness': l.qualitySpecs.whiteness,
            'Seller Mill (Admin Only)': seller?.companyName || 'N/A',
            'Seller Phone (Admin Only)': seller?.phone || 'N/A',
            'Mill City': l.dispatchLocation,
            'State': l.generalizedState,
            'Status': l.status
          };
        });
        break;

      case 'orders':
      case 'brokerage':
        sheetName = 'Purchase Orders & Brokerage';
        data = db.purchaseOrders.map(p => ({
          'PO Number': p.poNumber,
          'Order Date': p.orderDate,
          'Rice Variety': p.riceVariety,
          'Category': p.riceCategory,
          'Quantity (MT)': p.quantityMT,
          'Rate (₹/Qtl)': p.agreedRatePerQuintal,
          'Total Goods Value (₹)': p.totalGoodsValue,
          'Brokerage Earned (₹)': p.brokerageAmount,
          'Brokerage Payee': p.brokeragePayee,
          'Buyer Company': p.buyerCompanyName,
          'Seller Mill': p.sellerCompanyName,
          'Status': p.status,
          'Delivery Location': p.deliveryLocation
        }));
        break;

      case 'payments':
        sheetName = 'Payment Records';
        data = db.payments.map(p => ({
          'Payment ID': p.id,
          'PO Number': p.poNumber,
          'Payment Type': p.paymentType,
          'Amount (₹)': p.amount,
          'Payer Role': p.payerRole,
          'Payer Name': p.payerName,
          'Method': p.method,
          'Reference Number': p.referenceNumber,
          'Date': p.paymentDate,
          'Verified by Admin': p.verifiedByAdmin ? 'YES' : 'NO',
          'Status': p.status
        }));
        break;

      case 'transport':
        sheetName = 'Logistics & Dispatch';
        data = db.transportRecords.map(t => ({
          'PO Number': t.poNumber,
          'Transporter': t.transporterName,
          'Vehicle Number': t.vehicleNumber,
          'Driver Name': t.driverName,
          'Driver Phone': t.driverPhone,
          'Bilty (LR) Number': t.biltyNumber,
          'E-Way Bill': t.ewayBillNumber || 'N/A',
          'Loading Location': t.loadingLocation,
          'Delivery Location': t.deliveryLocation,
          'Quantity (MT)': t.quantityLoadedMT,
          'Bags': t.bagCount,
          'Freight Charges (₹)': t.freightCharges,
          'Status': t.status
        }));
        break;

      default:
        return res.status(400).json({ success: false, error: `Invalid dataset: ${dataset}` });
    }

    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Pragyam_${dataset}_report_${Date.now()}.xlsx"`);
    return res.send(buffer);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import { db } from './mockDb';

const FIRM_INFO = {
  name: 'PRAGYAM ENTERPRISES',
  subtitle: 'RICE BROKERAGE & COMMODITY TRADING MANAGEMENT',
  pan: 'HSAPB2553Q',
  address: 'New Anaj Mandi, Tohana, Haryana - 125120, India',
  phone: '+91 98963 46337 / +91 94163 65869',
  email: 'pragyamenterprises1@gmail.com',
  bankName: 'Bank of Baroda, Tohana Branch',
  bankAccount: '53600100009068',
  bankIfsc: 'BARB0TOHANA',
  accountHolder: 'Nikhil Bansal / Pragyam Enterprises'
};

/**
 * Generates genuine native Excel (.xlsx) workbooks for any admin dataset
 */
export function generateExcelWorkbook(dataset: string): Buffer {
  const wb = XLSX.utils.book_new();
  let sheetData: any[] = [];
  let sheetName = 'Report';

  switch (dataset) {
    case 'orders': {
      sheetName = 'Purchase_Orders';
      sheetData = db.purchaseOrders.map(po => ({
        'PO Number': po.poNumber,
        'Order Date': new Date(po.createdAt || po.orderDate || Date.now()).toLocaleDateString('en-IN'),
        'Rice Commodity': po.riceVariety,
        'Category': po.riceCategory,
        'Quantity (MT)': po.quantityMT,
        'Quantity (Quintals)': po.quantityQuintals || po.quantityMT * 10,
        'Rate (INR/Qtl)': po.agreedRatePerQuintal,
        'Rate (INR/MT)': po.agreedRatePerMT || po.agreedRatePerQuintal * 10,
        'Total Goods Value (INR)': po.totalGoodsValue,
        'Brokerage (INR)': (po as any).brokerageAmount || (po as any).totalBrokerageAmount || 74000,
        'Brokerage Payee': po.brokeragePayee || 'BOTH_SPLIT',
        'Buyer Reference': 'Royal Feast Global Exporters Pvt Ltd',
        'Seller Mill Reference': 'Taraori Golden Rice Mills Ltd',
        'Dispatch Location': (po as any).dispatchLocation || 'Taraori Mill Depot, Karnal',
        'Delivery Location': po.deliveryLocation || 'Delhi Hub',
        'Payment Terms': po.paymentTerms || 'Standard Broker Escrow',
        'Order Status': po.status
      }));
      break;
    }

    case 'inventory': {
      sheetName = 'Rice_Stock_Inventory';
      sheetData = db.listings.map(l => ({
        'Stock Code': l.anonymousCode,
        'Rice Variety': l.variety,
        'Category': l.category,
        'Classification': l.classification,
        'Available Stock (MT)': l.availableQuantityMT,
        'Available (Quintals)': (l.availableQuantityMT || 0) * 10,
        'Asking Price (INR/Qtl)': l.askingPricePerQuintal,
        'Asking Price (INR/MT)': (l.askingPricePerQuintal || 0) * 10,
        'Grain Length (mm)': l.qualitySpecs?.grainLengthMm || 'N/A',
        'Moisture (%)': l.qualitySpecs?.moisturePercent || 'N/A',
        'Broken Grain (%)': l.qualitySpecs?.brokenPercent || 'N/A',
        'Optical Sortex': l.qualitySpecs?.sortex ? '100% Sortex Clean' : 'Standard',
        'Crop Year': l.cropYear || '2025-2026',
        'Packaging': l.packaging || 'PP_BAG_50KG',
        'Origin District': l.generalizedDistrict || 'Karnal',
        'Origin State': l.generalizedState || 'Haryana',
        'Listing Status': l.status
      }));
      break;
    }

    case 'buyers': {
      sheetName = 'Registered_Buyers';
      sheetData = db.buyerProfiles.map(b => ({
        'Buyer ID': b.id,
        'Company Name': b.companyName,
        'Contact Person': b.fullName,
        'Phone Number': b.phone,
        'Address': b.address,
        'City': b.city,
        'District': b.district,
        'State': b.state,
        'PIN Code': b.pinCode,
        'Business Type': b.businessType,
        'Verified Trader': b.isVerified ? 'YES (Verified)' : 'PENDING'
      }));
      break;
    }

    case 'sellers': {
      sheetName = 'Registered_Mills';
      sheetData = db.sellerProfiles.map(s => ({
        'Miller ID': s.id,
        'Mill Enterprise': s.millName || s.companyName,
        'Proprietor / Contact': s.fullName,
        'Phone Number': s.phone,
        'Address': s.address,
        'City': s.city,
        'District': s.district,
        'State': s.state,
        'PIN Code': s.pinCode,
        'Business Classification': s.businessType,
        'Verified Miller': s.isVerified ? 'YES (Verified)' : 'PENDING'
      }));
      break;
    }

    case 'payments': {
      sheetName = 'Escrow_Payments';
      sheetData = db.payments.map(p => ({
        'Payment ID': p.id,
        'PO Reference': (p as any).poNumber || 'PO-2026-9042',
        'Payment Type': p.paymentType,
        'Amount (INR)': p.amount,
        'Payer Role': p.payerRole,
        'Payment Method': (p as any).method || p.paymentMethod || 'RTGS Transfer',
        'Bank UTR / Ref': (p as any).referenceNumber || (p as any).paymentReference || 'RTGS-2026-881920',
        'Pragyam Escrow Status': p.status,
        'Verified By Central Desk': (p as any).verifiedByAdmin ? 'VERIFIED' : 'PENDING',
        'Date': new Date(p.createdAt || Date.now()).toLocaleDateString('en-IN')
      }));
      break;
    }

    case 'transport': {
      sheetName = 'Transport_Logistics';
      sheetData = db.transportRecords.map(t => ({
        'Logistics ID': t.id,
        'PO Number': (t as any).poNumber || 'PO-2026-9042',
        'Bilty (LR) Number': t.biltyNumber || 'LR-2026-8819',
        'Transporter Firm': t.transporterName || 'Karnal Golden Freight Carriers',
        'Vehicle Number': t.vehicleNumber || 'HR-05-AW-8921',
        'Driver Name': t.driverName || 'Gurpreet Singh',
        'Driver Contact': t.driverPhone || '+91 98120 44321',
        'Dispatch Origin': t.loadingLocation || 'Taraori Mill Depot',
        'Delivery Destination': t.unloadingLocation || 'Delhi Trading Hub',
        'Dispatched MT': t.loadedQuantityMT || 50,
        'Dispatch Date': new Date(t.dispatchDate || Date.now()).toLocaleDateString('en-IN'),
        'Transit Status': t.status
      }));
      break;
    }

    default: {
      sheetName = 'Pragyam_Summary';
      sheetData = [
        {
          'Report Name': dataset,
          'Generated At': new Date().toISOString(),
          'Issuing Desk': FIRM_INFO.name,
          'Head Office': FIRM_INFO.address
        }
      ];
    }
  }

  // Create worksheet from JSON
  const ws = XLSX.utils.json_to_sheet(sheetData);

  // Auto-fit column widths based on maximum string length
  if (sheetData.length > 0) {
    const colKeys = Object.keys(sheetData[0]);
    ws['!cols'] = colKeys.map(key => {
      let maxLen = key.length;
      sheetData.forEach(row => {
        const val = row[key];
        if (val !== null && val !== undefined) {
          const len = String(val).length;
          if (len > maxLen) maxLen = len;
        }
      });
      return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
    });
  }

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Generates an official, comprehensive Purchase Order PDF
 */
export function generatePurchaseOrderPdfBuffer(po: any, userRole: string = 'ADMIN'): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      // 1. Header & Brand Identity
      doc.rect(40, 36, 515, 4).fill('#0D3B2E');

      doc.fillColor('#0D3B2E').fontSize(20).text(FIRM_INFO.name, 40, 48, { bold: true } as any);
      doc.fillColor('#C5A059').fontSize(10).text(FIRM_INFO.subtitle, 40, 72);
      doc.fillColor('#64748B').fontSize(8.5).text(FIRM_INFO.address, 40, 87);
      doc.text(`PAN: ${FIRM_INFO.pan} | Contact: ${FIRM_INFO.phone} | Email: ${FIRM_INFO.email}`, 40, 99);

      doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(40, 115).lineTo(555, 115).stroke();

      // 2. PO Banner
      doc.rect(40, 125, 515, 28).fill('#0D3B2E');
      doc.fillColor('#FFFFFF').fontSize(12).text(`OFFICIAL PURCHASE ORDER: ${po.poNumber || 'PO-2026-9042'}`, 50, 133, { bold: true } as any);
      doc.fontSize(9.5).text(`Status: ${po.status || 'PO_ISSUED'}`, 430, 133);

      // 3. Meta Dates
      const orderDateStr = new Date(po.createdAt || po.orderDate || Date.now()).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      const deliveryDateStr = new Date(po.deliveryDeadline || po.expectedDispatchDate || Date.now() + 864000000).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      doc.fillColor('#1E293B').fontSize(9);
      doc.text(`Order Date: ${orderDateStr}`, 40, 162);
      doc.text(`Delivery Deadline: ${deliveryDateStr}`, 320, 162);

      // 4. Two-Column Trade Box
      doc.rect(40, 180, 250, 75).strokeColor('#CBD5E1').stroke();
      doc.rect(305, 180, 250, 75).strokeColor('#CBD5E1').stroke();

      doc.fillColor('#0D3B2E').fontSize(9).text('INTERMEDIARY BROKER:', 48, 188, { bold: true } as any);
      doc.fillColor('#334155').fontSize(8.5).text(FIRM_INFO.name, 48, 202);
      doc.text('New Anaj Mandi Central Desk, Tohana', 48, 214);
      doc.text(`Brokerage Terms: ₹${po.brokeragePerMT || 100}/MT (${po.brokeragePayee || 'MUTUAL_SPLIT'})`, 48, 226);

      doc.fillColor('#0D3B2E').fontSize(9).text('PURCHASER / BUYER (CONFIDENTIAL):', 313, 188, { bold: true } as any);
      doc.fillColor('#334155').fontSize(8.5).text(po.buyerCompanyName || 'Royal Feast Global Exporters Pvt Ltd', 313, 202);
      doc.text(`Delivery Location: ${po.deliveryLocation || 'Delhi Trading Hub'}`, 313, 214);
      doc.text('Contract Reference: PRG-AGRI-2026', 313, 226);

      // 5. Commodity Table Header
      doc.rect(40, 265, 515, 22).fill('#F1F5F9');
      doc.fillColor('#0F172A').fontSize(8.5).text('COMMODITY / VARIETY', 48, 272, { bold: true } as any);
      doc.text('CATEGORY', 180, 272, { bold: true } as any);
      doc.text('QUANTITY', 280, 272, { bold: true } as any);
      doc.text('RATE / QTL', 370, 272, { bold: true } as any);
      doc.text('TOTAL VALUE (INR)', 450, 272, { bold: true } as any);

      // 6. Commodity Row
      const qtyMT = Number(po.quantityMT) || 100;
      const rateQtl = Number(po.agreedRatePerQuintal) || 8150;
      const totalVal = po.totalGoodsValue || qtyMT * rateQtl * 10;

      doc.fillColor('#1E293B').fontSize(8.5);
      doc.text(po.riceVariety || '1121 Golden Sella Basmati', 48, 295);
      doc.text(po.riceCategory || 'EXPORT_PARBOILED', 180, 295);
      doc.text(`${qtyMT} MT (${qtyMT * 10} Qtl)`, 280, 295);
      doc.text(`₹${rateQtl.toLocaleString('en-IN')}`, 370, 295);
      doc.text(`₹${totalVal.toLocaleString('en-IN')}`, 450, 295);

      doc.strokeColor('#CBD5E1').lineWidth(0.5).moveTo(40, 315).lineTo(555, 315).stroke();

      // 7. Quality Specs Box
      doc.rect(40, 325, 515, 70).strokeColor('#CBD5E1').stroke();
      doc.fillColor('#0D3B2E').fontSize(9).text('MANDATORY AGMARK & TRADE QUALITY SPECIFICATIONS:', 48, 333, { bold: true } as any);
      doc.fillColor('#475569').fontSize(8);

      const q = po.qualitySpecs || {};
      doc.text(`- Grain Length: ${q.grainLengthMm || 8.35} mm`, 48, 349);
      doc.text(`- Whiteness (Kett): ${q.whiteness || 40.0}`, 48, 362);
      doc.text(`- Moisture: ${q.moisturePercent || 12.0}% (Max)`, 48, 375);

      doc.text(`- Broken Grain: ${q.brokenPercent || 1.0}% (Max)`, 220, 349);
      doc.text(`- Sortex: ${q.sortex !== false ? '100% Optical Sortex Clean' : 'Standard'}`, 220, 362);
      doc.text(`- Foreign Matter: 0.05% (Max)`, 220, 375);

      doc.text(`- Crop Year: ${q.cropYear || '2025-2026'}`, 390, 349);
      doc.text(`- Packaging: ${po.packaging || 'PP Bags 50 KG Net'}`, 390, 362);
      doc.text(`- Damaged / Discolored: 0.5% (Max)`, 390, 375);

      // 8. Commercial & Escrow Terms
      doc.fillColor('#0D3B2E').fontSize(9.5).text('COMMERCIAL & ESCROW SETTLEMENT TERMS:', 40, 410, { bold: true } as any);
      doc.fillColor('#334155').fontSize(8);
      doc.text(`1. Payment Terms: ${po.paymentTerms || '20% Advance against Escrow, 80% on Dispatch Bilty issuance.'}`, 40, 424);
      doc.text(`2. Dispatch Depot: ${po.dispatchLocation || 'Taraori Mill Depot, Karnal'}`, 40, 436);
      doc.text(`3. Escrow Account: ${FIRM_INFO.bankName} | A/C: ${FIRM_INFO.bankAccount} | IFSC: ${FIRM_INFO.bankIfsc}`, 40, 448);
      doc.text(`4. Intermediary Protection: Direct buyer-seller contact is prohibited. All dispatches monitored by Pragyam Desk.`, 40, 460);
      doc.text(`5. Legal Jurisdiction: Governed by Indian Arbitration Act. Subject to Tohana / Fatehabad, Haryana jurisdiction.`, 40, 472);

      // 9. Signatures Box
      doc.strokeColor('#CBD5E1').lineWidth(0.5).moveTo(40, 500).lineTo(555, 500).stroke();

      doc.fillColor('#64748B').fontSize(7.5);
      doc.text('This is a computer-generated, digitally verified commercial purchase order issued under', 40, 515);
      doc.text('the strict brokerage governance and intermediary trust standards of Pragyam Enterprises.', 40, 526);

      doc.fillColor('#0D3B2E').fontSize(9).text('For PRAGYAM ENTERPRISES', 390, 515, { bold: true } as any);
      doc.fillColor('#C5A059').fontSize(8).text('Nikhil Bansal (Proprietor)', 390, 528);
      doc.fillColor('#64748B').fontSize(7.5).text('Authorized Central Desk Signatory', 390, 540);

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Generates an official Brokerage Tax Invoice PDF
 */
export function generateInvoicePdfBuffer(invoice: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      // Header
      doc.rect(40, 36, 515, 4).fill('#0D3B2E');

      doc.fillColor('#0D3B2E').fontSize(20).text(FIRM_INFO.name, 40, 48, { bold: true } as any);
      doc.fillColor('#C5A059').fontSize(10).text('TAX INVOICE - BROKERAGE & INTERMEDIARY COMMISSION', 40, 72);
      doc.fillColor('#64748B').fontSize(8.5).text(FIRM_INFO.address, 40, 87);
      doc.text(`PAN: ${FIRM_INFO.pan} | Contact: ${FIRM_INFO.phone} | Email: ${FIRM_INFO.email}`, 40, 99);

      doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(40, 115).lineTo(555, 115).stroke();

      // Invoice Meta Banner
      doc.rect(40, 125, 515, 28).fill('#0D3B2E');
      doc.fillColor('#FFFFFF').fontSize(12).text(`INVOICE NO: ${invoice.invoiceNumber || 'PRG/INV/2026/042'}`, 50, 133, { bold: true } as any);
      const invDate = new Date(invoice.invoiceDate || invoice.createdAt || Date.now()).toLocaleDateString('en-IN');
      doc.fontSize(9.5).text(`Date: ${invDate}`, 430, 133);

      // Billed To
      doc.rect(40, 165, 515, 55).strokeColor('#CBD5E1').stroke();
      doc.fillColor('#0D3B2E').fontSize(9).text('BILLED TO (CLIENT):', 48, 173, { bold: true } as any);
      doc.fillColor('#1E293B').fontSize(9.5).text(invoice.clientName || 'Royal Feast Global Exporters Pvt Ltd', 48, 187, { bold: true } as any);
      doc.fillColor('#475569').fontSize(8.5).text(`Reference Purchase Order: ${invoice.poNumber || 'PO-2026-9042'}`, 48, 201);
      doc.text(`PAN Reference: HSAPB2553Q`, 330, 201);

      // Table Header
      doc.rect(40, 235, 515, 22).fill('#F1F5F9');
      doc.fillColor('#0F172A').fontSize(8.5).text('DESCRIPTION OF SERVICE', 48, 242, { bold: true } as any);
      doc.text('SAC CODE', 270, 242, { bold: true } as any);
      doc.text('TAXABLE VALUE (INR)', 410, 242, { bold: true } as any);

      // Table Row
      const taxable = Number(invoice.taxableAmount || invoice.brokerageAmount) || 37000;
      doc.fillColor('#1E293B').fontSize(8.5);
      doc.text('Agricultural Commodity & Rice Brokerage Intermediary Commission', 48, 267);
      doc.text(invoice.sacCode || invoice.hsnSacCode || '998319', 270, 267);
      doc.text(`₹${taxable.toLocaleString('en-IN')}`, 410, 267);

      doc.strokeColor('#CBD5E1').lineWidth(0.5).moveTo(40, 290).lineTo(555, 290).stroke();

      // Tax Breakdown
      doc.fontSize(8.5);
      let y = 305;
      const cgst = Number(invoice.cgstAmount) || 3330;
      const sgst = Number(invoice.sgstAmount) || 3330;
      const totalTax = cgst + sgst;
      const grandTotal = taxable + totalTax;

      doc.fillColor('#475569');
      doc.text('Central GST (CGST) @ 9.0%', 270, y);
      doc.text(`₹${cgst.toLocaleString('en-IN')}`, 410, y);
      y += 18;

      doc.text('State GST (SGST) @ 9.0%', 270, y);
      doc.text(`₹${sgst.toLocaleString('en-IN')}`, 410, y);
      y += 18;

      doc.strokeColor('#0D3B2E').lineWidth(1).moveTo(270, y).lineTo(555, y).stroke();
      y += 8;
      doc.fillColor('#0D3B2E').fontSize(11).text('GRAND TOTAL:', 270, y, { bold: true } as any);
      doc.text(`₹${grandTotal.toLocaleString('en-IN')}`, 410, y, { bold: true } as any);

      // Bank Details
      doc.rect(40, 385, 515, 65).strokeColor('#CBD5E1').stroke();
      doc.fillColor('#0D3B2E').fontSize(9).text('REMITTANCE BANK DETAILS:', 48, 393, { bold: true } as any);
      doc.fillColor('#334155').fontSize(8.5);
      doc.text(`Bank: ${FIRM_INFO.bankName}`, 48, 407);
      doc.text(`Account Name: ${FIRM_INFO.accountHolder}`, 48, 419);
      doc.text(`Account Number: ${FIRM_INFO.bankAccount} | IFSC: ${FIRM_INFO.bankIfsc}`, 48, 431);

      // Signatures
      doc.strokeColor('#CBD5E1').lineWidth(0.5).moveTo(40, 480).lineTo(555, 480).stroke();
      doc.fillColor('#64748B').fontSize(7.5);
      doc.text('Terms: Payment due within 7 days of invoice date. Subject to Tohana / Fatehabad (Haryana) Jurisdiction.', 40, 495);
      doc.text('This is an authenticated computer-generated brokerage invoice from Pragyam Enterprises.', 40, 506);

      doc.fillColor('#0D3B2E').fontSize(9).text('For PRAGYAM ENTERPRISES', 390, 495, { bold: true } as any);
      doc.fillColor('#64748B').fontSize(7.5).text('Authorized Signatory', 390, 515);

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

import * as XLSX from 'xlsx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
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

const COLOR_EMERALD = rgb(0.05, 0.23, 0.18);
const COLOR_GOLD = rgb(0.77, 0.63, 0.35);
const COLOR_DARK = rgb(0.12, 0.16, 0.23);
const COLOR_MUTED = rgb(0.39, 0.45, 0.55);
const COLOR_LIGHT_BG = rgb(0.95, 0.96, 0.98);
const COLOR_BORDER = rgb(0.80, 0.84, 0.88);
const COLOR_WHITE = rgb(1, 1, 1);

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
        'Order Date': new Date(po.createdAt || (po as any).orderDate || Date.now()).toLocaleDateString('en-IN'),
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

  const ws = XLSX.utils.json_to_sheet(sheetData);

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
 * Generates an official, comprehensive Purchase Order PDF via self-contained pdf-lib
 */
export async function generatePurchaseOrderPdfBuffer(po: any, userRole: string = 'ADMIN'): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([595.28, 841.89]); // A4 portrait

  // 1. Top Decorative Brand Bar
  page.drawRectangle({
    x: 40,
    y: 800,
    width: 515,
    height: 6,
    color: COLOR_EMERALD,
  });

  // 2. Company Brand Letterhead
  page.drawText(FIRM_INFO.name, {
    x: 40,
    y: 775,
    size: 20,
    font: fontBold,
    color: COLOR_EMERALD,
  });

  page.drawText(FIRM_INFO.subtitle, {
    x: 40,
    y: 758,
    size: 9.5,
    font: fontBold,
    color: COLOR_GOLD,
  });

  page.drawText(FIRM_INFO.address, {
    x: 40,
    y: 742,
    size: 8.5,
    font,
    color: COLOR_MUTED,
  });

  page.drawText(`PAN: ${FIRM_INFO.pan}   |   Contact: ${FIRM_INFO.phone}   |   Email: ${FIRM_INFO.email}`, {
    x: 40,
    y: 728,
    size: 8,
    font,
    color: COLOR_MUTED,
  });

  // Dividing line
  page.drawLine({
    start: { x: 40, y: 718 },
    end: { x: 555, y: 718 },
    thickness: 1,
    color: COLOR_BORDER,
  });

  // 3. Purchase Order Banner
  page.drawRectangle({
    x: 40,
    y: 678,
    width: 515,
    height: 30,
    color: COLOR_EMERALD,
  });

  page.drawText(`OFFICIAL PURCHASE ORDER: ${po.poNumber || 'PO-2026-9042'}`, {
    x: 52,
    y: 689,
    size: 11,
    font: fontBold,
    color: COLOR_WHITE,
  });

  page.drawText(`STATUS: ${po.status || 'CONFIRMED'}`, {
    x: 420,
    y: 689,
    size: 9.5,
    font: fontBold,
    color: COLOR_GOLD,
  });

  // 4. Meta Dates
  const orderDateStr = new Date(po.createdAt || (po as any).orderDate || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const deliveryDateStr = new Date(po.deliveryDeadline || po.expectedDispatchDate || Date.now() + 864000000).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  page.drawText(`Order Date: ${orderDateStr}`, { x: 40, y: 654, size: 9, font: fontBold, color: COLOR_DARK });
  page.drawText(`Expected Delivery: ${deliveryDateStr}`, { x: 340, y: 654, size: 9, font: fontBold, color: COLOR_DARK });

  // 5. Two Counterparty Boxes
  // Box 1: Intermediary
  page.drawRectangle({
    x: 40,
    y: 565,
    width: 250,
    height: 75,
    borderColor: COLOR_BORDER,
    borderWidth: 1,
    color: COLOR_LIGHT_BG,
  });
  page.drawText('INTERMEDIARY BROKER:', { x: 50, y: 625, size: 8.5, font: fontBold, color: COLOR_EMERALD });
  page.drawText('PRAGYAM ENTERPRISES (Central Desk)', { x: 50, y: 610, size: 8, font: fontBold, color: COLOR_DARK });
  page.drawText('New Anaj Mandi, Tohana Hub', { x: 50, y: 597, size: 8, font, color: COLOR_MUTED });
  page.drawText(`Brokerage: INR ${po.brokeragePerMT || 100}/MT (${po.brokeragePayee || 'MUTUAL_SPLIT'})`, { x: 50, y: 578, size: 8, font, color: COLOR_DARK });

  // Box 2: Counterparty
  page.drawRectangle({
    x: 305,
    y: 565,
    width: 250,
    height: 75,
    borderColor: COLOR_BORDER,
    borderWidth: 1,
    color: COLOR_LIGHT_BG,
  });
  page.drawText('BUYER / PURCHASER (CONFIDENTIAL):', { x: 315, y: 625, size: 8.5, font: fontBold, color: COLOR_EMERALD });
  page.drawText(po.buyerCompanyName || 'Royal Feast Global Exporters Pvt Ltd', { x: 315, y: 610, size: 8, font: fontBold, color: COLOR_DARK });
  page.drawText(`Destination: ${po.deliveryLocation || 'Delhi Trading Hub'}`, { x: 315, y: 597, size: 8, font, color: COLOR_MUTED });
  page.drawText('Contract Reference: PRG-AGRI-2026', { x: 315, y: 578, size: 8, font, color: COLOR_DARK });

  // 6. Commodity Details Table
  page.drawRectangle({
    x: 40,
    y: 525,
    width: 515,
    height: 24,
    color: rgb(0.90, 0.93, 0.96),
  });
  page.drawText('COMMODITY / VARIETY', { x: 48, y: 533, size: 8, font: fontBold, color: COLOR_DARK });
  page.drawText('CATEGORY', { x: 200, y: 533, size: 8, font: fontBold, color: COLOR_DARK });
  page.drawText('QUANTITY', { x: 295, y: 533, size: 8, font: fontBold, color: COLOR_DARK });
  page.drawText('RATE / QTL', { x: 390, y: 533, size: 8, font: fontBold, color: COLOR_DARK });
  page.drawText('TOTAL VALUE (INR)', { x: 460, y: 533, size: 8, font: fontBold, color: COLOR_DARK });

  const qtyMT = Number(po.quantityMT) || 100;
  const rateQtl = Number(po.agreedRatePerQuintal) || 8150;
  const totalVal = po.totalGoodsValue || qtyMT * rateQtl * 10;

  page.drawText(po.riceVariety || '1121 Golden Sella Basmati', { x: 48, y: 506, size: 8.5, font: fontBold, color: COLOR_DARK });
  page.drawText(po.riceCategory || 'EXPORT GRADE', { x: 200, y: 506, size: 8, font, color: COLOR_DARK });
  page.drawText(`${qtyMT} MT (${qtyMT * 10} Qtl)`, { x: 295, y: 506, size: 8, font, color: COLOR_DARK });
  page.drawText(`INR ${rateQtl.toLocaleString('en-IN')}`, { x: 390, y: 506, size: 8, font, color: COLOR_DARK });
  page.drawText(`INR ${totalVal.toLocaleString('en-IN')}`, { x: 460, y: 506, size: 8.5, font: fontBold, color: COLOR_DARK });

  page.drawLine({
    start: { x: 40, y: 494 },
    end: { x: 555, y: 494 },
    thickness: 0.5,
    color: COLOR_BORDER,
  });

  // 7. Quality Specs Box
  page.drawRectangle({
    x: 40,
    y: 405,
    width: 515,
    height: 75,
    borderColor: COLOR_BORDER,
    borderWidth: 1,
    color: rgb(0.98, 0.99, 1),
  });
  page.drawText('AGMARK & TRADE QUALITY SPECIFICATIONS:', { x: 50, y: 465, size: 8.5, font: fontBold, color: COLOR_EMERALD });
  const q = po.qualitySpecs || {};
  page.drawText(`- Average Grain Length: ${q.grainLengthMm || 8.35} mm`, { x: 50, y: 448, size: 8, font, color: COLOR_DARK });
  page.drawText(`- Whiteness (Kett): ${q.whiteness || 40.0}`, { x: 50, y: 434, size: 8, font, color: COLOR_DARK });
  page.drawText(`- Moisture Content: ${q.moisturePercent || 12.0}% (Max)`, { x: 50, y: 420, size: 8, font, color: COLOR_DARK });

  page.drawText(`- Broken Grain: ${q.brokenPercent || 1.0}% (Max)`, { x: 220, y: 448, size: 8, font, color: COLOR_DARK });
  page.drawText(`- Optical Sortex: ${q.sortex !== false ? '100% Sortex Clean' : 'Standard'}`, { x: 220, y: 434, size: 8, font, color: COLOR_DARK });
  page.drawText(`- Foreign Matter: 0.05% (Max)`, { x: 220, y: 420, size: 8, font, color: COLOR_DARK });

  page.drawText(`- Crop Year: ${q.cropYear || '2025-2026'}`, { x: 390, y: 448, size: 8, font, color: COLOR_DARK });
  page.drawText(`- Packaging: ${po.packaging || 'PP Bags 50 KG Net'}`, { x: 390, y: 434, size: 8, font, color: COLOR_DARK });
  page.drawText(`- Damaged / Discolored: 0.5% (Max)`, { x: 390, y: 420, size: 8, font, color: COLOR_DARK });

  // 8. Commercial & Escrow Terms
  page.drawText('COMMERCIAL & ESCROW SETTLEMENT TERMS:', { x: 40, y: 382, size: 9, font: fontBold, color: COLOR_EMERALD });
  page.drawText(`1. Payment Terms: ${po.paymentTerms || '20% Advance against Escrow, 80% on Dispatch Bilty issuance.'}`, { x: 40, y: 366, size: 8, font, color: COLOR_DARK });
  page.drawText(`2. Dispatch Depot: ${po.dispatchLocation || 'Taraori Mill Depot, Karnal'}`, { x: 40, y: 353, size: 8, font, color: COLOR_DARK });
  page.drawText(`3. Escrow Account: ${FIRM_INFO.bankName} | A/C: ${FIRM_INFO.bankAccount} | IFSC: ${FIRM_INFO.bankIfsc}`, { x: 40, y: 340, size: 8, font, color: COLOR_DARK });
  page.drawText('4. Trade Protection: Absolute confidentiality mandatory. Direct buyer-seller trade communication is strictly prohibited.', { x: 40, y: 327, size: 8, font, color: COLOR_DARK });
  page.drawText('5. Legal Jurisdiction: Subject to Tohana / Fatehabad (Haryana) Jurisdiction.', { x: 40, y: 314, size: 8, font, color: COLOR_DARK });

  // 9. Signatures
  page.drawLine({
    start: { x: 40, y: 285 },
    end: { x: 555, y: 285 },
    thickness: 0.5,
    color: COLOR_BORDER,
  });

  page.drawText('This is an authenticated computer-generated commercial contract issued under', { x: 40, y: 268, size: 7.5, font, color: COLOR_MUTED });
  page.drawText('the strict brokerage governance and intermediary trust standards of Pragyam Enterprises.', { x: 40, y: 256, size: 7.5, font, color: COLOR_MUTED });

  page.drawText('For PRAGYAM ENTERPRISES', { x: 390, y: 268, size: 8.5, font: fontBold, color: COLOR_EMERALD });
  page.drawText('Nikhil Bansal (Proprietor)', { x: 390, y: 254, size: 8, font, color: COLOR_GOLD });
  page.drawText('Authorized Central Desk Signatory', { x: 390, y: 242, size: 7.5, font, color: COLOR_MUTED });

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Generates an official Brokerage Tax Invoice PDF via self-contained pdf-lib
 */
export async function generateInvoicePdfBuffer(invoice: any): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([595.28, 841.89]);

  // Brand Bar
  page.drawRectangle({ x: 40, y: 800, width: 515, height: 6, color: COLOR_EMERALD });

  page.drawText(FIRM_INFO.name, { x: 40, y: 775, size: 20, font: fontBold, color: COLOR_EMERALD });
  page.drawText('OFFICIAL COMMISSION BILL & BROKERAGE INVOICE', { x: 40, y: 758, size: 9.5, font: fontBold, color: COLOR_GOLD });
  page.drawText(FIRM_INFO.address, { x: 40, y: 742, size: 8.5, font, color: COLOR_MUTED });
  page.drawText(`Income Tax PAN: ${FIRM_INFO.pan}   |   Contact: ${FIRM_INFO.phone}   |   Email: ${FIRM_INFO.email}`, { x: 40, y: 728, size: 8, font, color: COLOR_MUTED });

  page.drawLine({ start: { x: 40, y: 718 }, end: { x: 555, y: 718 }, thickness: 1, color: COLOR_BORDER });

  // Banner
  page.drawRectangle({ x: 40, y: 678, width: 515, height: 30, color: COLOR_EMERALD });
  page.drawText(`INVOICE NO: ${invoice.invoiceNumber || 'PRG/INV/2026/042'}`, { x: 52, y: 689, size: 11, font: fontBold, color: COLOR_WHITE });
  const invDate = new Date(invoice.invoiceDate || invoice.createdAt || Date.now()).toLocaleDateString('en-IN');
  page.drawText(`Date: ${invDate}`, { x: 440, y: 689, size: 9.5, font: fontBold, color: COLOR_GOLD });

  // Billed To Box
  page.drawRectangle({ x: 40, y: 605, width: 515, height: 58, borderColor: COLOR_BORDER, borderWidth: 1, color: COLOR_LIGHT_BG });
  page.drawText('BILLED TO (COMMERCIAL COUNTERPARTY):', { x: 50, y: 648, size: 8.5, font: fontBold, color: COLOR_EMERALD });
  page.drawText(invoice.clientName || 'Royal Feast Global Exporters Pvt Ltd', { x: 50, y: 633, size: 9, font: fontBold, color: COLOR_DARK });
  page.drawText(`Reference Purchase Order: ${invoice.poNumber || 'PO-2026-9042'}`, { x: 50, y: 618, size: 8, font, color: COLOR_MUTED });
  page.drawText(`PAN: ${FIRM_INFO.pan} (Commercial Commission Agency)`, { x: 310, y: 618, size: 8, font, color: COLOR_MUTED });

  // Table Header
  page.drawRectangle({ x: 40, y: 560, width: 515, height: 24, color: rgb(0.90, 0.93, 0.96) });
  page.drawText('DESCRIPTION OF BROKERAGE SERVICE', { x: 48, y: 568, size: 8, font: fontBold, color: COLOR_DARK });
  page.drawText('SAC / COMMODITY', { x: 300, y: 568, size: 8, font: fontBold, color: COLOR_DARK });
  page.drawText('BROKERAGE FEE (INR)', { x: 420, y: 568, size: 8, font: fontBold, color: COLOR_DARK });

  // Table Row
  const brokerageTotal = Number(invoice.taxableAmount || invoice.brokerageAmount) || 37000;
  page.drawText('Agricultural Paddy/Rice Brokerage & Trade Mediation Commission', { x: 48, y: 540, size: 8, font, color: COLOR_DARK });
  page.drawText('SAC 998319 (Paddy/Rice)', { x: 300, y: 540, size: 8, font, color: COLOR_DARK });
  page.drawText(`INR ${brokerageTotal.toLocaleString('en-IN')}`, { x: 420, y: 540, size: 8.5, font: fontBold, color: COLOR_DARK });

  page.drawLine({ start: { x: 40, y: 526 }, end: { x: 555, y: 526 }, thickness: 0.5, color: COLOR_BORDER });

  // Tax Breakdown (Zero GST as requested)
  page.drawText('Brokerage Commission Fee:', { x: 280, y: 505, size: 8, font, color: COLOR_MUTED });
  page.drawText(`INR ${brokerageTotal.toLocaleString('en-IN')}`, { x: 440, y: 505, size: 8, font, color: COLOR_DARK });

  page.drawText('Goods & Services Tax (GST):', { x: 280, y: 488, size: 8, font, color: COLOR_MUTED });
  page.drawText('NIL / Non-GST Entity', { x: 440, y: 488, size: 8, font: fontBold, color: COLOR_EMERALD });

  page.drawLine({ start: { x: 280, y: 476 }, end: { x: 555, y: 476 }, thickness: 1, color: COLOR_EMERALD });
  page.drawText('TOTAL PAYABLE:', { x: 280, y: 460, size: 10, font: fontBold, color: COLOR_EMERALD });
  page.drawText(`INR ${brokerageTotal.toLocaleString('en-IN')}`, { x: 440, y: 460, size: 10, font: fontBold, color: COLOR_EMERALD });

  // Bank Remittance
  page.drawRectangle({ x: 40, y: 380, width: 515, height: 60, borderColor: COLOR_BORDER, borderWidth: 1, color: COLOR_LIGHT_BG });
  page.drawText('REMITTANCE BANK DETAILS:', { x: 50, y: 425, size: 8.5, font: fontBold, color: COLOR_EMERALD });
  page.drawText(`Bank: ${FIRM_INFO.bankName}   |   Account Name: ${FIRM_INFO.accountHolder}`, { x: 50, y: 408, size: 8, font, color: COLOR_DARK });
  page.drawText(`Account Number: ${FIRM_INFO.bankAccount}   |   IFSC: ${FIRM_INFO.bankIfsc}`, { x: 50, y: 394, size: 8, font: fontBold, color: COLOR_DARK });

  // Signatures
  page.drawLine({ start: { x: 40, y: 345 }, end: { x: 555, y: 345 }, thickness: 0.5, color: COLOR_BORDER });
  page.drawText('Terms: Payment due within 7 days of invoice date. Subject to Tohana / Fatehabad (Haryana) Jurisdiction.', { x: 40, y: 330, size: 7.5, font, color: COLOR_MUTED });
  page.drawText('For PRAGYAM ENTERPRISES', { x: 390, y: 330, size: 8.5, font: fontBold, color: COLOR_EMERALD });
  page.drawText('Authorized Central Desk Signatory', { x: 390, y: 316, size: 7.5, font, color: COLOR_MUTED });

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}

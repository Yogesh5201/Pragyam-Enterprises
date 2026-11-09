import PDFDocument from 'pdfkit';
import { PurchaseOrderDTO, InvoiceDTO } from '@pragyam/types';
import { ENV } from '../config/env';

/**
 * Generates a clean, branded PDF Purchase Order for Pragyam Enterprises
 */
export function generatePurchaseOrderPdf(
  po: PurchaseOrderDTO,
  userRole: 'ADMIN' | 'BUYER' | 'SELLER'
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', err => reject(err));

    // Header Branding
    doc.fillColor('#0D3B2E').fontSize(22).text('PRAGYAM ENTERPRISES', 40, 40, { bold: true } as any);
    doc.fillColor('#C5A059').fontSize(11).text('RICE BROKERAGE & COMMODITY TRADING MANAGEMENT', 40, 68);
    doc.fillColor('#64748B').fontSize(9).text(ENV.COMPANY_ADDRESS, 40, 84);
    doc.text(`GSTIN: ${ENV.COMPANY_GSTIN} | Contact: ${ENV.COMPANY_PHONE} | Email: ${ENV.COMPANY_EMAIL}`, 40, 96);

    doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(40, 115).lineTo(555, 115).stroke();

    // PO Title Banner
    doc.rect(40, 125, 515, 30).fill('#0D3B2E');
    doc.fillColor('#FFFFFF').fontSize(13).text(`OFFICIAL PURCHASE ORDER: ${po.poNumber}`, 50, 134, { bold: true } as any);
    doc.fontSize(10).text(`Status: ${po.status}`, 420, 134);

    // Order Overview
    doc.fillColor('#1E293B').fontSize(10);
    const dateFormatted = new Date(po.orderDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    doc.text(`Order Date: ${dateFormatted}`, 40, 170);
    doc.text(`Expected Delivery Date: ${new Date(po.deliveryDate).toLocaleDateString('en-IN')}`, 40, 185);

    // Parties Box
    doc.rect(40, 205, 250, 85).strokeColor('#E2E8F0').stroke();
    doc.rect(305, 205, 250, 85).strokeColor('#E2E8F0').stroke();

    doc.fillColor('#0D3B2E').fontSize(10).text('ISSUED THROUGH BROKER:', 48, 212, { bold: true } as any);
    doc.fillColor('#334155').fontSize(9).text('PRAGYAM ENTERPRISES (Central Brokerage Desk)', 48, 226);
    doc.text(`New Anaj Mandi, Tohana, Haryana Hub`, 48, 238);
    doc.text(`Transaction Reference: PO-${po.poNumber}`, 48, 250);

    if (userRole === 'ADMIN') {
      doc.fillColor('#0D3B2E').fontSize(10).text('BUYER & SELLER CONFIDENTIAL RECORDS:', 313, 212, { bold: true } as any);
      doc.fillColor('#334155').fontSize(9).text(`Buyer: ${po.buyerCompanyName || 'Authorized Buyer'}`, 313, 226);
      doc.text(`Seller Mill: ${po.sellerCompanyName || 'Authorized Mill'}`, 313, 238);
      doc.text(`Brokerage Earned: ₹${po.brokerageAmount?.toLocaleString('en-IN')} (${po.brokeragePayee})`, 313, 250);
    } else if (userRole === 'BUYER') {
      doc.fillColor('#0D3B2E').fontSize(10).text('PURCHASER / BUYER:', 313, 212, { bold: true } as any);
      doc.fillColor('#334155').fontSize(9).text(`${po.buyerCompanyName || 'Authorized Buyer'}`, 313, 226);
      doc.text(`Delivery Location: ${po.deliveryLocation}`, 313, 238);
      doc.text(`Intermediary Supplier: Pragyam Verified Supply Network`, 313, 250);
    } else {
      // SELLER
      doc.fillColor('#0D3B2E').fontSize(10).text('SUPPLIER / MILL:', 313, 212, { bold: true } as any);
      doc.fillColor('#334155').fontSize(9).text(`${po.sellerCompanyName || 'Authorized Mill'}`, 313, 226);
      doc.text(`Dispatch Origin: ${po.dispatchLocation}`, 313, 238);
      doc.text(`Commission Due to Broker: ₹${po.brokerageAmount?.toLocaleString('en-IN')}`, 313, 250);
    }

    // Commodity Details Table
    doc.rect(40, 305, 515, 25).fill('#F1F5F9');
    doc.fillColor('#0F172A').fontSize(9).text('COMMODITY / VARIETY', 48, 313, { bold: true } as any);
    doc.text('CATEGORY', 210, 313, { bold: true } as any);
    doc.text('QUANTITY', 320, 313, { bold: true } as any);
    doc.text('RATE / QTL', 400, 313, { bold: true } as any);
    doc.text('TOTAL (₹)', 480, 313, { bold: true } as any);

    doc.fillColor('#1E293B').fontSize(9);
    doc.text(po.riceVariety, 48, 338);
    doc.text(po.riceCategory, 210, 338);
    doc.text(`${po.quantityMT} MT (${po.quantityQuintals} Qtl)`, 320, 338);
    doc.text(`₹${po.agreedRatePerQuintal?.toLocaleString('en-IN')}`, 400, 338);
    doc.text(`₹${po.totalGoodsValue?.toLocaleString('en-IN')}`, 480, 338);

    doc.strokeColor('#CBD5E1').lineWidth(0.5).moveTo(40, 355).lineTo(555, 355).stroke();

    // Quality Specifications Box
    doc.rect(40, 370, 515, 75).strokeColor('#E2E8F0').stroke();
    doc.fillColor('#0D3B2E').fontSize(9).text('AGREED RICE QUALITY SPECIFICATIONS:', 48, 378, { bold: true } as any);
    doc.fillColor('#475569').fontSize(8.5);
    const q = po.qualitySpecs;
    doc.text(`- Average Grain Length: ${q.grainLengthMm} mm`, 48, 394);
    doc.text(`- Whiteness (Kett): ${q.whiteness}`, 48, 408);
    doc.text(`- Moisture: ${q.moisturePercent}% (Max)`, 48, 422);

    doc.text(`- Broken Grain: ${q.brokenPercent}% (Max)`, 220, 394);
    doc.text(`- Foreign Matter: ${q.foreignMatterPercent}%`, 220, 408);
    doc.text(`- Damaged / Discolored: ${q.damagedGrainPercent}%`, 220, 422);

    doc.text(`- Optical Sortex: ${q.sortex ? '100% Sortex Clean' : 'Standard'}`, 400, 394);
    doc.text(`- Packaging: ${po.packaging}`, 400, 408);
    doc.text(`- Crop Year: ${q.cropYear}`, 400, 422);

    // Commercial Terms & Instructions
    doc.fillColor('#0D3B2E').fontSize(10).text('COMMERCIAL & DISPATCH TERMS:', 40, 460, { bold: true } as any);
    doc.fillColor('#334155').fontSize(8.5);
    doc.text(`1. Payment Terms: ${po.paymentTerms}`, 40, 476);
    doc.text(`2. Dispatch Location: ${po.dispatchLocation}`, 40, 490);
    doc.text(`3. Delivery Location: ${po.deliveryLocation}`, 40, 504);
    doc.text(`4. Special Notes: ${po.specialInstructions || 'Strict compliance to quality standards.'}`, 40, 518);
    doc.text(`5. Brokerage: Governed by Pragyam Enterprises brokerage terms. Absolute confidentiality mandatory.`, 40, 532);

    // Signatures
    doc.strokeColor('#CBD5E1').lineWidth(0.5).moveTo(40, 580).lineTo(555, 580).stroke();

    doc.fillColor('#64748B').fontSize(8);
    doc.text('This is a computer-generated, digitally confirmed commercial purchase order.', 40, 600);
    doc.text('Issued by Pragyam Enterprises - Authorised Brokerage Desk.', 40, 612);

    doc.fillColor('#0D3B2E').fontSize(9).text('For PRAGYAM ENTERPRISES', 400, 600, { bold: true } as any);
    doc.fillColor('#64748B').fontSize(8).text('Authorized Commercial Signatory', 400, 630);

    doc.end();
  });
}

/**
 * Generates an official GST Brokerage Tax Invoice PDF
 */
export function generateInvoicePdf(invoice: InvoiceDTO): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', err => reject(err));

    // Header
    doc.fillColor('#0D3B2E').fontSize(22).text('PRAGYAM ENTERPRISES', 40, 40, { bold: true } as any);
    doc.fillColor('#C5A059').fontSize(11).text('TAX INVOICE - BROKERAGE SERVICES', 40, 68);
    doc.fillColor('#64748B').fontSize(9).text(`${ENV.COMPANY_ADDRESS} | GSTIN: ${ENV.COMPANY_GSTIN}`, 40, 84);

    doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(40, 105).lineTo(555, 105).stroke();

    // Invoice Meta
    doc.rect(40, 115, 515, 30).fill('#0D3B2E');
    doc.fillColor('#FFFFFF').fontSize(11).text(`TAX INVOICE NO: ${invoice.invoiceNumber}`, 50, 124, { bold: true } as any);
    doc.fontSize(10).text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}`, 430, 124);

    // Bill To
    doc.rect(40, 160, 515, 60).strokeColor('#E2E8F0').stroke();
    doc.fillColor('#0D3B2E').fontSize(9).text('BILLED TO (CLIENT):', 48, 168, { bold: true } as any);
    doc.fillColor('#1E293B').fontSize(10).text(invoice.clientName, 48, 182, { bold: true } as any);
    doc.fillColor('#475569').fontSize(9).text(`Client GSTIN: ${invoice.clientGstin || 'Unregistered / Exempt'}`, 48, 196);
    doc.text(`Reference Purchase Order: ${invoice.poNumber}`, 320, 182);

    // Table
    doc.rect(40, 235, 515, 25).fill('#F1F5F9');
    doc.fillColor('#0F172A').fontSize(9).text('DESCRIPTION OF SERVICE', 48, 243, { bold: true } as any);
    doc.text('SAC CODE', 270, 243, { bold: true } as any);
    doc.text('TAXABLE VALUE (₹)', 420, 243, { bold: true } as any);

    doc.fillColor('#1E293B').fontSize(9);
    doc.text('Rice Brokerage & Agricultural Commodity Intermediary Commission', 48, 268);
    doc.text(invoice.hsnSacCode, 270, 268);
    doc.text(`₹${invoice.taxableAmount?.toLocaleString('en-IN')}`, 420, 268);

    doc.strokeColor('#CBD5E1').lineWidth(0.5).moveTo(40, 285).lineTo(555, 285).stroke();

    // Tax Details
    doc.fontSize(9);
    let y = 300;
    if (invoice.igstPercent > 0) {
      doc.text(`Integrated GST (IGST) @ ${invoice.igstPercent}%`, 270, y);
      doc.text(`₹${invoice.igstAmount?.toLocaleString('en-IN')}`, 420, y);
      y += 20;
    } else {
      doc.text(`Central GST (CGST) @ ${invoice.cgstPercent}%`, 270, y);
      doc.text(`₹${invoice.cgstAmount?.toLocaleString('en-IN')}`, 420, y);
      y += 20;
      doc.text(`State GST (SGST) @ ${invoice.sgstPercent}%`, 270, y);
      doc.text(`₹${invoice.sgstAmount?.toLocaleString('en-IN')}`, 420, y);
      y += 20;
    }

    doc.strokeColor('#0D3B2E').lineWidth(1).moveTo(270, y).lineTo(555, y).stroke();
    y += 10;
    doc.fillColor('#0D3B2E').fontSize(11).text('GRAND TOTAL:', 270, y, { bold: true } as any);
    doc.text(`₹${invoice.grandTotal?.toLocaleString('en-IN')}`, 420, y, { bold: true } as any);

    // Footer
    doc.fillColor('#64748B').fontSize(8.5).text('Bank Account: Nikhil Bansal / Pragyam Enterprises | Bank of Baroda, Tohana Branch | IFSC: BARB0TOHANA | A/C: 53600100009068', 40, 450);
    doc.text('Terms: Payment due within 7 days of invoice date. Subject to Tohana / Fatehabad, Haryana Jurisdiction.', 40, 465);

    doc.end();
  });
}

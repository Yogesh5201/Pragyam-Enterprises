import { Router, Request, Response } from 'express';
import { db } from '../db/inMemoryDb';
import { UserRole, InvoiceDTO } from '@pragyam/types';
import { calculateGst } from '@pragyam/shared';
import { authenticateJWT, requireAdmin } from '../middleware/auth.middleware';
import { generateInvoicePdf } from '../services/pdf.service';
import { ENV } from '../config/env';

export const invoicesRouter = Router();

// ==========================================
// 1. ADMIN: GET ALL INVOICES
// ==========================================
invoicesRouter.get('/admin/all', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      count: db.invoices.length,
      invoices: db.invoices
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. CLIENT: GET OWN INVOICES
// ==========================================
invoicesRouter.get('/my-invoices', authenticateJWT, (req: Request, res: Response) => {
  try {
    let clientName = '';
    if (req.user?.role === UserRole.SELLER) {
      const seller = db.sellerProfiles.find(s => s.userId === req.user?.userId);
      clientName = seller?.companyName || '';
    } else if (req.user?.role === UserRole.BUYER) {
      const buyer = db.buyerProfiles.find(b => b.userId === req.user?.userId);
      clientName = buyer?.companyName || '';
    }

    const myInvoices = db.invoices.filter(i =>
      i.clientName.toLowerCase() === clientName.toLowerCase()
    );

    return res.json({
      success: true,
      count: myInvoices.length,
      invoices: myInvoices
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. ADMIN: GENERATE TAX INVOICE FOR A PO
// ==========================================
invoicesRouter.post('/admin/generate', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const { poId, invoiceType, taxableAmount, clientState, customRate } = req.body;
    const po = db.purchaseOrders.find(p => p.id === poId);
    if (!po) {
      return res.status(404).json({ success: false, error: 'Purchase Order not found' });
    }

    const seller = db.sellerProfiles.find(s => s.id === po.sellerId);
    const buyer = db.buyerProfiles.find(b => b.id === po.buyerId);

    const client = po.brokeragePayee === 'BUYER' ? buyer : seller;
    const amount = taxableAmount ? Number(taxableAmount) : po.brokerageAmount;
    const recipientState = clientState || client?.state || 'Haryana';

    const gst = calculateGst(amount, 'Haryana', recipientState, customRate || 18);

    const invoiceCount = db.invoices.length + 1;
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-PE-${year}-${String(invoiceCount).padStart(4, '0')}`;

    const newInvoice: InvoiceDTO = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      invoiceType: invoiceType || 'BROKERAGE_INVOICE',
      poId: po.id,
      poNumber: po.poNumber,
      issuerName: ENV.COMPANY_NAME,
      issuerGstin: ENV.COMPANY_GSTIN,
      clientName: client?.companyName || 'Valued Trade Partner',
      clientGstin: client?.gstin || '',
      taxableAmount: gst.taxableAmount,
      cgstPercent: gst.cgstPercent,
      cgstAmount: gst.cgstAmount,
      sgstPercent: gst.sgstPercent,
      sgstAmount: gst.sgstAmount,
      igstPercent: gst.igstPercent,
      igstAmount: gst.igstAmount,
      totalTax: gst.totalTax,
      grandTotal: gst.grandTotal,
      hsnSacCode: '998319',
      invoiceDate: new Date().toISOString(),
      pdfUrl: `/api/invoices/inv-${Date.now()}/pdf`
    };

    db.invoices.unshift(newInvoice);

    db.logAudit(
      req.user!.userId,
      UserRole.SUPER_ADMIN,
      'GENERATE_INVOICE',
      'INVOICE',
      newInvoice.id,
      `GST Tax Invoice ${newInvoice.invoiceNumber} created for PO ${po.poNumber}. Total ₹${newInvoice.grandTotal.toLocaleString('en-IN')}`,
      req.ip
    );

    return res.status(201).json({
      success: true,
      message: 'GST Tax invoice generated successfully',
      invoice: newInvoice
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. DOWNLOAD INVOICE PDF
// ==========================================
invoicesRouter.get('/:id/pdf', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const invoice = db.invoices.find(i => i.id === req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    const pdfBuffer = await generateInvoicePdf(invoice);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

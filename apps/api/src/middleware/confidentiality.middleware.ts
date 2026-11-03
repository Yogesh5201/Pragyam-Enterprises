import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@pragyam/types';

// Sensitive keys that must NEVER be leaked to Buyer or Seller
const SELLER_CONFIDENTIAL_KEYS = [
  'sellerId',
  'sellerFullName',
  'sellerCompanyName',
  'sellerPhone',
  'sellerEmail',
  'sellerGstin',
  'sellerPan',
  'millName',
  'millLocation',
  'millCapacityMTPerDay',
  'brokerageOffered',
  'notes'
];

const BUYER_CONFIDENTIAL_KEYS = [
  'buyerId',
  'buyerName',
  'buyerCompanyName',
  'buyerPhone',
  'buyerEmail',
  'buyerGstin',
  'buyerPan',
  'deliveryPinCode'
];

export function confidentialityResponseInterceptor(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json;

  res.json = function (body: any) {
    if (!req.user || req.user.role === UserRole.SUPER_ADMIN) {
      // Admin is authorized to see complete operational information
      return originalJson.call(this, body);
    }

    if (body && typeof body === 'object') {
      const sanitized = deepSanitize(body, req.user.role);
      return originalJson.call(this, sanitized);
    }

    return originalJson.call(this, body);
  };

  next();
}

function deepSanitize(obj: any, role: UserRole): any {
  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item, role));
  }

  if (obj !== null && typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      if (role === UserRole.BUYER && SELLER_CONFIDENTIAL_KEYS.includes(key)) {
        continue; // Strip seller confidential keys
      }
      if (role === UserRole.SELLER && BUYER_CONFIDENTIAL_KEYS.includes(key)) {
        continue; // Strip buyer confidential keys
      }
      cleaned[key] = deepSanitize(obj[key], role);
    }
    return cleaned;
  }

  return obj;
}

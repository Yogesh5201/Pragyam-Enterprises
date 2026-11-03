import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { UserRole } from '@pragyam/types';
import { db } from '../db/inMemoryDb';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
  profileId?: string;
  companyName?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token required'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as any;
    
    // Find profileId if available
    let profileId: string | undefined;
    let companyName: string | undefined;

    if (payload.role === UserRole.BUYER) {
      const p = db.buyerProfiles.find(b => b.userId === payload.userId);
      profileId = p?.id;
      companyName = p?.companyName;
    } else if (payload.role === UserRole.SELLER) {
      const p = db.sellerProfiles.find(s => s.userId === payload.userId);
      profileId = p?.id;
      companyName = p?.companyName;
    }

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      profileId,
      companyName
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token'
    });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      // Audit security violation
      db.logAudit(
        req.user.userId,
        req.user.role,
        'UNAUTHORIZED_ACCESS_ATTEMPT',
        'SECURITY_GATE',
        req.path,
        `User with role ${req.user.role} attempted to access restricted endpoint requiring [${roles.join(', ')}]`,
        req.ip
      );

      return res.status(403).json({
        success: false,
        error: 'Forbidden: Insufficient privileges for this operation'
      });
    }

    next();
  };
}

export const requireAdmin = requireRole(UserRole.SUPER_ADMIN);
export const requireBuyer = requireRole(UserRole.BUYER);
export const requireSeller = requireRole(UserRole.SELLER);

import { Router, Request, Response } from 'express';
import { db } from '../db/inMemoryDb';
import { UserRole, UserStatus } from '@pragyam/types';
import { authenticateJWT, requireAdmin } from '../middleware/auth.middleware';

export const usersRouter = Router();

// ==========================================
// 1. GET ALL BUYERS (ADMIN)
// ==========================================
usersRouter.get('/admin/buyers', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const buyers = db.buyerProfiles.map(b => {
      const user = db.users.find(u => u.id === b.userId);
      return {
        ...b,
        email: user?.email,
        status: user?.status,
        userCreatedAt: user?.createdAt
      };
    });
    return res.json({ success: true, count: buyers.length, buyers });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. GET ALL SELLERS (ADMIN)
// ==========================================
usersRouter.get('/admin/sellers', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const sellers = db.sellerProfiles.map(s => {
      const user = db.users.find(u => u.id === s.userId);
      return {
        ...s,
        email: user?.email,
        status: user?.status,
        userCreatedAt: user?.createdAt
      };
    });
    return res.json({ success: true, count: sellers.length, sellers });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. ADMIN: UPDATE USER STATUS (ACTIVE, SUSPENDED, BLOCKED)
// ==========================================
usersRouter.put('/admin/:userId/status', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const user = db.users.find(u => u.id === req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { status } = req.body;
    if (!status || !Object.values(UserStatus).includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid user status' });
    }

    user.status = status;
    user.updatedAt = new Date().toISOString();

    db.logAudit(
      req.user!.userId,
      UserRole.SUPER_ADMIN,
      'UPDATE_USER_STATUS',
      'USER',
      user.id,
      `Admin changed user ${user.email} status to ${user.status}`,
      req.ip
    );

    return res.json({ success: true, message: `User status changed to ${user.status}`, user });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. ADMIN: VERIFY / APPROVE PROFILE
// ==========================================
usersRouter.put('/admin/verify-profile/:profileId', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const { profileType } = req.body; // 'BUYER' or 'SELLER'
    let verified = false;

    if (profileType === 'SELLER') {
      const s = db.sellerProfiles.find(p => p.id === req.params.profileId);
      if (s) {
        s.isVerified = true;
        s.updatedAt = new Date().toISOString();
        verified = true;
      }
    } else {
      const b = db.buyerProfiles.find(p => p.id === req.params.profileId);
      if (b) {
        b.isVerified = true;
        b.updatedAt = new Date().toISOString();
        verified = true;
      }
    }

    if (!verified) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    db.logAudit(
      req.user!.userId,
      UserRole.SUPER_ADMIN,
      'VERIFY_PROFILE',
      profileType,
      req.params.profileId,
      `Admin verified credentials and approved profile ${req.params.profileId}`,
      req.ip
    );

    return res.json({ success: true, message: 'Profile verified and approved successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

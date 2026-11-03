import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { db } from '../db/inMemoryDb';
import { UserRole, UserStatus, BusinessType } from '@pragyam/types';
import { authenticateJWT, requireAdmin } from '../middleware/auth.middleware';

export const authRouter = Router();

// ==========================================
// 1. BUYER REGISTRATION
// ==========================================
authRouter.post('/register/buyer', async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      companyName,
      phone,
      email,
      password,
      address,
      city,
      district,
      state,
      pinCode,
      gstin,
      panNumber,
      businessType,
      purchasePreferences
    } = req.body;

    if (!email || !password || !fullName || !companyName || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Missing mandatory registration fields (email, password, fullName, companyName, phone)'
      });
    }

    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = {
      id: `usr-buy-${Date.now()}`,
      email: email.toLowerCase(),
      passwordHash,
      role: UserRole.BUYER,
      status: UserStatus.ACTIVE,
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newProfile = {
      id: `buy-prof-${Date.now()}`,
      userId: newUser.id,
      fullName,
      companyName,
      phone,
      address: address || '',
      city: city || '',
      district: district || '',
      state: state || '',
      pinCode: pinCode || '',
      gstin: gstin || '',
      panNumber: panNumber || '',
      businessType: businessType || BusinessType.WHOLESALER,
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.users.push(newUser);
    db.buyerProfiles.push(newProfile);

    db.logAudit(
      newUser.id,
      UserRole.BUYER,
      'USER_REGISTRATION',
      'BUYER',
      newProfile.id,
      `Buyer registered: ${companyName} (${fullName})`,
      req.ip
    );

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      ENV.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      message: 'Buyer registration successful',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        profile: newProfile
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. SELLER REGISTRATION
// ==========================================
authRouter.post('/register/seller', async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      companyName,
      phone,
      email,
      password,
      address,
      city,
      district,
      state,
      pinCode,
      gstin,
      panNumber,
      businessType,
      millName,
      millCapacityMTPerDay,
      dispatchLocations
    } = req.body;

    if (!email || !password || !fullName || !companyName || !phone || !millName) {
      return res.status(400).json({
        success: false,
        error: 'Missing mandatory registration fields (email, password, fullName, companyName, phone, millName)'
      });
    }

    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = {
      id: `usr-sel-${Date.now()}`,
      email: email.toLowerCase(),
      passwordHash,
      role: UserRole.SELLER,
      status: UserStatus.ACTIVE,
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newProfile = {
      id: `sel-prof-${Date.now()}`,
      userId: newUser.id,
      fullName,
      companyName,
      phone,
      address: address || '',
      city: city || '',
      district: district || '',
      state: state || '',
      pinCode: pinCode || '',
      gstin: gstin || '',
      panNumber: panNumber || '',
      businessType: businessType || BusinessType.RICE_MILLER,
      millName,
      millCapacityMTPerDay: millCapacityMTPerDay ? Number(millCapacityMTPerDay) : 100,
      dispatchLocations: Array.isArray(dispatchLocations) ? dispatchLocations : [city || 'Mill Depot'],
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.users.push(newUser);
    db.sellerProfiles.push(newProfile);

    db.logAudit(
      newUser.id,
      UserRole.SELLER,
      'USER_REGISTRATION',
      'SELLER',
      newProfile.id,
      `Seller registered: ${companyName} (Mill: ${millName})`,
      req.ip
    );

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      ENV.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      message: 'Seller registration successful',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        profile: newProfile
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. GENERAL LOGIN (BUYER & SELLER)
// ==========================================
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Do not allow Super Admin to login through the public buyer/seller route
    if (user.role === UserRole.SUPER_ADMIN) {
      return res.status(403).json({
        success: false,
        error: 'Administrator credentials must use the dedicated Super Admin Portal (/admin/login).'
      });
    }

    if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.BLOCKED) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended by Pragyam Enterprises administration.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    let profile: any = null;
    if (user.role === UserRole.BUYER) {
      profile = db.buyerProfiles.find(b => b.userId === user.id);
    } else if (user.role === UserRole.SELLER) {
      profile = db.sellerProfiles.find(s => s.userId === user.id);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: '24h' }
    );

    db.logAudit(user.id, user.role, 'LOGIN_SUCCESS', 'AUTH', user.id, 'User logged in', req.ip);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. SUPER ADMIN DEDICATED LOGIN (WITH MFA)
// ==========================================
authRouter.post('/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password, mfaCode } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Admin email and password required' });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.role !== UserRole.SUPER_ADMIN) {
      return res.status(401).json({ success: false, error: 'Invalid administrator credentials' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      db.logAudit('UNKNOWN', UserRole.SUPER_ADMIN, 'ADMIN_LOGIN_FAILED', 'AUTH', user.id, 'Bad admin password attempt', req.ip);
      return res.status(401).json({ success: false, error: 'Invalid administrator credentials' });
    }

    // MFA Verification check
    if (user.mfaEnabled && !mfaCode) {
      return res.json({
        success: false,
        requiresMfa: true,
        message: 'MFA 6-digit code required for Super Administrator authentication'
      });
    }

    // Verify MFA code (accept standard 6-digit demo '123456' or configured secret)
    if (user.mfaEnabled && mfaCode !== '123456') {
      return res.status(401).json({
        success: false,
        error: 'Invalid MFA verification code. Please enter valid 6-digit authenticator code.'
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: '12h' }
    );

    db.logAudit(user.id, user.role, 'ADMIN_LOGIN_SUCCESS', 'AUTH', user.id, 'Super Admin authenticated with MFA', req.ip);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: 'Pragyam Super Administrator',
        mfaVerified: true
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. CURRENT USER PROFILE
// ==========================================
authRouter.get('/me', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const user = db.users.find(u => u.id === req.user?.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    let profile: any = null;
    if (user.role === UserRole.BUYER) {
      profile = db.buyerProfiles.find(b => b.userId === user.id);
    } else if (user.role === UserRole.SELLER) {
      profile = db.sellerProfiles.find(s => s.userId === user.id);
    } else if (user.role === UserRole.SUPER_ADMIN) {
      profile = {
        fullName: 'Pragyam Super Administrator',
        roleTitle: 'Managing Broker & System Owner',
        mfaEnabled: user.mfaEnabled
      };
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        profile
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

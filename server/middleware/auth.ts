import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, type IUser } from '../models/User.ts';
import { isDbConnected } from '../config/db.ts';
import { memoryStore, type StoreUser } from '../config/store.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'recovery_tribe_secure_secret_2026';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no authentication token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    let user: any = null;

    if (isDbConnected()) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = memoryStore.users.find(u => u._id === decoded.id || u.email === decoded.email);
    }

    if (!user) {
      res.status(401).json({ message: 'User belonging to this token no longer exists' });
      return;
    }

    if (user.isSuspended) {
      res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Error]', (error as Error).message);
    res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Administrator privileges required' });
  }
};

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
      let user: any = null;
      if (isDbConnected()) {
        user = await User.findById(decoded.id).select('-password');
      } else {
        user = memoryStore.users.find(u => u._id === decoded.id || u.email === decoded.email);
      }
      if (user && !user.isSuspended) {
        req.user = user;
      }
    } catch {
      // Continue without user
    }
  }

  next();
};

export function generateToken(id: string, email: string): string {
  return jwt.sign({ id, email }, JWT_SECRET, {
    expiresIn: '30d',
  });
}

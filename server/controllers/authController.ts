import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.ts';
import { isDbConnected } from '../config/db.ts';
import { memoryStore, type StoreUser } from '../config/store.ts';
import { generateToken, type AuthRequest } from '../middleware/auth.ts';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, sobrietyDate } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Please provide name, email, and password' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const today = new Date().toISOString().slice(0, 10);
    const username = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') + Math.floor(100 + Math.random() * 900);

    if (isDbConnected()) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        res.status(400).json({ message: 'An account with this email already exists' });
        return;
      }

      const user = await User.create({
        name: name.trim(),
        username,
        email: cleanEmail,
        password,
        sobrietyDate: sobrietyDate || today,
        challengeStartDate: today,
        pledgedToday: today,
        role: cleanEmail === 'raghuldass43@gmail.com' ? 'admin' : 'user',
      });

      const token = generateToken(user._id.toString(), user.email);
      res.status(201).json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          bio: user.bio,
          avatar: user.avatar,
          sobrietyDate: user.sobrietyDate,
          role: user.role,
          followersCount: user.followers.length,
          followingCount: user.following.length,
          createdAt: user.createdAt,
        },
      });
      return;
    }

    // In-Memory store handling
    const existing = memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      res.status(400).json({ message: 'An account with this email already exists' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newId = '650000000000' + Math.random().toString(16).slice(2, 14).padEnd(12, '0');

    const newUser: StoreUser = {
      _id: newId,
      name: name.trim(),
      username,
      email: cleanEmail,
      password: hashedPassword,
      bio: '',
      avatar: '',
      sobrietyDate: sobrietyDate || today,
      challengeStartDate: today,
      pledgedToday: today,
      role: cleanEmail === 'raghuldass43@gmail.com' ? 'admin' : 'user',
      followers: [],
      following: [],
      blocked: [],
      isSuspended: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.users.push(newUser);
    const token = generateToken(newId, cleanEmail);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        bio: newUser.bio,
        avatar: newUser.avatar,
        sobrietyDate: newUser.sobrietyDate,
        role: newUser.role,
        followersCount: 0,
        followingCount: 0,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({ message: (error as Error).message || 'Registration failed' });
  }
};

// @desc    Login user with email and password
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isDbConnected()) {
      const user = await User.findOne({ email: cleanEmail }).select('+password');

      if (!user) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
      }

      if (user.isSuspended) {
        res.status(403).json({ message: 'Account is suspended. Contact admin.' });
        return;
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
      }

      const token = generateToken(user._id.toString(), user.email);

      res.status(200).json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          bio: user.bio,
          avatar: user.avatar,
          sobrietyDate: user.sobrietyDate,
          role: user.role,
          followersCount: user.followers.length,
          followingCount: user.following.length,
          createdAt: user.createdAt,
        },
      });
      return;
    }

    // In-memory fallback
    const memUser = memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!memUser) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    if (memUser.isSuspended) {
      res.status(403).json({ message: 'Account is suspended. Contact admin.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, memUser.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = generateToken(memUser._id, memUser.email);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: memUser._id,
        name: memUser.name,
        username: memUser.username,
        email: memUser.email,
        bio: memUser.bio,
        avatar: memUser.avatar,
        sobrietyDate: memUser.sobrietyDate,
        role: memUser.role,
        followersCount: memUser.followers.length,
        followingCount: memUser.following.length,
        createdAt: memUser.createdAt,
      },
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ message: (error as Error).message || 'Login failed' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (isDbConnected()) {
      const user = await User.findById(req.user._id).select('-password');
      res.status(200).json({ success: true, user });
      return;
    }

    const memUser = memoryStore.users.find(u => u._id === req.user._id.toString() || u.email === req.user.email);
    if (!memUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { password: _, ...clean } = memUser;
    res.status(200).json({ success: true, user: clean });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

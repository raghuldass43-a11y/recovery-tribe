import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('[DB] No MONGODB_URI specified in environment. Running with high-performance persistent in-memory MongoDB store.');
    isConnected = false;
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[DB] Connected to MongoDB Atlas / Server: ${conn.connection.host}`);
    isConnected = true;
    return true;
  } catch (error) {
    console.warn('[DB] Could not connect to external MongoDB cluster. Fallback store active.', (error as Error).message);
    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}

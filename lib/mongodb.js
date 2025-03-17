import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('لطفاً متغیر MONGODB_URI را در فایل .env تنظیم کنید');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

// برای اتصال به دیتابیس در API routes
export async function connectDB() {
  try {
    if (client) {
      return client;
    }
    client = new MongoClient(uri, options);
    return await client.connect();
  } catch (error) {
    console.error('خطا در اتصال به دیتابیس:', error);
    throw error;
  }
} 
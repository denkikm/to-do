import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('لطفاً متغیر MONGODB_URI را در فایل .env تنظیم کنید');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

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
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://parhamkmbta:NrsbbxCirrSlQzRP@cluster0.lwghd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function testConnection() {
  try {
    console.log('در حال اتصال به دیتابیس...');
    await mongoose.connect(MONGODB_URI);
    console.log('اتصال به MongoDB Atlas با موفقیت برقرار شد!');
    
    // ایجاد یک مدل تست
    const TestModel = mongoose.model('Test', new mongoose.Schema({
      name: String,
      date: { type: Date, default: Date.now }
    }));
    
    // ایجاد یک داده تست
    const testData = new TestModel({ name: 'تست اتصال' });
    await testData.save();
    console.log('داده تست با موفقیت ذخیره شد!');
    
    // خواندن داده تست
    const savedData = await TestModel.findOne({ name: 'تست اتصال' });
    console.log('داده ذخیره شده:', savedData);
    
    // پاک کردن داده تست
    await TestModel.deleteOne({ name: 'تست اتصال' });
    console.log('داده تست پاک شد!');
    
    await mongoose.disconnect();
    console.log('اتصال به دیتابیس بسته شد.');
  } catch (error) {
    console.error('خطا در اتصال به دیتابیس:', error);
  }
}

testConnection(); 
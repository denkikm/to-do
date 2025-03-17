const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://parhamkmbta:NrsbbxCirrSlQzRP@cluster0.lwghd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// تعریف مدل Todo
const TodoSchema = new mongoose.Schema({
  title: String,
  description: String,
  completed: { type: Boolean, default: false },
  dueDate: Date,
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
  userId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Todo = mongoose.models.Todo || mongoose.model('Todo', TodoSchema);

async function testTodo() {
  try {
    console.log('در حال اتصال به دیتابیس...');
    await mongoose.connect(MONGODB_URI);
    console.log('اتصال به MongoDB Atlas با موفقیت برقرار شد!');
    
    // ایجاد یک تسک جدید
    const newTodo = new Todo({
      title: 'تست ایجاد تسک جدید',
      description: 'این یک تسک تستی است',
      priority: 'HIGH',
      userId: 'test-user-1',
      dueDate: new Date('2024-03-20')
    });
    
    await newTodo.save();
    console.log('تسک جدید با موفقیت ایجاد شد:', newTodo);
    
    // خواندن همه تسک‌ها
    const allTodos = await Todo.find();
    console.log('\nلیست همه تسک‌ها:', allTodos);
    
    // پاک کردن تسک تستی
    await Todo.deleteOne({ _id: newTodo._id });
    console.log('\nتسک تستی پاک شد!');
    
    await mongoose.disconnect();
    console.log('اتصال به دیتابیس بسته شد.');
  } catch (error) {
    console.error('خطا:', error);
  }
}

testTodo(); 
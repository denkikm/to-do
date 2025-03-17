import mongoose from 'mongoose';

const TodoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'لطفاً عنوان را وارد کنید'],
    maxlength: [100, 'عنوان نمی‌تواند بیشتر از 100 کاراکتر باشد']
  },
  description: {
    type: String,
    maxlength: [500, 'توضیحات نمی‌تواند بیشتر از 500 کاراکتر باشد']
  },
  completed: {
    type: Boolean,
    default: false
  },
  dueDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  },
  category: {
    type: String
  },
  tags: [{
    type: String
  }],
  reminder: {
    type: Date
  },
  userId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Todo || mongoose.model('Todo', TodoSchema); 
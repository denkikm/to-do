import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'عنوان تسک الزامی است'],
    trim: true,
  },
  description: {
    type: String,
    maxlength: [500, 'توضیحات نمی‌تواند بیشتر از 500 کاراکتر باشد']
  },
  completed: {
    type: Boolean,
    default: false,
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
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Todo || mongoose.model('Todo', todoSchema); 
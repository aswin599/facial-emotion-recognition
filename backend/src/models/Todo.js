const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

todoSchema.index({ userId: 1, createdAt: -1 });

const Todo = mongoose.model('Todo', todoSchema);
module.exports = Todo;

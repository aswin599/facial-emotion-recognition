const Todo = require('../models/Todo');

const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user._id })
      .sort({ completed: 1, createdAt: -1 });

    return res.json({ success: true, data: todos });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createTodo = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const todo = new Todo({
      userId: req.user._id,
      title: title.trim(),
    });

    await todo.save();

    return res.status(201).json({ success: true, data: todo });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateTodo = async (req, res) => {
  try {
    const { todoId } = req.params;
    const updates = {};

    if (req.body.title !== undefined) {
      if (!req.body.title || !req.body.title.trim()) {
        return res.status(400).json({ success: false, message: 'Title cannot be empty' });
      }
      updates.title = req.body.title.trim();
    }

    if (req.body.completed !== undefined) {
      updates.completed = req.body.completed;
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: todoId, userId: req.user._id },
      updates,
      { new: true }
    );

    if (!todo) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.json({ success: true, data: todo });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const { todoId } = req.params;
    const todo = await Todo.findOneAndDelete({ _id: todoId, userId: req.user._id });

    if (!todo) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
};

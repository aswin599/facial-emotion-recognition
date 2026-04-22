const express = require('express');
const { body, param } = require('express-validator');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} = require('../controllers/todoController');

const router = express.Router();

const todoCreateValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
];

const todoUpdateValidation = [
  param('todoId').isMongoId().withMessage('Invalid task ID'),
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('completed')
    .optional()
    .isBoolean().withMessage('Completed must be boolean'),
];

const todoDeleteValidation = [
  param('todoId').isMongoId().withMessage('Invalid task ID'),
];

router.get('/', auth, getTodos);
router.post('/', auth, todoCreateValidation, validate, createTodo);
router.put('/:todoId', auth, todoUpdateValidation, validate, updateTodo);
router.delete('/:todoId', auth, todoDeleteValidation, validate, deleteTodo);

module.exports = router;

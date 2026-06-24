const { body, validationResult } = require('express-validator');

const taskValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium or high'),

  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done']).withMessage('Invalid status')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { taskValidator, validate };
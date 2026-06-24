const { body, validationResult } = require('express-validator');

const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required'),

  body('email')
    .trim()
    .isEmail().withMessage('Please enter a valid email'),

  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidator = [
  body('email')
    .trim()
    .isEmail().withMessage('Please enter a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { registerValidator, loginValidator, validate };
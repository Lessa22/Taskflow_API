const { body, validationResult } = require('express-validator');

const projectValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { projectValidator, validate };
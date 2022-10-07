const { body } = require('express-validator');

module.exports = () => [
  body('title')
    .trim()
    .isLength({min: 1, max: 50})
    .withMessage('Title is required and must be at most 50 characters long')
    .escape(),
  body('body')
    .trim()
    .isLength({max: 1000})
    .withMessage('Post body must be at most 1000 characters long')
    .escape()
];

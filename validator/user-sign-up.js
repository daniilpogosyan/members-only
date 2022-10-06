const { body } = require('express-validator');
const User = require('../models/user');

// Validation chain applied to data from sign-up-form
module.exports = () => [
  body('username')
    .trim()
    .escape()
    .normalizeEmail()
    .isEmail()
    .withMessage('Email address must be in the correct format like: mycoolemail@somemail.com')
    .custom((val, {req}) => {
      return User
      .findOne({username: req.body.username})
      .exec()
      .catch((err) => {
        // Error while checking
          return Promise.reject('Error occured on checking username')
      })
      .then((user) => {
        // Check if username is in use already
        if (user) {
          return Promise.reject('Email is already in use')
        }

        // Username is not in use
        return true
      })
    }),
  body('password')
    .trim()
    .isLength({min: 3, max: 20})
    .withMessage('Password must be 3-20 characters long')
    .escape(),
  body('passwordConfirmation')
    .custom((val, { req }) => val === req.body.password)
    .withMessage('Passwords do not match'),
  body('firstName')
    .isAlpha()
    .withMessage('First name must contain letters, spaces and apostrophes')
    .isLength({min: 1, max: 50})
    .withMessage('First name must contain between 1 and 50 characters'),
  body('lastName')
    .isAlpha()
    .withMessage('Last name must contain letters, spaces and apostrophes')
    .isLength({min: 1, max: 50})
    .withMessage('Last name must contain between 1 and 50 characters')
]

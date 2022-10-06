var express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

var router = express.Router();

const validator = require('../validator');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Get Sign up form
router.get('/sign-up', (req, res, next) => {
  res.render('sign-up-form', { title: "Sign up" });
});

// Create user 
router.post('/sign-up',
  validator.user.signup(),
  async (req, res, next) => {
    // get errors occured on validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('sign-up-form', {
        title: 'Sign up',
        errors: errors.array()
      });
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await (bcrypt.hash(req.body.password, salt));
      await User.create({...req.body, passwordHash});
    } catch(err) {
      return next(err);
    }
    res.redirect('/');
  }
);

router.get('/login', (req, res, next) => {
  res.render('login-form', {
    title: 'Log in'
  });
});

module.exports = router;

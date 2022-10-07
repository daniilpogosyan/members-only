var express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const passport = require('passport');

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
  validator.signup(),
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

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  successRedirect: '/',
}))

router.get('/logout', (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err)
    }
  });

  res.redirect('/');
})

router.get('/join', (req, res, next) => {
  if (req.user) {
    res.render('join-form', {
      title: 'Join the club'
    });
    return;
  }
  res.redirect('/login');
});

router.post('/join',
  validator.join(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('join-form', {
        title: 'Join the club',
        password: req.body.password,
        errors: errors.array()
      });
      return;
    }

    if (req.user) {
      User
      .findByIdAndUpdate(req.user.id, { status: 'member' })
      .exec((err, user) => {
        if(err) {
          return next(err)
        }
        if (user === null) {
          const err = new Error('User not found');
          err.status = 404;
          return next(err);
        }
        res.redirect('/');
      });
      return;
    }
    res.redirect('/');
  }
)

module.exports = router;

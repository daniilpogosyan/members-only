var express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Post = require('../models/post');
const passport = require('passport');

var router = express.Router();

const validator = require('../validator');

/* GET home page. */
router.get('/', function(req, res, next) {
  Post.find().populate('author', 'firstName lastName').exec((err, posts) => {
    if (err) {
      return next(err);
    }
    res.render('index', {
      title: 'Posts',
      posts
     });
  })
  
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

router.post('/new-post',
  validator.post(),
  (req, res, next) => {
    if (req.user.status !== 'member') {
      const err = new Error('Permission denied. You are not a member of the club.');
      err.status = 403;
      return next(err);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('index', {
        title: 'Posts',
        states: { showForm: true },
        postTitle: req.body.title,
        body: req.body.body,
        errors: errors.array()
      })
      return;
    }
    Post.create({
      title: req.body.title,
      body: req.body.body,
      author: req.user._id
    }, (err, post) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    })
    
  }

)

router.get('/become-admin', (req, res, next) => {
  res.render('join-form', {
    title: 'Become admin'
  })
});

router.post('/become-admin',
  validator.becomeAdmin(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('join-form', {
        title: 'Become admin',
        password: req.body.password,
        errors: errors.array()
      })
      return;
    }
    if (req.user) {
      User
      .findByIdAndUpdate(req.user.id, { status: 'admin' })
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

router.post('/delete-post/:id', (req, res, next) => {
  if (req.user?.status !== 'admin') {
    const err = new Error('Permission denied. Cannot delete a post');
    err.status = 403;
    return next(err);
  }
  Post.findByIdAndDelete(req.params.id, (err) => {
    if (err) {
      return next(err)
    }
    res.redirect('/');
  })
})


module.exports = router;

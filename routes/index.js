var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Get Sign up form
router.get('/sign-up', (req, res, next) => {
  res.render('sign-up-form', { title: "Sign up" });
});

module.exports = router;

require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcryptjs = require('bcryptjs');

const User = require('./models/user');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: process.env.SESSION_SECRET,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  resave: false,
  saveUninitialized: true
}));


const strategy = new LocalStrategy((username, password, done) => {
  User.findOne({username: username}).exec((err, user) => {
    if (err) {
      return done(err);
    }

    if (user === null) {
      return done(null, false, { message: 'Incorrect username or password' });
    }

    if (bcryptjs.compare(password, user.passwordHash)) {
      return done(null, user);
    }

    return done(null, false, { message: 'Incorrect username or password' });
  })
})

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id).exec((err, user) => {
    done(err, user);
  });
});
app.use(passport.initialize());
app.use(passport.session());
passport.use(strategy);


app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

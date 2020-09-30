require("dotenv").config(); // Allows us to read the variables contained in the .env file.
require("./config/dbConnection");
require("./helpers/hbs-helpers");

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const hbs = require("hbs");
const mongoose = require("mongoose");
const session = require("express-session"); // Etablishes a session (cookie) between client and server
const MongoStore = require("connect-mongo")(session); // Create a mongostore with the session object
const indexRouter = require("./routes/index");
const flash = require("connect-flash");


var usersRouter = require('./routes/users');
var tagsRouter = require("./routes/tags");
var categoriesRouter = require("./routes/categories");
var authRouter = require("./routes/auth");
var recipesRouter = require("./routes/recipes");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, "views/partials"));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {},
  })
); // Creates a session object, gives a cookie to client that the client sends back on every request
app.use(flash());

app.use(function (req, res, next) {
  res.locals.error_message = req.flash("error");
  res.locals.success_message = req.flash("success");
  next();
});

app.use(function (req, res, next) {
  if (req.session.currentUser) {
    res.locals.isLoggedIn = true;
    res.locals.isAdmin = req.session.currentUser.role === "admin";
    res.locals.isUser = req.session.currentUser.role === "user";
    res.locals.userId = req.session.currentUser._id;
    res.locals.avatar = req.session.currentUser.avatar;
    res.locals.username = req.session.currentUser.username;
  } else {
    res.locals.isLoggedIn = false;
    res.locals.username = null;
    res.locals.isAdmin = false;
    res.locals.isUser = false;
    res.locals.avatar = null;
    res.locals.userId = null;
  }
  next();
});

app.use(function (req, res, next) {
  console.log(req.session);
  console.log(req.session.flash);
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/tags', tagsRouter);
app.use('/categories', categoriesRouter);
app.use('/auth', authRouter);
app.use('/recipes', recipesRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
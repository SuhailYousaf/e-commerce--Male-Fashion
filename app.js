const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const db = require('./config/connection');
const mathHelpers = require('./helpers/mathHelpers');
const hbs = require('express-handlebars');
const handlebars = require('handlebars');
// const slugify = require('slugify');
require('dotenv').config();
const nocache = require('nocache');
handlebars.registerHelper(mathHelpers);
const app = express();
app.use(nocache());
app.use(session({
  secret: 'your secret key',
  cookie: { maxAge: 600000 },
  resave: false,
  saveUninitialized: false
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
db.connect((err) => {
  if (err) {
    console.log('Connection Error: ', err);
    process.exit(1); // Exit with failure status code
  } else {
    console.log("Database connected to port 27017");
  }
});
app.use('/', userRouter);
app.use('/admin', adminRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
app.use(function(err, req, res, next) {
  if (err.status === 404) {
    res.status(404).send('Not Found');
  } else {
    // Handle other errors
  }
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


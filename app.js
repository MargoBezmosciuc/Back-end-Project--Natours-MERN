const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();
//////////////////////////////1) GLOBAL Middleware
///Set Security HTTP Headers
app.use(helmet());

/// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Limit requests from the same IP
const limiter = rateLimit({
  max: 100, //how many requests, renew after each save
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter); //apply limiter only for /api router

///Body parser, reading data from the body into req.body
app.use(
  express.json({
    limit: '10kb',
  })
);
// Data sanitization against NoSQL query injection
app.use(mongoSanitize()); // filter out all of the dollar signs and dots

//Data sanitization against XSS(cross-site scripting attacks)
app.use(xss()); //any user input from malicious HTML code

//Prevent parameter pollution -> is to clear up the query string
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//Serving Static files
app.use(express.static(`${__dirname}/public`)); // working for static files. img/html

//Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});
///////////////////////////////////////////////3)Routs
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/review', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server !`));
});

app.use(globalErrorHandler);

module.exports = app;

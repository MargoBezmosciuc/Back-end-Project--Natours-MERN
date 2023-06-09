const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
//////////////////////////////1) Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json()); // middleware
app.use(express.static(`${__dirname}/public`)); // working for static files. img/html

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
///////////////////////////////////////////////3)Routs
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server !`));
});

app.use(globalErrorHandler);

module.exports = app;

const express = require('express');
const morgan = require('morgan');

const app = express();

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
//////////////////////////////1) Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json()); // middleware
app.use(express.static(`${__dirname}/public`)); // working for static files. img/html
app.use((req, res, next) => {
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
///////////////////////////////////////////////3)Routs
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;

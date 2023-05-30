const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tours muss have a name'], // validator
    unique: true,
    trim: true,
  },
  duration: { type: Number, required: [true, 'A Tour must have a duration'] },
  maxGroupSize: {
    type: Number,
    required: [true, 'A Tour must have a Group Size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A Tour must have a difficulty'],
  },
  ratingAverage: { type: Number, default: 4.5 },
  ratingQuantity: { type: Number, default: 0 },
  price: { type: Number, required: [true, 'A tours muss have a price '] },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    required: [true, 'A Tour must have a Description'],
  },
  description: { type: String, trim: true },
  imageCover: {
    type: String,
    required: [true, 'A Tour must have a cover image'],
  },
  images: [String],
  createdAt: { type: Date, default: Date.now(), select: false },
  startDates: [Date],
});
const Tour = mongoose.model('Tour', tourSchema); //creating a model based on the schema

module.exports = Tour;

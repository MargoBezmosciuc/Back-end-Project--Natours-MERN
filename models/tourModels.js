const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], // validator
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal to 40 characters'],
      minlength: [10, 'A tour name must have more or equal to 10 characters'],
      // validate: [validator.isAlpha, 'Tour name musst only contain characters'],
    },

    slug: String,
    duration: { type: Number, required: [true, 'A Tour must have a duration'] },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have a Group Size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either:easy,medium,difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      // Round the results of new rating from 4.66666-> 4.7
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'A tours muss have a price '] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc
          return val < this.price;
        },
        message: 'Discount price({VALUE}) should be below the regular price',
      },
    },
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
    secretTour: { type: Boolean, default: false },
    startLocation: {
      //GeoJSON
      type: { type: String, default: 'Point', enum: ['Point'] },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides:Array -> for Embedding Data
    // create Reference Data
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tourSchema.index({ price: 1 }); //1 sorting price in ascending order
tourSchema.index({ price: 1, ratingsAverage: -1 }); //-1 sorting descending
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
//virtually Population with Reviews in Tour

tourSchema.virtual('review', {
  ref: 'Review',
  foreignField: 'tour', // how you call it in reviewModal
  localField: '_id', // How you call it in this Model
});

///Document middleware : runs before save () and create ()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// to bring guides inside of tours// EMBEDDING
/* 
tourSchema.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});
 */
/* 
tourSchema.pre('save', function (next) {
  console.log('Will save document...');
  next();
});

tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});
 */

///Query Middleware
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  //console.log(docs);
  next();
});

/* //////Aggregation Middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});
 */
/////////////////////////

const Tour = mongoose.model('Tour', tourSchema); //creating a model based on the schema

module.exports = Tour;

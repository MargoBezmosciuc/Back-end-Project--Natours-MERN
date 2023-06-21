/* eslint-disable no-console */

const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModels');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection successful');
  });

///// Reading Json File
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

/////IMPORT DATA INTO DB

const importData = async (req, res) => {
  try {
    await Tour.create(tours);
    console.log('Data successufully loaded');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//////// Delete All Data from DB

const deleteData = async (req, res) => {
  try {
    await Tour.deleteMany();
    console.log('Data sccessufully deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

//console.log(process.argv);

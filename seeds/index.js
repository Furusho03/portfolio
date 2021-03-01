require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../utils/db');
const { descriptors, places } = require('./seedHelpers');
const cities = require('./cities');

// モデル
const Campground = require('../models/campground');

// データベース接続
connectDB();

// 一行にすると何故か動く
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const camp = new Campground({
      location: `${cities[random1000].city} ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});

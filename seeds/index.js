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
    const price = Math.floor(Math.random() * 30) + 10
    const camp = new Campground({
      location: `${cities[random1000].city} ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: 'https://source.unsplash.com/collection/1286920',
      description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators ",
      price: price
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});

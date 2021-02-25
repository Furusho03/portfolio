const express = require('express');
const path = require('path');
require('dotenv').config();

const connectDB = require('./utils/db');

// モデル
const Campground = require('./models/campground');

// Env
const port = process.env.PORT || 8000;

// データベース接続
connectDB();

const app = express();

// 静的ファイル
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ルート
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/makecampground', async (req, res) => {
  const camp = new Campground({
    title: 'My Backyard 2',
    description: 'cheap camping 2',
  });
  await camp.save();
  res.send(camp);
});

// サーバー
app.listen(port, () => {
  console.log(`サーバーは PORT:${port} で動いています`);
});

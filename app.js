const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const { campgroundSchema, reviewSchema } = require("./schemas");
require("dotenv").config();
const Joi = require("joi");

const connectDB = require("./utils/db");

// エラー処理
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");

// モデル
const Campground = require("./models/campground");
const Review = require("./models/review");

// Env
const port = process.env.PORT || 8000;

// データベース接続
connectDB();

const app = express();

// ミドルウェア
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// テンプレートエンジン
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// バリデーション
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// ルート
app.get("/", (req, res) => {
  res.render("home");
});
// 全ての記事
app.get(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);
// 新しい記事
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});
// 記事投稿
app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (req, res) => {
    // if(!req.body.campground) throw new ExpressError('入力してください',400)
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);
// 記事
app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate("reviews");
    res.render("campgrounds/show", { campground });
  })
);
// 編集ページ
app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
  })
);
// 編集
app.put(
  "/campgrounds/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);
// 消去
app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);
// レビュー
app.post(
  "/campgrounds/:id/reviews",
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);
// レビュー削除
app.delete(
  "/campgrounds/:id/reviews/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// エラー
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "何かがおかしいようです";
  res.status(statusCode).render("error", { err });
});

// サーバー
app.listen(port, () => {
  console.log(`サーバーは PORT:${port} で動いています`);
});

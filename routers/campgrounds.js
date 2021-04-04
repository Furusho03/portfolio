const express = require("express");
const router = express.Router();
const { campgroundSchema } = require("../schemas");

// エラー
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

// モデル
const Campground = require("../models/campground");

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

// ルート

// 全ての記事
// /campgrounds
router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

// 新しい記事
// /campgrounds
router.get("/new", (req, res) => {
  res.render("campgrounds/new");
});

// 記事投稿
// /campgrounds
router.post(
  "/",
  validateCampground,
  catchAsync(async (req, res) => {
    // if(!req.body.campground) throw new ExpressError('入力してください',400)
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', '新しい記事を作成しました')
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// 記事
// /campgrounds
router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate("reviews");
    res.render("campgrounds/show", { campground });
  })
);

// 編集ページ
// /campgrounds
router.get(
  "/:id/edit",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
  })
);

// 編集
// /campgrounds
router.put(
  "/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash('success', '記事を編集しました')
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// 消去
// /campgrounds
router.delete(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

module.exports = router;

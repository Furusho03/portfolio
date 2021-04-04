const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
require("dotenv").config();
const campgrounds = require("./routers/campgrounds");
const reviews = require("./routers/reviews");

const connectDB = require("./utils/db");

// エラー処理
const ExpressError = require("./utils/ExpressError");

// Env
const port = process.env.PORT || 8000;
const secret = process.env.SECRET;

// データベース接続
connectDB();

const app = express();

// ミドルウェア
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// セッション
const sessionConfig = {
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpsOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));

// flash
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  console.log(res.locals)
  next();
});

// 静的ファイル
app.use(express.static(path.join(__dirname, "public")));

// テンプレートエンジン
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ルート
app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

app.get("/", (req, res) => {
  res.render("home");
});

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

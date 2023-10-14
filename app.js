const path = require("path");
const express = require("express");
const expressSession = require("express-session");
const expressHbs = require("express-handlebars").engine;
const passport = require("passport");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const homeRoute = require("./routes/home.routes");
const userRoute = require("./routes/user.routes");
const authRoute = require("./routes/auth.routes");
const productRoute = require("./routes/product.routes");
const usersDashboardRoute = require("./routes/dashboard/users.routes");
const productsDashboardRoute = require("./routes/dashboard/products.routes");
const ordersDashboardRoute = require("./routes/dashboard/orders.routes");
const reportsDashboardRoute = require("./routes/dashboard/reports.routes");
const errorHandler = require("./middleware/errorHandler");
const errorLogger = require("./middleware/errorLogger");
const errorNotFound = require("./middleware/errorNotFound");
const handleCastError = require("./middleware/handleCastError");
const connectDB = require("./config/db");
const PORT = process.env.PORT | 3000;
const app = express();

// confugratuion
dotenv.config({
  path: "./config/.env",
});

// connect to mongodb
connectDB();
require("./config/auth");

// set user sessions
app.use(
  expressSession({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      mongoUrl: process.env.ATLAS_URI,
    }),
    name: "token",
    cookie: {
      maxAge: process.env.COOKIE_EXPIRESIN * 60 * 60 * 1000 * 24 * 3,
    },
  })
);

// helpers
const {
  reduce,
  length,
  formatCurrency,
  eq,
  dateFormat,
  ratingIcon,
  getAtIndex,
  calcSales,
  calcRatio,
  stringify,
  calcRating
} = require("./helpers/hbs");

// hendlebars confugratuion
app.engine(
  "hbs",
  expressHbs({
    helpers: {
      reduce,
      length,
      formatCurrency,
      eq,
      dateFormat,
      ratingIcon,
      getAtIndex,
      calcSales,
      calcRatio,
      stringify,
      calcRating
    },
    defaultLayout: "main",
    extname: ".hbs",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "hbs");

// morgan logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
//setup statics files
app.use(express.static(path.join(__dirname, "public")));

// More Middlewares
app.use(passport.initialize());
app.use(passport.session());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Data sanitization against NoSql injection attacks
app.use(mongoSanitize());

// Data sanitization against XSS attacks
app.use(xss());

// helmut securty
app.use(helmet());
// rate limiting
const limit = rateLimit({
  max: 15 * 60 * 100,
  windowMs: 100,
  message: "Too many requests at this time, you are blocked please try later",
  standardHeaders: true,
  legacyHeafers: false
});

// Method Override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

// locals variables
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.isAuthenticated();
  res.locals.user = req?.user;
  res.locals.cart = req.cookies["cart"];
  next();
});

// passport jwt

app.use("/", limit, homeRoute);
app.use("/", productRoute);
app.use("/user", userRoute);
app.use("/auth", authRoute);
app.use("/dashboard", usersDashboardRoute);
app.use("/dashboard/products", productsDashboardRoute);
app.use("/dashboard/orders", ordersDashboardRoute);
app.use("/dashboard/reports", reportsDashboardRoute);

// handle errors
app.use(errorLogger);
app.use(errorNotFound);
app.use(handleCastError);
app.use(errorHandler);

app.listen(PORT, (err) => {
  console.log(`Server running on port ${PORT}`);
});

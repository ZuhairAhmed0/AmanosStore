// import third-party modules
const { validationResult } = require("express-validator");
const passport = require("passport");

// import the user modules
const validationError = require("../helpers/validationError");
const createToken = require("../helpers/createToken");
const UserModel = require("../models/User");
require("dotenv").config({
  path: "./config/.env",
});
const createTransporter = require("../helpers/createTransporter");
const validateResetToken = require("../helpers/validateResetToken");
const tryCatch = require("../helpers/tryCatch");

// user sign up functionality
const user_signup = tryCatch(async (req, res, next) => {
  // validate data from the user entry using express validation
  const error = validationResult(req);
  const errors = validationError(error);
  //  check the user data if content errors and then send errors to user

  if (!error.isEmpty()) {
    return res.render("signup", {
      title: "مستخدم جديد",
      errors,
      values: req.body,
      layout: "user",
    });
  }

  // use passport authenticate to create the user
  passport.authenticate(
    "signup",
    {
      session: false,
    },
    (err, user, info) => {
      // check the user created is fails and send errors to the user
      if (err) {
        return res.render("signup", {
          title: "مستخدم جديد",
          errors: validationError(error),
          values: req.body,
          layout: "user",
        });
      }

      // check the user created successfully and redirect user to login page otherwise redirect the user to sign up page again
      if (user) {
        const message = "تم إنشاء حساب بنجاح يمكنك الان تسجيل الخروج";
        res.redirect(`/auth/login?message=${message}`);
      } else {
        return res.status(400).redirect("/auth/signup");
      }
    }
  )(req, res, next);
});

// user login functionality
const user_login = tryCatch(async (req, res, next) => {
  
  // validate data from the user entry using express validation
  const error = validationResult(req);
  const errors = validationError(error);

  //  check the user data if content errors and then send errors to user
  if (!error.isEmpty()) {
    return res.status(400).render("login", {
      title: "تسجيل الدخول",
      errors,
      values: req.body,
      layout: "user",
    });
  }
  // use passport authenticate to login
  passport.authenticate(
    "login",
    {
      session: false,
      failureRedirect: "/auth/login",
    },
    (err, user, info) => {
      // check the user login is fails and send errors to the user
      if (err) {
        return res.status(400).redirect("/auth/login");
      }

      // check the user login successfully and redirect the user to back page otherwise redirect the user to login page again
      if (user) {
        req.login(user, (err) => {
          if (err) {
            return res.status(400).redirect("/auth/login");
          }

          // create token after login successfully
          createToken(user, res);
          // return the user to back page

          const returnTo = req.query.returnTo || "/";
          return res.status(200).redirect(returnTo);
        });
      } else {
        errors.username = info?.usernameError;
        errors.password = info?.passwordError;
        return res.status(400).render("login", {
          title: "تسجيل الدخول",
          errors,
          values: req.body,
          layout: "user",
        });
      }
    }
  )(req, res, next);
});

// logout functionality
const user_logout = tryCatch((req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    // clear user token and redirect the user to home page
    res.clearCookie("userToken");
    res.redirect("/");
  });
});

const user_forgetPassword = tryCatch(async (req, res) => {
  const email = req.body.email;
  const error = validationResult(req);
  const errors = validationError(error);

  if (!error.isEmpty()) {
    res.locals.isForget = true;
    return res.render("forgetPass", {
      title: "نسيت كلمة المرور",
      errors,
      values: req.body,
      layout: "user",
    });
  }

  const user = await UserModel.findOne({
    email,
  });

  if (!user) {
    throw new Error("المستخدم غير موجود");
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({
    validateBeforeSave: false,
  });

  const resetURL = `https://amanos.zohair.tech/auth/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "تغيير كلمة المرور لـ Amanos Store",
    template: "reset-password",
    context: {
      resetURL: resetURL,
    },
  };
  try {
    const emailTransporter = await createTransporter();

    emailTransporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        throw new Error(error);
      } else {
        res.locals.sendSuccessfully = true;
        return res.render("forgetPass", {
          title: "نسيت كلمة المرور",
          layout: "user",
          values: {
            email,
          },
        });
      }
    });
  } catch (err) {
    res.locals.isForget = true;
    return res.redirect("/forget-password");
  }
});

const user_resetPassword = tryCatch(async (req, res) => {
  // 1) get token from url
  let token = req.params.token;
  const { password, repeat_password } = req.body;
  const error = validationResult(req);
  const errors = validationError(error);

  if (!error.isEmpty()) {
    return res.render("forgetPass", {
      title: "اعادة تعيين كلمة المرور",
      errors,
      values: req.body,
      layout: "user",
      token,
    });
  }

  const user = await validateResetToken(token);

  if (!user) {
    throw new Error("المستخدم غير موجود");
  }

  user.password = password;
  user.resetPasswordExpires = undefined;
  user.resetPasswordToken = undefined;
  user.save();
  const message = "تم اعادة  تعيين كلمة المرور بنجاح يمكنك تسجيل الدخول الان";

  res.redirect(`/auth/login?message=${message}`);
});

const user_updatePassword = tryCatch(async (req, res) => {
  const { old_password, password, repeat_password } = req.body;
  const error = validationResult(req);
  const errors = validationError(error);

  if (!old_password) {
    errors.old_password = "كلمة المرور القديمة مطلوبة";
  }

  const user = await UserModel.findOne({
    _id: req.user.id,
  }).select("+password");

  if (!user && !(await user.isValidPassword(old_password))) {
    errors.old_password = "كلمة المرور القديمة غير صحيحة";
  }

  if (!error.isEmpty() || Object.keys(errors).length !== 0) {
    res.locals.isEdited = true;
    return res.render("forgetPass", {
      title: "اعادة تعيين كلمة المرور",
      errors,
      values: req.body,
      layout: "user",
    });
  }

  user.password = password;
  user.save();
  res.redirect("/profile");
});

const user_updateProfile = tryCatch(async (req, res, next) => {
  const error = validationResult(req);
  const errors = validationError(error);

  if (!error.isEmpty()) {
    res.locals.user = req.body;
    res.locals.user.balance = req.user.balance;
    return res.render("profile", {
      title: "لوحة حسابي",
      errors,
    });
  }

  passport.authenticate("update", (err, user, info) => {
    if (err) {
      return res.status(400).redirect("/user/profile");
    }

    if (user) {
      return res.redirect("/user/profile");
    } else {
      return res.status(400).redirect("/user/profile");
    }
  })(req, res, next);
});

module.exports = {
  user_signup,
  user_login,
  user_logout,
  user_forgetPassword,
  user_resetPassword,
  user_updateProfile,
  user_updatePassword,
};

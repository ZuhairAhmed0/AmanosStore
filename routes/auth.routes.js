const router = require("express").Router();
const ensureLoggedOut = require("connect-ensure-login").ensureLoggedOut();
const ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn(
  "/auth/login"
);

const {
  user_signup,
  user_login,
  user_logout,
  user_forgetPassword,
  user_resetPassword,
  user_updatePassword,
  user_updateProfile,
} = require("../controllers/auth.controller");
const validate = require("../middleware/validator");
const isAuthenticated = require("../middleware/isAuthenticated");
const validateResetToken = require("../helpers/validateResetToken");
// user login endpoints
router
  .route("/login")
  .get(ensureLoggedOut, (req, res) => {
    res.render("login", {
      title: "تسجيل الدخول",
      layout: "user",
      message: req.query.message,
      returnTo: req.query.returnTo,
    });
  })
  .post(ensureLoggedOut, validate("login"), user_login);

// user signup endpoints
router
  .route("/signup")
  .get(ensureLoggedOut, (req, res) => {
    res.render("signup", {
      title: "مستخدم جديد",
      layout: "user",
    });
  })
  .post(ensureLoggedOut, validate("signup"), user_signup);

// user logout endpoints
router.get("/logout", user_logout);

// user forget password endpoints
router
  .route("/forget-password")
  .get((req, res) => {
    res.locals.isForget = true;
    ("/forget-password");
    res.render("forgetPass", {
      title: "نسيت كلمة المرور",
      layout: "user",
      message: req.query.message,
    });
  })
  .post(validate("forgetPassword"), user_forgetPassword);
/**
 * GET Reset Password page.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - Promise object represents the next middleware function.
 */
router.get("/reset-password-token/:token", async (req, res, next) => {
  req.session.destroy(async function (err) {
    try {
      if (err) {
        throw new Error(err);
      }
      const token = req.params.token;
      const user = await validateResetToken(token);
      if (!user) {
        throw new Error("user not found");
      }
      res.redirect(`/auth/reset-password/${token}`);
    } catch (err) {
      const message = "رمز إعادة تعيين كلمة المرور غير صالح او انتهت صلاحيته ";
      res.redirect(`/auth/forget-password?message=${message}`);
    }
  });
});

router.get("/reset-password/:token", async (req, res, next) => {
  const token = req.params.token;
  res.locals.isForget = false;
  return res.render("forgetPass", {
    title: "اعادة تعيين كلمة المرور ",
    layout: "user",
    token,
  });
});
router.put(
  "/reset-password/:token",
  validate("resetPassword"),
  user_resetPassword
);

// user account endpoints
// chanage password => /account/password
router
  .route("/change-password")
  .get(isAuthenticated, (req, res) => {
    res.locals.isEdited = true;
    res.render("forgetPass", {
      title: "تعيير كلمة المرور",
      layout: "user",
    });
  })
  .put(validate("resetPassword"), isAuthenticated, user_updatePassword);

// edit user profile => /profile/edit
router.put(
  "/edit-profile",
  validate("update"),
  isAuthenticated,
  user_updateProfile
);

module.exports = router;

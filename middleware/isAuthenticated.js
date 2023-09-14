const passport = require("passport");

const isAuthenticated = (req, res, next) => {
  passport.authenticate(
    "jwt",
    {
      session: false,
      failureRedirect: `/auth/login?returnTo=${encodeURIComponent(
        req.originalUrl
      )}&message=يجب عليك تسجيل الدخول اولا`,
    },
    (err, user) => {
      if (err) {
        return next(err);
      }

      if (!user || !req.user) {
        req.session.destroy(() => {
          return res.redirect(
            `/auth/login?returnTo=${encodeURIComponent(
              req.originalUrl
            )}&message=يجب عليك تسجيل الدخول اولا`
          );
        });
      } else {
        next();
      }
    }
  )(req, res, next);
};

module.exports = isAuthenticated;

const isAuthorized = (roles) => {
  return (req, res, next) => {
    if (req.isAuthenticated() && roles.includes(req.user.role)) {
      return next();
    } else if (req.isAuthenticated() && req.user.role === "supervisor") {
      res.redirect(
        `/dashboard/${req.query.reqUrl}?message=ليس لديك الصلاحية الكافية لتنفيذ هذا الخيار`
      );
    } else {
      res.redirect(`/not-found?page=${req.originalUrl}`);
    }
  };
};
module.exports = isAuthorized;

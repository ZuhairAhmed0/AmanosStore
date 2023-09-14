const moment = require("moment");
const createCookie = (res, name, value, maxAge) => {
  res.cookie(name, value, {
    expires: moment()
      .add(process.env.COOKIE_EXPIRESIN * maxAge, "days")
      .toDate(),
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
  });
};

module.exports = createCookie;

const jwt = require("jsonwebtoken");
const createCookie = require("../helpers/createCookie");

const createToken = (user, res) => {
  const token = jwt.sign({ id: user._id, email: user.email, role: user.role}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN,
  });
  createCookie(res, "userToken", token, 3);
};

module.exports = createToken;

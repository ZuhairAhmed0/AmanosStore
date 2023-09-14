const mongoose = require("mongoose");

const handleCastError = (err, req, res, next) => {
  if (err instanceof mongoose.CastError) {
    next(new Error("Cast to ObjectId failed for value"));
  } else {
    next(err)
  }
};

module.exports = handleCastError;

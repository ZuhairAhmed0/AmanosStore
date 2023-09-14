const errorHandler = (err, req, res, next) => {
  const statusCode = err.status ?? 500;
  let message = err.message || "Something went wrong";
  return res.status(statusCode).render("error", {
    title: "خط غير متوقع ",
    defaultLayout: false,
    error: {
      message: message,
      code: statusCode,
    },
  });
};

module.exports = errorHandler;

const validationError = (error) => {
  let errors = {};
  error.array().forEach((err) => {
    errors[err.path] = err.msg;
  });

  return errors;
};
module.exports = validationError;

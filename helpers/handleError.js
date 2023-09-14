const validationError = error => {
  let result = {};
  error.array().forEach((err) => {
    result[err.path] = err.msg
  });

  return result;
}
module.exports = {
  validationError
};
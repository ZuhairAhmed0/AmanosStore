class NotFoundError extends Error {
  constructor() {
    super();
    this.status = 404;
    this.message = `
   الصفحة التى تحاول الوصول إليها غير موجودة. 
    قد تكون قد أخطأت العنوان أو قد تكون الصفحة قد تم نقلها 
    `
  }
}

const errorNotFound = (req, res, next) => next(new NotFoundError());

module.exports = errorNotFound;



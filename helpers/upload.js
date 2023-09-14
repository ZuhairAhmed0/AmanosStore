const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // req.body = {}
    cb(null, path.join("public", "images"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|webp|gif/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  if (extname) {
    return cb(null, true);
  } else {
    cb("فشل رفع الصورة , من فضلك ارفع صور فقط!");
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 1 }, // 1 MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("imageUploaded");

module.exports = function (req, res) {
  upload(req, res, function (err) {
    if (err) {
      console.log(err);
      return res.status(400).json({ message: err, imageName: "" });
    } else {
      req.app.locals.imageUploaded = req.file.filename;
      return res
        .status(200)
        .json({ message: "تم رفع الملف بنجاح", imageName: req.file.filename });
    }
  });
};

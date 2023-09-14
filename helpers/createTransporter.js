const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const {
  google
} = require("googleapis");
require("dotenv").config({
  path: "../config/.env",
});

// helpers
const {
  formatCurrency,
  dateFormat,
} = require("../helpers/hbs");
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject(err);
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      accessToken,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });

  transporter.use(
    "compile",
    hbs({
      viewEngine: {
        helpers: {
          formatCurrency,
          dateFormat,
        },
        extname: ".hbs",
        layoutsDir: "views/layouts",
        defaultLayout: false,
        partialsDir: "views/partials/",
        runtimeOptions: {
          allowProtoPropertiesByDefault: true,
          allowProtoMethodsByDefault: true,
        },
      },
      viewPath: "views/partials/",
      extName: ".hbs",
    })
  );
  return transporter;
};

module.exports = createTransporter;
const passport = require("passport");
const UserModel = require("../models/User");
const loaclStrategy = require("passport-local").Strategy;
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

passport.use(
  "signup",
  new loaclStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const { fullname, username } = req.body;

        const user = await UserModel.create({
          fullname,
          username,
          email,
          password,
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  "login",
  new loaclStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, done) => {
      try {
        const user = await UserModel.findOne({
          deleted: false,
          $or: [
            {
              username,
            },
            {
              email: username,
            },
          ],
        }).select("+password");

        if (!user) {
          return done(null, false, {
            usernameError: "لم يتم العثور علي المستخدم",
          });
        }

        const validate = await user.isValidPassword(password);

        if (!validate) {
          return done(null, false, {
            passwordError: "كلمة المرور غير صحيحة",
          });
        }

        user.password = undefined;
        return done(null, user, {
          message: "تم تسجيل الدخول بنجاح",
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  "update",
  new loaclStrategy(
    {
      usernameField: "email",
      passwordField: "username",
      passReqToCallback: true,
    },
    async (req, email, username, done) => {
      try {
        const { fullname, phone } = req.body;
        const updateduser = await UserModel.findByIdAndUpdate(
          req.user._id,
          {
            fullname,
            username,
            email,
            phone,
          },
          {
            new: true,
          }
        );

        return done(null, updateduser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

const cookieExtractor = function (req) {
  let userToken = null;
  if (req && req.cookies) {
    userToken = req.cookies["userToken"];
  }
  return userToken;
};

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: process.env.JWT_SECRET,
    },
    function (jwtPayload, done) {
      return UserModel.findOne({ _id: jwtPayload.id, deleted: false })
        .then((user) => done(null, user))
        .catch((err) => done(err));
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  UserModel.findById(id)
    .then((user) => done(null, user))
    .catch((err) => done(err));
});

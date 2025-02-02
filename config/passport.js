const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      const user = await User.findOrCreate({
        provider: "google",
        provider_user_id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
      });
      done(null, user);
    }
  )
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/api/auth/facebook/callback",
      profileFields: ["id", "emails", "displayName"],
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = await User.findOrCreate({
        provider: "facebook",
        provider_user_id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
      });
      done(null, user);
    }
  )
);

// JWT Serialization
passport.serializeUser((user, done) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  done(null, token);
});

passport.deserializeUser((token, done) => {
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    done(err, decoded);
  });
});

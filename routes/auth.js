const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

// Function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email }, // Include cand_userLevel in the token payload
    process.env.JWT_SECRET,
    { expiresIn: "1h" } // Token expiration time
  );
};

// Google Auth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google Auth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // console.log("User Data Before Redirect:", req.user);

    const token = generateToken(req.user);
    const { cand_userId, cand_firstname, cand_lastname, cand_userLevel } =
      req.user;

    // Log the values to ensure they are not null
    console.log("cand_userId:", cand_userId);
    console.log("cand_firstname:", cand_firstname);
    console.log("cand_lastname:", cand_lastname);
    console.log("cand_userLevel:", cand_userLevel);

    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?token=${token}&cand_id=${cand_userId}&cand_firstname=${cand_firstname}&cand_lastname=${cand_lastname}&cand_userLevel=${cand_userLevel}`
    );
  }
);

// Facebook Auth Callback
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    console.log("User Data Before Redirect:", req.user);

    const token = generateToken(req.user);
    const { cand_userId, cand_firstname, cand_lastname, cand_userLevel } =
      req.user;

    // Log the values to ensure they are not null
    console.log("cand_userId:", cand_userId);
    console.log("cand_firstname:", cand_firstname);
    console.log("cand_lastname:", cand_lastname);
    console.log("cand_userLevel:", cand_userLevel);

    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?token=${token}&cand_id=${cand_userId}&cand_firstname=${cand_firstname}&cand_lastname=${cand_lastname}&cand_userLevel=${cand_userLevel}`
    );
  }
);

module.exports = router;

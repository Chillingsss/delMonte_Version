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

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    console.log("User Data Before Redirect:", req.user); // Debugging

    const token = generateToken(req.user);

    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?token=${token}&cand_id=${req.user.cand_userId}}`
    );
  }
);

// Facebook Auth
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?token=${token}&cand_id=${req.user.cand_userId}&cand_userLevel=${req.user.cand_userLevel}`
    );
  }
);

module.exports = router;

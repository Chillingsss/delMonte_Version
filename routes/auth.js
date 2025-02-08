const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

// Function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.cand_userId || user.adm_id, // Support both candidate & admin
      email: user.email,
      userLevel: user.cand_userLevel || user.adm_userLevel, // Include user level
    },
    process.env.JWT_SECRET || "default-secret", // Ensure secret is set
    { expiresIn: "1h" }
  );
};

// ✅ Google Auth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ✅ Google Auth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=no-user`);
    }

    const token = generateToken(req.user);
    const {
      cand_userId,
      cand_firstname,
      cand_lastname,
      cand_userLevel,
      adm_id,
      adm_userLevel,
    } = req.user;

    // ✅ Set HttpOnly Cookie (Server-side)
    res.cookie("next-auth.session-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
      maxAge: 3600 * 1000, // 1 hour (milliseconds)
    });

    // ✅ Redirect with User Info
    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?token=${token}&cand_id=${
        cand_userId || ""
      }&cand_firstname=${cand_firstname || ""}&cand_lastname=${
        cand_lastname || ""
      }&cand_userLevel=${cand_userLevel || ""}&adm_id=${
        adm_id || ""
      }&adm_userLevel=${adm_userLevel || ""}`
    );
  }
);

// ✅ Facebook Auth Callback
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=no-user`);
    }

    const token = generateToken(req.user);
    const { cand_userId, cand_firstname, cand_lastname, cand_userLevel } =
      req.user;

    res.cookie("next-auth.session-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
      maxAge: 3600 * 1000, // 1 hour
    });

    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?token=${token}&cand_id=${
        cand_userId || ""
      }&cand_firstname=${cand_firstname || ""}&cand_lastname=${
        cand_lastname || ""
      }&cand_userLevel=${cand_userLevel || ""}`
    );
  }
);

module.exports = router;

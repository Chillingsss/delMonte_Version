require("dotenv").config(); // Loads .env
require("dotenv").config({ path: "./models/.env.local", override: true });
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const authRoutes = require("./routes/auth");
require("./config/passport");

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

require("dotenv").config(); // Loads .env
require("dotenv").config({ path: ".env.local", override: true }); // Overrides with .env.local

const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");
const winston = require("winston");
const { check, validationResult } = require("express-validator");
const crypto = require("crypto");
const pool = require("./db");
const rateLimit = require("express-rate-limit");
const moment = require("moment-timezone");
const app = express();
const port = 3002;
const JWT_SECRET = process.env.NEXTAUTH_SECRET;
const MAX_ATTEMPTS = 5;
const LOCK_TIME = 10 * 60 * 1000; // 10 minutes

// Winston Logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => moment().tz("Asia/Manila").format("YYYY-MM-DD HH:mm:ss"),
    }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "login-activity.log" }),
  ],
});

// Middleware
app.use(helmet());
app.use(bodyParser.json({ limit: "10kb" }));
console.log("Allowed Origins:", process.env.ALLOWED_ORIGINS?.split(","));

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) =>
    !req.secure ? res.redirect(`https://${req.headers.host}${req.url}`) : next()
  );
}

// User Table Config
const tables = [
  {
    name: "tbladmin",
    emailCol: "adm_email",
    passCol: "adm_password",
    idCol: "adm_id",
    nameCol: "adm_name",
    userLevelCol: "adm_userLevel",
  },
  {
    name: "tblcandidates",
    emailCol: "cand_email",
    passCol: "cand_password",
    idCol: "cand_id",
    nameCol: "cand_firstname",
    userLevelCol: "cand_userLevel",
  },
];

// Generate JWT Token
const generateToken = (userId, userLevel) => {
  return jwt.sign(
    {
      userId,
      userLevel,
      iat: Date.now(),
      jti: crypto.randomBytes(32).toString("hex"),
    },
    JWT_SECRET,
    {
      expiresIn: "1h",
      algorithm: "HS256",
      audience: process.env.JWT_AUDIENCE || "your-app",
      issuer: process.env.JWT_ISSUER || "your-company",
    }
  );
};

// Check Failed Attempts
const checkFailedAttempts = async (username) => {
  const [results] = await pool.query(
    "SELECT failed_attempts, lock_until FROM tblfailedlogins WHERE email = ?",
    [username]
  );
  return results.length > 0 ? results[0] : null;
};

// Update Failed Attempts
const updateFailedAttempts = async (username, reset = false) => {
  if (reset) {
    await pool.query("DELETE FROM tblfailedlogins WHERE email = ?", [username]);
    logger.info("Reset failed attempts", { username });
  } else {
    await pool.query(
      `INSERT INTO tblfailedlogins (email, failed_attempts, lock_until) VALUES (?, 1, NULL)
       ON DUPLICATE KEY UPDATE failed_attempts = failed_attempts + 1, lock_until = IF(failed_attempts + 1 >= ?, NOW() + INTERVAL 10 MINUTE, NULL)`,
      [username, MAX_ATTEMPTS]
    );
    logger.info("Updated failed attempts", { username });
  }
};

// Check User
const checkUser = async (table, username) => {
  const sql = `SELECT a.${table.idCol} AS id, a.${table.nameCol} AS name, a.${table.emailCol} AS email, a.${table.passCol} AS password, b.userL_level AS userLevel
               FROM ${table.name} a INNER JOIN tbluserlevel b ON a.${table.userLevelCol} = b.userL_id WHERE BINARY a.${table.emailCol} = ?`;
  const [results] = await pool.query(sql, [username]);
  return results.length > 0 ? results[0] : null;
};

// Rate Limiting
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    logger.warn("Rate limit exceeded", { ip: req.ip });
    res
      .status(429)
      .json({ error: "Too many login attempts. Try again later." });
  },
});

// Login Endpoint
app.post(
  "/login",
  [
    loginLimiter,
    check("username").isEmail().normalizeEmail({
      gmail_remove_dots: false,
    }),
    check("password").trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;
    const fakeHash = "$2b$10$ABCDEFGHIJKLMNOPQRSTUVWX0123456789abcdefghijklmn";

    try {
      // Check Lockout
      const failedLoginData = await checkFailedAttempts(username);
      if (
        failedLoginData?.lock_until &&
        new Date(failedLoginData.lock_until) > new Date()
      ) {
        return res.status(403).json({
          error: `Too many failed attempts. Try again in ${Math.ceil(
            (new Date(failedLoginData.lock_until) - new Date()) / 60000
          )} minutes.`,
        });
      }

      // Search User in All Tables
      for (const table of tables) {
        const user = await checkUser(table, username);
        if (!user) continue;

        let storedHash = user.password.startsWith("$2y$")
          ? "$2b$" + user.password.slice(4)
          : user.password;

        if (await bcrypt.compare(password.trim(), storedHash)) {
          await updateFailedAttempts(username, true);
          const token = generateToken(user.id, user.userLevel);

          logger.info("Successful login", {
            userId: user.id,
            userLevel: user.userLevel,
          });
          return res.json({
            user: {
              id: user.id,
              name: user.name,
              email: username,
              userLevel: user.userLevel,
            },
            token,
          });
        }
      }

      // Prevent Enumeration
      await bcrypt.compare(password.trim(), fakeHash);
      await updateFailedAttempts(username);
      logger.warn("Failed login attempt", { username });
      res.status(401).json({ error: "Invalid credentials" });
    } catch (error) {
      logger.error("Login error", { error });
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error("Unhandled error", { error: err });
  res.status(500).json({ error: "An unexpected error occurred" });
});

// Start Server
app.listen(port, () => logger.info(`Server running on port ${port}`));

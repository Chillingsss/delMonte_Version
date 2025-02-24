require("dotenv").config();
require("dotenv").config({ path: ".env.local", override: true });

const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");
const winston = require("winston");
const { check, validationResult } = require("express-validator");
const pool = require("./db");
const rateLimit = require("express-rate-limit");
const app = express();
const port = 3002;
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

if (!JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

// Logger setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.File({ filename: "server.log" })],
});

// Middleware
app.use(helmet());
app.use(bodyParser.json({ limit: "10kb" }));
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:3000",
    credentials: true,
  })
);

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

// Generate JWT Token
const generateToken = (userId, userLevel) => {
  return jwt.sign({ userId, userLevel }, JWT_SECRET, { expiresIn: "1h" });
};

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

// Check User
const checkUser = async (table, username) => {
  const sql = `SELECT ${table.idCol} AS id, ${table.nameCol} AS name, ${table.emailCol} AS email, ${table.passCol} AS password, ${table.userLevelCol} AS userLevel
               FROM ${table.name} WHERE BINARY ${table.emailCol} = ? LIMIT 1`;
  const [results] = await pool.query(sql, [username]);
  return results.length > 0 ? results[0] : null;
};

// Login Endpoint
app.post(
  "/login",
  [loginLimiter, check("username").isEmail(), check("password").trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;
    try {
      for (const table of tables) {
        const user = await checkUser(table, username);
        if (!user) continue;

        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) {
          const token = generateToken(user.id, user.userLevel);
          logger.info("Successful login", { userId: user.id });
          return res.json({ user, token });
        }
      }

      logger.warn("Failed login attempt", { username });
      res.status(401).json({ error: "Invalid credentials" });
    } catch (error) {
      logger.error("Login error", { error: error.message });
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Start Server
app.listen(port, () => logger.info(`Server running on port ${port}`));

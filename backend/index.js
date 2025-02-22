require("dotenv").config(); // Loads .env
require("dotenv").config({ path: ".env.local", override: true }); // Overrides with .env.local

const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const pool = require("./db"); // Database connection
const rateLimit = require("express-rate-limit");

const app = express();
const port = 3002;

app.use(bodyParser.json());
app.use(cors());

// Log important environment variables (Mask sensitive ones)
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "******" : "NOT SET");
console.log("DB_NAME:", process.env.DB_NAME);

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 10 * 60 * 1000; // 10 minutes lock
const JWT_SECRET = process.env.NEXTAUTH_SECRET;

// Generate JWT Token
const generateToken = (userId, userLevel) => {
  return jwt.sign({ userId, userLevel }, JWT_SECRET, { expiresIn: "1h" });
};

// Check failed login attempts
const checkFailedAttempts = async (username) => {
  const sql = `SELECT failed_attempts, lock_until FROM tblfailedlogins WHERE email = ?`;
  const [results] = await pool.query(sql, [username]);
  return results.length > 0 ? results[0] : null;
};

// Update failed login attempts
const updateFailedAttempts = async (username, reset = false) => {
  if (reset) {
    await pool.query(`DELETE FROM tblfailedlogins WHERE email = ?`, [username]);
  } else {
    await pool.query(
      `INSERT INTO tblfailedlogins (email, failed_attempts, lock_until)
       VALUES (?, 1, NULL)
       ON DUPLICATE KEY UPDATE
       failed_attempts = failed_attempts + 1,
       lock_until = IF(failed_attempts + 1 >= ?, NOW() + INTERVAL 10 MINUTE, NULL)`,
      [username, MAX_ATTEMPTS]
    );
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay for security
  }
};

// User tables
const tables = [
  {
    name: "tbladmin",
    emailCol: "adm_email",
    passCol: "adm_password",
    idCol: "adm_id",
    nameCol: "adm_name",
    userLevelCols: "userL_level",
    userLevelCol: "adm_userLevel",
  },
  {
    name: "tblcandidates",
    emailCol: "cand_email",
    passCol: "cand_password",
    idCol: "cand_id",
    nameCol: "cand_firstname",
    userLevelCols: "userL_level",
    userLevelCol: "cand_userLevel",
  },
];

// Fetch user data
const checkUser = async (table, username) => {
  const sql = `SELECT a.${table.idCol}, a.${table.nameCol}, a.${table.emailCol}, a.${table.passCol}, b.${table.userLevelCols}
               FROM ${table.name} a
               INNER JOIN tbluserlevel b ON a.${table.userLevelCol} = b.userL_id
               WHERE BINARY a.${table.emailCol} = ?`;
  const [results] = await pool.query(sql, [username]);
  return results.length > 0 ? results[0] : null;
};

// Rate limit login attempts (5 per 5 minutes)
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit per IP
  message: { error: "Too many login attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login API
app.post("/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  const fakeHash = "$2b$10$ABCDEFGHIJKLMNOPQRSTUVWX0123456789abcdefghijklmn";

  try {
    // Check if user is locked out
    const failedLoginData = await checkFailedAttempts(username);
    if (
      failedLoginData &&
      failedLoginData.lock_until &&
      new Date(failedLoginData.lock_until) > new Date()
    ) {
      const remainingTime = Math.ceil(
        (new Date(failedLoginData.lock_until) - new Date()) / 60000
      );
      return res.status(403).json({
        error: `Too many failed attempts. Try again in ${remainingTime} minutes.`,
      });
    }

    let userFound = false;
    for (const table of tables) {
      const user = await checkUser(table, username);
      if (user) {
        userFound = true;
        let storedHash = user[table.passCol];

        // Convert bcrypt $2y$ to $2b$
        if (storedHash.startsWith("$2y$"))
          storedHash = "$2b$" + storedHash.slice(4);

        if (await bcrypt.compare(password.trim(), storedHash)) {
          await updateFailedAttempts(username, true);
          return res.json({
            user: {
              id: user[table.idCol],
              name: user[table.nameCol],
              email: username,
              userLevel: user[table.userLevelCols],
            },
            token: generateToken(user[table.idCol], user[table.userLevelCols]),
          });
        }
      }
    }

    // Fake bcrypt compare to prevent enumeration attacks
    if (!userFound) await bcrypt.compare(password.trim(), fakeHash);

    await updateFailedAttempts(username);
    res.status(401).json({ error: "Invalid credentials" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));

require("dotenv").config(); // Loads .env
require("dotenv").config({ path: ".env.local", override: true }); // Overrides with .env.local

const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const pool = require("./db");
const rateLimit = require("express-rate-limit");

const app = express();
const port = process.env.PORT || 3002; // Allow port to be set by deployment platform

// Configure CORS with allowed origins
app.use(
  cors({
    origin: [
      "https://delmonte-careers.vercel.app",
      "http://localhost:3000",
      "http://localhost:3002",
    ],
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());

// Log important environment variables (Mask sensitive ones)
console.log("Server starting with configuration:");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "******" : "NOT SET");
console.log("DB_NAME:", process.env.DB_NAME);
console.log("Environment:", process.env.NODE_ENV);

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 10 * 60 * 1000; // 10 minutes lock
const JWT_SECRET = process.env.NEXTAUTH_SECRET;

// Validate JWT Secret is set
if (!JWT_SECRET) {
  console.error("NEXTAUTH_SECRET is not set! Server cannot start.");
  process.exit(1);
}

// Generate JWT Token
const generateToken = (userId, userLevel) => {
  return jwt.sign({ userId, userLevel }, JWT_SECRET, { expiresIn: "1h" });
};

// Rest of your existing code remains the same until the login endpoint...

// Enhanced Login API with better error handling
app.post("/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  console.log("🔹 Login Attempt:", username);
  const fakeHash = "$2b$10$ABCDEFGHIJKLMNOPQRSTUVWX0123456789abcdefghijklmn";

  try {
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

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
        if (storedHash.startsWith("$2y$")) {
          storedHash = "$2b$" + storedHash.slice(4);
        }

        if (await bcrypt.compare(password.trim(), storedHash)) {
          await updateFailedAttempts(username, true);

          const userData = {
            user: {
              id: user[table.idCol],
              name: user[table.nameCol],
              email: username,
              userLevel: user[table.userLevelCols],
            },
            token: generateToken(user[table.idCol], user[table.userLevelCols]),
          };

          console.log("🔹 Successful login for:", username);
          return res.json(userData);
        }
      }
    }

    // Fake bcrypt compare to prevent enumeration attacks
    if (!userFound) {
      await bcrypt.compare(password.trim(), fakeHash);
    }

    await updateFailedAttempts(username);
    console.log("❌ Failed login attempt for:", username);
    res.status(401).json({ error: "Invalid credentials" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "An unexpected error occurred" });
});

// Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
  console.log(`Server timestamp: ${new Date().toISOString()}`);
});

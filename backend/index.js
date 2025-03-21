require("dotenv").config(); // Loads .env
require("dotenv").config({ path: ".env.local", override: true }); // Overrides with .env.local

const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const pool = require("./db"); // Database connection
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");

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
const TWO_FA_CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes
const TWO_FA_CODE_LENGTH = 6;

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
    name: "tblhr",
    emailCol: "hr_email",
    passCol: "hr_password",
    idCol: "hr_id",
    nameCol: "hr_firstname",
    userLevelCols: "userL_level",
    userLevelCol: "hr_userLevel",
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

// Rate limit for resending 2FA codes (3 attempts per 10 minutes)
const resendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // Limit per IP
  message: { error: "Too many resend attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Add this function to generate 2FA code
const generateTwoFACode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Replace the Ethereal test configuration with this Gmail configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Add error handling for the transporter
transporter.verify(function (error, success) {
  if (error) {
    console.log("SMTP Error:", error);
  } else {
    console.log("SMTP Server is ready to take our messages");
  }
});

// Check if 2FA is required based on last verification
// Check if 2FA is required based on tbl2fasetting
const isTwoFARequired = async (email) => {
  const [result] = await pool.query(
    `SELECT setting_everylogs, setting_days, last_verification FROM tbl2fasetting WHERE setting_email = ?`,
    [email]
  );

  if (!result.length) {
    console.log("No 2FA settings found for:", email);
    return false; // No 2FA required if there's no record
  }

  const { setting_everylogs, setting_days, last_verification } = result[0];

  // If setting_everylogs is 0 and setting_days is NULL, no 2FA is required
  if (setting_everylogs === 0 && setting_days === null) {
    console.log("2FA not required as per settings.");
    return false;
  }

  if (setting_everylogs === 1) {
    console.log("2FA required for every login.");
    return true;
  }

  if (!last_verification) {
    console.log("No previous verification found. 2FA required.");
    return true;
  }

  const lastVerificationDate = new Date(last_verification);
  const nextRequiredDate = new Date(lastVerificationDate);
  nextRequiredDate.setDate(lastVerificationDate.getDate() + setting_days);

  const now = new Date();
  const remainingDays = Math.ceil((nextRequiredDate - now) / (1000 * 60 * 60 * 24)); // Convert ms to days

  console.log(`2FA for ${email} required in ${remainingDays} days.`);

  if (now >= nextRequiredDate) {
    console.log("2FA is now required.");
    return true;
  }

  console.log("2FA not required for this login.");
  return false;
};

// Modify the login endpoint
app.post("/login", loginLimiter, async (req, res) => {
  const { username, password, twoFACode, isResend } = req.body;

  try {
    let userFound = false;
    for (const table of tables) {
      const user = await checkUser(table, username);
      if (user) {
        userFound = true;
        let storedHash = user[table.passCol];

        if (storedHash.startsWith("$2y$")) storedHash = "$2b$" + storedHash.slice(4);

        if (await bcrypt.compare(password.trim(), storedHash)) {
          const requireTwoFA = await isTwoFARequired(username);

          if (!requireTwoFA) {
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

          if (twoFACode) {
            const [twoFAResult] = await pool.query(
              "SELECT * FROM tbl2fa WHERE email = ? AND code = ? AND expires_at > NOW()",
              [username, twoFACode]
            );

            if (!twoFAResult.length) {
              return res.status(401).json({ error: "Invalid or expired 2FA code" });
            }

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

          const code = generateTwoFACode();
          const expiryTime = new Date(Date.now() + TWO_FA_CODE_EXPIRY);

          await pool.query(
            "INSERT INTO tbl2fa (email, code, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE code = ?, expires_at = ?",
            [username, code, expiryTime, code, expiryTime]
          );

          try {
            await transporter.sendMail({
              from: `"Del Monte Philippines Security" <${process.env.SMTP_USER}>`,
              to: username,
              subject: "🔒 Del Monte Philippines Security Verification",
              text: `Your verification code is: ${code}\nThis code will expire in 10 minutes.`,
              html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
                  <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h1 style="color: #0A6338; font-size: 24px; margin: 0 0 20px 0; text-align: center;">Security Verification Code</h1>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                      Hello,
                    </p>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                      You've requested a verification code for secure access to your Del Monte Philippines account. Please use the code below:
                    </p>

                    <!-- Verification Code Box -->
                    <div style="background-color: #f8f9fa; border: 2px solid #0A6338; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                      <div style="font-size: 32px; font-weight: bold; color: #0A6338; letter-spacing: 5px;">
                        ${code}
                      </div>
                      <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">
                        This code will expire in <span style="color: #0A6338; font-weight: bold;">10 minutes</span>
                      </p>
                    </div>

                    <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">
                      If you didn't request this code, please ignore this email. Your account security is important to us.
                    </p>

                    <!-- Security Notice -->
                    <div style="background-color: #f8f9fa; border-left: 4px solid #0A6338; padding: 15px; margin: 20px 0;">
                      <p style="color: #666666; font-size: 14px; margin: 0;">
                        For security reasons, never share this code with anyone. Del Monte Philippines will never ask for your verification code through other channels.
                      </p>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div style="padding: 20px; text-align: center;">
                    <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                      Need assistance? Contact our support team:
                    </p>
                    <div style="margin-bottom: 20px;">
                      <a href="mailto:support@delmontephil.com" style="color: #0A6338; text-decoration: none; font-weight: bold;">support@delmontephil.com</a>
                    </div>
                    <div style="border-top: 1px solid #eee; padding-top: 20px;">
                      <p style="color: #999999; font-size: 12px; margin: 0;">
                        &copy; ${new Date().getFullYear()} Del Monte Philippines, Inc. All rights reserved.
                      </p>
                      <p style="color: #999999; font-size: 12px; margin: 5px 0 0 0;">
                        JY Campos Centre, 9th Avenue corner 30th Street, Bonifacio Global City, Taguig City, Philippines
                      </p>
                    </div>
                  </div>
                </div>
              `,
            });
          } catch (error) {
            console.error("Failed to send 2FA code:", error);
            throw new Error("Email delivery failed");
          }

          return res.status(200).json({
            message: "2FA code sent to your email.",
            user: { email: username, twoFA: true },
          });
        }
      }
    }

    if (!userFound) await bcrypt.compare(password.trim(), "$2b$10$FakeHashStringToPreventTimingAttacks");

    await updateFailedAttempts(username);
    res.status(401).json({ error: "Invalid credentials" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
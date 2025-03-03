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
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

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

const getLocationFromIP = (ip) => {
  const geo = geoip.lookup(ip);
  return geo ? `${geo.city}, ${geo.country}` : 'Unknown';
};

const getDeviceInfo = (userAgent) => {
  console.log("Received User Agent:", userAgent);

  // Handle missing or basic user agent
  if (!userAgent || userAgent === 'node' || userAgent === 'undefined') {
    return {
      browser: 'Unknown Browser',
      os: 'Unknown OS',
      device: 'unknown'
    };
  }

  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  // Extract meaningful browser information
  let browserName = result.browser.name || 'Unknown Browser';
  
  // Some versions of Chrome identify as "Chrome" but are actually other browsers
  // Check for common browser identifiers in the user agent string
  if (userAgent.includes('Edg/') || userAgent.includes('Edge/')) {
    browserName = 'Microsoft Edge';
  } else if (userAgent.includes('OPR/') || userAgent.includes('Opera/')) {
    browserName = 'Opera';
  } else if (userAgent.includes('Brave')) {
    browserName = 'Brave';
  } else if (userAgent.includes('Firefox/')) {
    browserName = 'Firefox';
  } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
    browserName = 'Safari';
  }
  
  const deviceInfo = {
    browser: browserName,
    os: result.os.name ? `${result.os.name} ${result.os.version || ''}`.trim() : 'Unknown OS',
    device: result.device.vendor ? 
            `${result.device.vendor} ${result.device.model || ''}`.trim() : 
            (result.device.type || 'desktop')
  };

  console.log("Final Device Info:", deviceInfo);
  return deviceInfo;
};

// Modified function to check if a device is known
const isKnownDevice = async (email, deviceInfo) => {
  // Get all known devices for this user
  const [devices] = await pool.query(
    'SELECT * FROM tblknown_devices WHERE email = ?',
    [email]
  );
  
  // Log all known devices for debugging
  console.log(`Known devices for ${email}:`, devices);
  
  // Check if this browser/OS combination is known
  for (const device of devices) {
    if (device.browser === deviceInfo.browser && device.os === deviceInfo.os) {
      console.log("Found matching device:", device);
      return true;
    }
  }
  
  console.log("No matching device found for:", deviceInfo);
  return false;
};

const isKnownLocation = async (email, location) => {
  const [result] = await pool.query(
    'SELECT * FROM tblknown_locations WHERE email = ? AND location = ?',
    [email, location]
  );
  return result.length > 0;
};

const recordNewDevice = async (email, deviceInfo) => {
  console.log("Recording new device:", { email, deviceInfo }); // Debug log
  
  try {
    // Ensure we have valid strings for all fields
    const sanitizedDeviceInfo = {
      browser: deviceInfo.browser || 'Unknown Browser',
      os: deviceInfo.os || 'Unknown OS',
      device: deviceInfo.device || 'unknown'
    };

    await pool.query(
      'INSERT INTO tblknown_devices (email, browser, os, device, first_seen) VALUES (?, ?, ?, ?, NOW())',
      [
        email,
        sanitizedDeviceInfo.browser,
        sanitizedDeviceInfo.os,
        sanitizedDeviceInfo.device
      ]
    );
    console.log("Successfully recorded new device with info:", sanitizedDeviceInfo);
  } catch (error) {
    console.error("Error recording new device:", error);
    throw error;
  }
};

const recordNewLocation = async (email, location) => {
  await pool.query(
    'INSERT INTO tblknown_locations (email, location, first_seen) VALUES (?, ?, NOW())',
    [email, location, new Date()]
  );
};

// Modify the isTwoFARequired function
const isTwoFARequired = async (email, req) => {
  // Get device and location info
  const deviceInfo = getDeviceInfo(req.headers['user-agent']);
  const location = getLocationFromIP(req.ip);
  
  // Record new device and location immediately if not known
  if (!(await isKnownDevice(email, deviceInfo))) {
    console.log("2FA required: New device detected");
    await recordNewDevice(email, deviceInfo);
  }
  
  if (!(await isKnownLocation(email, location))) {
    console.log("2FA required: New location detected");
    await recordNewLocation(email, location);
  }

  // First check the 7-day verification requirement
  const [result] = await pool.query(
    'SELECT last_verification FROM tbl2fa_verification WHERE email = ?',
    [email]
  );
  
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const requiresRegularVerification = !result.length || new Date(result[0]?.last_verification) < sevenDaysAgo;
  
  console.log("7-day verification required:", requiresRegularVerification);
  console.log("Last verification timestamp:", result[0]?.last_verification);

  // Now check for 7-day verification
  if (requiresRegularVerification) {
    console.log("2FA required: 7-day verification period expired");
    return true;
  }

  // Check for suspicious activity (multiple failed login attempts)
  const [failedAttempts] = await pool.query(
    'SELECT COUNT(*) as count FROM tblfailedlogins WHERE email = ? AND lock_until > DATE_SUB(NOW(), INTERVAL 24 HOUR)',
    [email]
  );
  
  if (failedAttempts[0].count >= 3) {
    console.log("2FA required: Suspicious activity detected");
    return true;
  }

  return false;
};

// Update last 2FA verification timestamp
const updateLastTwoFAVerification = async (email) => {
  await pool.query(
    `INSERT INTO tbl2fa_verification (email, last_verification) 
     VALUES (?, NOW()) 
     ON DUPLICATE KEY UPDATE last_verification = NOW()`,
    [email]
  );
};

// Modify the login endpoint
app.post("/login", loginLimiter, async (req, res) => {
  console.log("Received User Agent:", req.headers['user-agent']); // Log the user agent
  console.log("Request Headers:", req.headers); // Log all request headers
  console.log("Request Body:", req.body); // Log the request body
  const { username, password, twoFACode, isResend } = req.body;
  const fakeHash = "$2b$10$ABCDEFGHIJKLMNOPQRSTUVWX0123456789abcdefghijklmn";

  console.log("Received login request:", {
    username,
    password,
    twoFACode,
    isResend,
  });

  try {
    // Apply resend limiter only for resend requests
    if (isResend) {
      const limiterRes = await new Promise((resolve) => {
        resendLimiter(req, res, resolve);
      });
      if (res.statusCode === 429) return; // Rate limit exceeded
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

        if (storedHash.startsWith("$2y$"))
          storedHash = "$2b$" + storedHash.slice(4);

        if (await bcrypt.compare(password.trim(), storedHash)) {
          // Check if 2FA is required
          const requireTwoFA = await isTwoFARequired(username, req);
          
          // If 2FA is not required, complete login
          if (!requireTwoFA) {
            await updateFailedAttempts(username, true);
            return res.json({
              user: {
                id: user[table.idCol],
                name: user[table.nameCol],
                email: username,
                userLevel: user[table.userLevelCols],
              },
              token: generateToken(
                user[table.idCol],
                user[table.userLevelCols]
              ),
            });
          }

          // If 2FA code is provided, verify it
          if (twoFACode) {
            const [twoFAResult] = await pool.query(
              "SELECT * FROM tbl2fa WHERE email = ? AND code = ? AND expires_at > NOW()",
              [username, twoFACode]
            );

            if (!twoFAResult.length) {
              return res
                .status(401)
                .json({ error: "Invalid or expired 2FA code" });
            }

            // Clear the 2FA code after successful use
            await pool.query("DELETE FROM tbl2fa WHERE email = ?", [username]);
            
            // Update last verification timestamp
            await updateLastTwoFAVerification(username);

            // Complete login
            await updateFailedAttempts(username, true);
            return res.json({
              user: {
                id: user[table.idCol],
                name: user[table.nameCol],
                email: username,
                userLevel: user[table.userLevelCols],
              },
              token: generateToken(
                user[table.idCol],
                user[table.userLevelCols]
              ),
            });
          }

          // Generate and send 2FA code
          const code = generateTwoFACode();
          const expiryTime = new Date(Date.now() + TWO_FA_CODE_EXPIRY);

          // Store 2FA code
          await pool.query(
            "INSERT INTO tbl2fa (email, code, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE code = ?, expires_at = ?",
            [username, code, expiryTime, code, expiryTime]
          );

          // Send 2FA code via email
          try {
            const reason = !(await isKnownDevice(username, getDeviceInfo(req.headers['user-agent']))) ? "new device" : 
                          !(await isKnownLocation(username, getLocationFromIP(req.ip))) ? "new location" : 
                          (await isTwoFARequired(username, req)) ? "periodic verification" :
                          "suspicious activity";

            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #004F39;">Del Monte Philippines</h2>
                <p>Your ${isResend ? 'new ' : ''}verification code is:</p>
                <h1 style="color: #004F39; font-size: 32px; letter-spacing: 5px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px;">${code}</h1>
                <p>This code will expire in 10 minutes.</p>
                <p>This verification was requested due to a login attempt from a ${reason}.</p>
                <p style="color: #666; font-size: 12px; margin-top: 20px;">If you didn't request this code, please secure your account immediately.</p>
              </div>
            `;

            const info = await transporter.sendMail({
              from: `"Del Monte Philippines" <${process.env.SMTP_USER}>`,
              to: username,
              subject: isResend ? "Your New Login Verification Code" : "Your Login Verification Code",
              text: `Your verification code is: ${code}\nThis code will expire in 10 minutes.`,
              html: emailHtml,
            });

          } catch (error) {
            console.error("Detailed email error:", error);
            throw new Error("Failed to send 2FA code");
          }

          return res.status(200).json({
            message: "2FA code sent to your email.",
            user: {
              email: username,
              twoFA: true,
            },
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
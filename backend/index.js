const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const port = 3002;

app.use(bodyParser.json());
app.use(cors());

const connection = mysql.createConnection({
  host: "localhost",
  user: "Gallegos",
  password: "@pelino12",
  database: "delmonteversion",
});

connection.connect();

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

// Generate JWT token
const generateToken = (userId, userLevel) => {
  return jwt.sign({ userId, userLevel }, "delMonte", {
    expiresIn: "1h",
  });
};

// Function to check failed login attempts
const checkFailedAttempts = async (username) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT failed_attempts, lock_until FROM tblfailedlogins WHERE email = ?`;
    connection.query(sql, [username], (err, results) => {
      if (err) return reject(err);
      if (results.length > 0) {
        const { failed_attempts, lock_until } = results[0];
        resolve({ failed_attempts, lock_until });
      } else {
        resolve(null);
      }
    });
  });
};

// Function to update failed login attempts
const updateFailedAttempts = async (username, reset = false) => {
  return new Promise((resolve, reject) => {
    if (reset) {
      const sql = `DELETE FROM tblfailedlogins WHERE email = ?`;
      connection.query(sql, [username], (err) => {
        if (err) return reject(err);
        resolve();
      });
    } else {
      const sql = `INSERT INTO tblfailedlogins (email, failed_attempts, lock_until)
                   VALUES (?, 1, NULL)
                   ON DUPLICATE KEY UPDATE
                   failed_attempts = failed_attempts + 1,
                   lock_until = IF(failed_attempts + 1 >= ?, NOW() + INTERVAL 10 MINUTE, NULL)`;
      connection.query(sql, [username, MAX_ATTEMPTS], (err) => {
        if (err) return reject(err);
        resolve();
      });
    }
  });
};

app.post("/login", async (req, res) => {
  console.log("Login attempt:", req.body);
  const { username, password } = req.body;

  try {
    const failedLoginData = await checkFailedAttempts(username);

    // Check if account is locked
    if (
      failedLoginData &&
      failedLoginData.lock_until &&
      new Date(failedLoginData.lock_until) > new Date()
    ) {
      const remainingTime = Math.ceil(
        (new Date(failedLoginData.lock_until) - new Date()) / 60000
      );
      return res
        .status(403)
        .json({
          error: `Too many failed attempts. Try again in ${remainingTime} minutes.`,
        });
    }

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

    const checkUser = async (table) => {
      return new Promise((resolve, reject) => {
        const sql = `SELECT a.${table.idCol}, a.${table.nameCol}, a.${table.emailCol}, a.${table.passCol}, b.${table.userLevelCols}
                     FROM ${table.name} a
                     INNER JOIN tbluserlevel b ON a.${table.userLevelCol} = b.userL_id
                     WHERE BINARY a.${table.emailCol} = ?`;

        connection.query(sql, [username], async (err, results) => {
          console.log(`Checking ${table.name}:`, {
            username,
            resultsFound: results.length,
          });

          if (err) {
            console.error(`Error in ${table.name}:`, err);
            return reject(err);
          }

          if (results.length > 0) {
            const user = results[0];
            console.log("User found:", user);

            let storedHash = user[table.passCol];

            // If hash starts with $2y$, replace it with $2b$
            if (storedHash.startsWith("$2y$")) {
              storedHash = "$2b$" + storedHash.slice(4);
            }

            const isPasswordValid = await bcrypt.compare(
              password.trim(),
              storedHash
            );
            console.log("Password validation:", isPasswordValid);

            if (isPasswordValid) {
              return resolve({
                id: user[table.idCol],
                name: user[table.nameCol],
                email: username,
                userLevel: user[table.userLevelCols],
              });
            }
          }
          resolve(null);
        });
      });
    };

    Promise.all(tables.map(checkUser))
      .then(async (results) => {
        const validUser = results.find((user) => user !== null);
        console.log("Valid user:", validUser);

        if (validUser) {
          // Reset failed attempts on successful login
          await updateFailedAttempts(username, true);

          // Generate JWT token
          const token = generateToken(validUser.id, validUser.userLevel);

          return res.json({ user: validUser, token });
        } else {
          // Increment failed login attempt
          await updateFailedAttempts(username);
          return res.status(401).json({ error: "Invalid credentials" });
        }
      })
      .catch((error) => {
        console.error("Final error:", error);
        res.status(500).json({ error: "Server error" });
      });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

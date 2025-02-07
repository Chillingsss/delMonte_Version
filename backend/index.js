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

// const enteredPassword = "@ralphjan12";
// const storedHash =
//   "$2y$10$4KHf/MW0xb.A2c9WlOCgo.wz23R56AEFhiu8.lYAQpgtTntdDfEWC";

// // Convert $2y$ to $2b$ if needed
// const correctedHash = storedHash.replace("$2y$", "$2b$");

// bcrypt.compare(enteredPassword, correctedHash).then((result) => {
//   console.log("Password Match:", result);
// });

const connection = mysql.createConnection({
  host: "localhost",
  user: "Gallegos",
  password: "@pelino12",
  database: "delmonteversion",
});

connection.connect();

// Generate JWT token
const generateToken = (userId, userLevel) => {
  return jwt.sign({ userId, userLevel }, "delMonte", {
    expiresIn: "1h",
  });
};

app.post("/login", (req, res) => {
  console.log("Login attempt:", req.body);

  const { username, password } = req.body;

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
    .then((results) => {
      const validUser = results.find((user) => user !== null);
      console.log("Valid user:", validUser);

      if (validUser) {
        // Generate JWT token with userId and userLevel
        const token = jwt.sign(
          { userId: validUser.id, userLevel: validUser.userLevel },
          "delMonte", // Secret key (keep it secure)
          { expiresIn: "1h" }
        );

        return res.json({ user: validUser, token });
      }
      res.status(401).json({ error: "Invalid credentials" });
    })
    .catch((error) => {
      console.error("Final error:", error);
      res.status(500).json({ error: "Server error" });
    });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

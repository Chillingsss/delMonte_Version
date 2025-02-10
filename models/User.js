require("dotenv").config(); // Loads .env
require("dotenv").config({ path: ".env.local", override: true }); // Overrides with .env.local
const mysql = require("mysql2/promise");
const moment = require("moment-timezone");
const pool = require("./db"); // ✅ Correct way

module.exports = {
  async findOrCreate({
    provider,
    provider_user_id,
    email,
    first_name,
    last_name,
  }) {
    // Get the current date and time in Philippines timezone (UTC+8)
    const philippinesTime = moment()
      .tz("Asia/Manila")
      .format("YYYY-MM-DD hh:mm:ss A");

    // Step 1: Check if the email exists in the tbladmin table
    const [adminRows] = await pool.execute(
      `SELECT
          a.adm_id,
          a.adm_email,
          b.userL_level AS adm_userLevel
       FROM tbladmin a
       INNER JOIN tbluserlevel b ON a.adm_userLevel = b.userL_id
       WHERE adm_email = ?`,
      [email]
    );

    let adminData;
    let candidateData;

    if (adminRows.length > 0) {
      // Email exists in tbladmin, get the admin details
      adminData = {
        adm_id: adminRows[0].adm_id,
        adm_userLevel: adminRows[0].adm_userLevel,
      };
    } else {
      // Step 2: Check if the email exists in the tblcandidates table
      const [candidateRows] = await pool.execute(
        `SELECT
            a.cand_id,
            b.userL_level AS cand_userLevel,
            a.cand_firstname,
            a.cand_lastname
         FROM tblcandidates a
         INNER JOIN tbluserlevel b ON a.cand_userLevel = b.userL_id
         WHERE a.cand_email = ?`,
        [email]
      );

      if (candidateRows.length > 0) {
        // Email exists in tblcandidates, get the candidate details
        candidateData = {
          cand_id: candidateRows[0].cand_id,
          cand_userLevel: candidateRows[0].cand_userLevel, // This is now the level name (e.g., 'admin', 'superAdmin')
          cand_firstname: candidateRows[0].cand_firstname,
          cand_lastname: candidateRows[0].cand_lastname,
        };

        // Update the candidate's first name and last name if they are empty
        if (!candidateData.cand_firstname || !candidateData.cand_lastname) {
          const updateFields = {};
          if (!candidateData.cand_firstname)
            updateFields.cand_firstname = first_name;
          if (!candidateData.cand_lastname)
            updateFields.cand_lastname = last_name;

          const updateQuery = `UPDATE tblcandidates
                               SET ${Object.keys(updateFields)
                                 .map((field) => `${field} = ?`)
                                 .join(", ")}
                               WHERE cand_id = ?`;

          await pool.execute(updateQuery, [
            ...Object.values(updateFields),
            candidateData.cand_id,
          ]);

          candidateData.cand_firstname = first_name;
          candidateData.cand_lastname = last_name;
        }
      } else {
        // Email does not exist, insert a new record into tblcandidates
        const [insertCandidateResult] = await pool.execute(
          `INSERT INTO tblcandidates (cand_email, cand_userLevel, cand_firstname, cand_lastname, cand_createdDatetime)
           VALUES (?, ?, ?, ?, ?)`,
          [email, "1", first_name, last_name, philippinesTime] // Set a default user level and names, and creation datetime
        );

        candidateData = {
          cand_id: insertCandidateResult.insertId,
          cand_userLevel: "1",
          cand_firstname: first_name,
          cand_lastname: last_name,
        };
      }
    }

    console.log("Candidate Data:", candidateData);

    console.log("Admin Data:", adminData);

    // Step 3: Insert or update the user in the users table
    const [userResult] = await pool.execute(
      `INSERT INTO users (provider, provider_user_id, email, first_name, last_name, cand_userId, admin_id, created_at, last_login)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         last_login = ?,
         cand_userId = ?,
         admin_id = ?`,
      [
        provider,
        provider_user_id,
        email,
        first_name,
        last_name,
        candidateData ? candidateData.cand_id : null,
        adminData ? adminData.adm_id : null,
        philippinesTime,
        philippinesTime, // For the new record
        philippinesTime, // For the update
        candidateData ? candidateData.cand_id : null,
        adminData ? adminData.adm_id : null,
      ]
    );

    console.log("Returning User Data:", {
      adm_id: adminData ? adminData.adm_id : null,
      adm_userLevel: adminData ? adminData.adm_userLevel : null,
      cand_id: candidateData ? candidateData.cand_id : null,
      cand_userLevel: candidateData ? candidateData.cand_userLevel : null,
      firstname: candidateData ? candidateData.cand_firstname : null,
      lastname: candidateData ? candidateData.cand_lastname : null,
    });

    return {
      id: userResult.insertId || userResult.updateId,
      provider,
      provider_user_id,
      email,
      first_name,
      last_name,
      cand_userId: candidateData ? candidateData.cand_id : null,
      cand_userLevel: candidateData ? candidateData.cand_userLevel : null,
      cand_firstname: candidateData ? candidateData.cand_firstname : null,
      cand_lastname: candidateData ? candidateData.cand_lastname : null,
      adm_id: adminData ? adminData.adm_id : null,
      adm_userLevel: adminData ? adminData.adm_userLevel : null,
    };
  },
};

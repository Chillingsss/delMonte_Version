const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = {
  async findOrCreate({ provider, provider_user_id, email, name }) {
    // Step 1: Check if the email exists in the tblcandidates table
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

    let candidateData;

    if (candidateRows.length > 0) {
      // Email exists, get the candidate details
      candidateData = {
        cand_id: candidateRows[0].cand_id,
        cand_userLevel: candidateRows[0].cand_userLevel, // This is now the level name (e.g., 'admin', 'superAdmin')
        cand_firstname: candidateRows[0].cand_firstname,
        cand_lastname: candidateRows[0].cand_lastname,
      };

    } else {
      // Email does not exist, insert a new record into tblcandidates
      const [insertCandidateResult] = await pool.execute(
        `INSERT INTO tblcandidates (cand_email, cand_userLevel)
         VALUES (?, ?)`,
        [email, "1"] // Set a default user level
      );

      candidateData = {
        cand_id: insertCandidateResult.insertId,
        cand_userLevel: "1",
        cand_firstname: "",
        cand_lastname: "",
      };
    }

    console.log("Candidate Data:", candidateData);


    // Step 2: Insert or update the user in the users table
    const [userResult] = await pool.execute(
      `INSERT INTO users (provider, provider_user_id, email, name, cand_userId)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         last_login = CURRENT_TIMESTAMP,
         cand_userId = ?`,
      [
        provider,
        provider_user_id,
        email,
        name,
        candidateData.cand_id,
        candidateData.cand_id,
      ]
    );

    console.log("User Data Before Returning:", {
      id: userResult.insertId || userResult.updateId,
      provider,
      provider_user_id,
      email,
      name,
      cand_userId: candidateData.cand_id,
      cand_userLevel: candidateData.cand_userLevel, // This should contain the correct value
      cand_firstname: candidateData.cand_firstname,
      cand_lastname: candidateData.cand_lastname,
    });


    // Return consistent user data regardless of whether it's a new or existing user
    return {
      id: userResult.insertId || userResult.updateId,
      provider,
      provider_user_id,
      email,
      name,
      cand_userId: candidateData.cand_id,
      cand_userLevel: candidateData.cand_userLevel,
      cand_firstname: candidateData.cand_firstname,
      cand_lastname: candidateData.cand_lastname,
    };
  },
};

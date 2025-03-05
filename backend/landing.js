const express = require('express');
const cors = require('cors');
const db = require("./db"); // Assuming you have a db module to handle database connections

const app = express(); // Initialize express app
app.use(cors()); // Enable CORS
app.use(express.json()); // Allow JSON requests


app.get('/landingArea', async (req, res) => {
    try {
        const connection = await db.getConnection();
        console.log("Database Connected Successfully!");
        const [rows] = await connection.query(`SELECT * FROM companyprofile`);
        connection.release(); // Release the connection
        console.log("Database Query Result:", rows);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching company profile:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Start server on port 3000
const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

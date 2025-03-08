const express = require('express');
const cors = require('cors');
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());


app.get('/landingArea', async (req, res) => {
    try {
        const connection = await db.getConnection();
        console.log("Database Connected Successfully!");
        const [rows] = await connection.query(`SELECT * FROM companyprofile`);
        connection.release();
        console.log("Database Query Result:", rows);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching company profile:', error);
        res.status(500).send('Internal Server Error');
    }
});

const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

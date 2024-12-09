const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise'); // MySQL library with promise support

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL connection configuration
const dbConfig = {
    host: 'ou7ty.h.filess.io',
    user: 'gamma_glassowner',
    password: process.env.MYSQLCRED,
    database: 'gamma_glassowner',
    port: 3306,
};

// Route to handle login requests
app.get('/api', (req, res) => {
    const { login, password } = req.query;
    if (login === process.env.LOGIN && password === process.env.PASSWORD) {
        res.status(200).send("Request OK. Also why the fuck are u here?");
    } else {
        res.status(401).send("Invalid args. You shouldn't be here.");
    }
});

// Route to handle /recs requests
app.get('/recs', async (req, res) => {
    const { pcname, downloaddate, pubip } = req.query;

    // Validate input parameters
    if (!pcname || !downloaddate || !pubip) {
        return res.status(400).send("Missing required query parameters.");
    }

    try {
        // Connect to the database
        const connection = await mysql.createConnection(dbConfig);

        // Check if the IP address already exists
        const [existing] = await connection.execute(
            `SELECT * FROM user WHERE pubip = ?`,
            [pubip]
        );

        if (existing.length > 0) {
            await connection.end();
            return res.status(409).send(`Record with IP ${pubip} already exists.`);
        }

        // Get the highest existing ID
        const [rows] = await connection.execute(`SELECT MAX(id) AS maxId FROM user`);
        let newId = 1; // Default to 1 if no records exist
        if (rows[0].maxId !== null) {
            newId = rows[0].maxId + 1; // Increment the maximum ID
        }

        // Insert the new record with the computed ID
        const query = `INSERT INTO user (id, pcname, download_date, pubip) VALUES (?, ?, ?, ?)`;
        await connection.execute(query, [newId, pcname, downloaddate, pubip]);

        // Close the database connection
        await connection.end();

        // Send a success response
        res.status(200).send(`Data inserted successfully with ID: ${newId} for PC: ${pcname}`);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send("An error occurred while inserting data into the database.");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

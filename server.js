const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/api', (req, res) => {
    const { login, password } = req.query;
    if (login === process.env.LOGIN && password === process.env.PASSWORD) {
        res.status(200).send("Request OK. Also why the fuck are u here?");
    } else {
        res.status(401).send("Invalid args. You shouldn't be here.");
    }
});

app.use(express.static('public'));
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

app.post('/help', (req, res) => {
    const { query, email } = req.body;
    console.log(`Query received from ${email}: ${query}`);
    res.send('Thank you for your query. We will get back to you soon.');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

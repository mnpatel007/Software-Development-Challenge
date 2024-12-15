const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 8080;

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Meet@082021',
    database: 'bookinventory'
});

const database = pool;

app
    .use(morgan('dev'))
    .use(express.static('public'))
    .use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json())

    // API to add a book
    .post('/api/User', async (req, res) => {
        const body = req.body;
        console.log('Request Body:', body);

        try {
            const result = await database.execute(`
                INSERT INTO Inventory(
                    title,
                    author,
                    genre,
                    publication_date,
                    isbn
                ) VALUES(
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                )
            `, [
                body.title,
                body.author,
                body.genre,
                body.publication_date,
                body.isbn
            ]);

            res.status(201).end("Added book");
        } catch (error){
             console.error('Error adding book:', error);
            res.status(500).json({ error: 'Error adding book to the database' });
        }
    })

    // API to fetch all book entries
    .get('/api/entries', async (req, res) => {
        console.log('Received request for /api/entries'); // Log when the endpoint is hit
        try {
            const [rows] = await database.execute('SELECT * FROM Inventory');
            res.json(rows); // Send the rows as JSON response
        } catch (error) {
            console.error('Error fetching entries:', error);
            res.status(500).json({ error: 'Error fetching entries' });
        }
    })
    
    // Start the server
    .listen(port, () => console.log(`Server listening on port ${port}`));
    


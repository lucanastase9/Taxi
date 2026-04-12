const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configurare conexiune baza de date
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Eroare conexiune MySQL:', err.message);
        return;
    }
    console.log('Conectat cu succes la baza de date taxi_service!');
});

// --- RUTE API ---

// 1. Ruta de Login (Exemplu pentru ecranele tale de login)
app.post('/api/login', (req, res) => {
    const { email, parola } = req.body;
    const query = 'SELECT * FROM client WHERE mail = ? AND parola = ?';

    db.query(query, [email, parola], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.status(401).json({ success: false, message: "Email sau parola incorecta" });
        }
    });
});

// 2. Ruta pentru a vedea istoricul curselor (Pentru ecranul 'Recent trips')
app.get('/api/curse/:id_client', (req, res) => {
    const id = req.params.id_client;
    const query = 'SELECT * FROM cursa WHERE client_id_client = ? ORDER BY data_comanda DESC';

    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

const PORT = process.env.PORT || 8889;
app.listen(PORT, () => {
    console.log(`Serverul de backend ruleaza pe portul ${PORT}`);
});

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // 1. Importăm pachetul cors

const app = express();

app.use(cors()); // 2. Permitem frontend-ului să ne apeleze!
app.use(express.json());


// Configurare conexiune baza de date pentru DBngin
const db = mysql.createConnection({
    host: '127.0.0.1', // Pe Mac mereu folosim IP-ul, nu cuvântul 'localhost'
    user: 'root',      // Utilizatorul standard DBngin
    password: '',      // LĂSĂM GOL! DBngin nu pune nicio parolă din fabrică.
    database: 'taxi_service', 
    port: 5500         // Portul exact pe care ți l-a alocat DBngin și pe care îl vede DataGrip
});

db.connect((err) => {
    if (err) {
        console.error('❌ Eroare conexiune MySQL:', err.message);
        return;
    }
    console.log('✅ Conectat cu succes la baza de date pe portul 5500!');
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

const PORT = 5050;
app.listen(PORT, () => {
    console.log(`Serverul de backend ruleaza pe portul ${PORT}`);
});


// --- RUTA PENTRU LOGIN ---
app.post('/api/login', (req, res) => {
    // 1. Extragem datele primite de la frontend
    const { email, parola } = req.body;

    // (Opțional) O mică verificare să ne asigurăm că nu vin câmpuri goale
    if (!email || !parola) {
        return res.status(400).json({ success: false, message: "Te rog completează ambele câmpuri!" });
    }

    // 2. Căutăm clientul în baza de date
    // Folosim semnele de întrebare (?) pentru a preveni atacurile de tip SQL Injection!
    const query = 'SELECT * FROM client WHERE mail = ? AND parola = ?';

    db.query(query, [email, parola], (err, results) => {
        if (err) {
            console.error('❌ Eroare la interogare:', err.message);
            return res.status(500).json({ success: false, message: 'Eroare de server' });
        }
        
        // 3. Verificăm dacă am găsit pe cineva
        if (results.length > 0) {
            console.log(`✅ Login reușit pentru: ${email}`);
            // Trimitem datele utilizatorului înapoi către frontend (fără parolă, din motive de securitate)
            const userFaraParola = { ...results[0] };
            delete userFaraParola.parola; 
            
            res.json({ success: true, message: "Autentificare cu succes!", user: userFaraParola });
        } else {
            console.log(`⚠️ Încercare eșuată de login pentru: ${email}`);
            res.status(401).json({ success: false, message: "Email sau parolă incorectă!" });
        }
    });
});
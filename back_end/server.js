const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
/*
ALEXANDRA
// Configurare conexiune baza de date pentru DBngin
const db = mysql.createConnection({
    host: '127.0.0.1', // Pe Mac mereu folosim IP-ul, nu cuvântul 'localhost'
    user: 'root',      // Utilizatorul standard DBngin
    password: '',      // LĂSĂM GOL! DBngin nu pune nicio parolă din fabrică.
    database: 'taxi_service',
    port: 5500         // Portul exact pe care ți l-a alocat DBngin și pe care îl vede DataGrip
});
 */
// 1. Configurare conexiune baza de date
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'taxidb',
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('❌ Eroare conexiune MySQL:', err.message);
        return;
    }
    console.log('✅ Conectat cu succes la baza de date pe portul 3306!');
});

// --- RUTE API GENERALE ---
//poti cand modifici sa pui rutele de ai nevoie pentru client dupa sistemul de autentificare si crearee cont ori inainte de driver ori dupa. nu cont.
// Istoricul curselor pentru Client
app.get('/api/curse/:id_client', (req, res) => {
    const id = req.params.id_client;
    const query = 'SELECT * FROM cursa WHERE client_id_client = ? ORDER BY data_comanda DESC';

    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- SISTEM DE AUTENTIFICARE DINAMIC ---

// LOGIN(sofer sau client)
app.post('/api/login', (req, res) => {
    const { email, parola, userType } = req.body;
    let query = '';

    // SOFER
    if (userType === 'driver') {
        query = `
            SELECT s.*, m.nr_inmatriculare , m.model, m.categorie, m.km_parcursi, m.culoare, m.an_fabricare
            FROM sofer s 
            LEFT JOIN masina m ON s.id_sofer = m.sofer_id_sofer 
            WHERE s.mail = ? AND s.parola = ?
        `;
    } else {
        // CLIENT
        // aici faci modificarile daca ai nevoie de ceva legat de login pentru client. TE ROG NU MODIFICA PT DRIVER SI NU FACE ALTA METODA DE LOGIN CA SE FUTE
        // AM INCERCAT SA LE SEPAR!
        query = `SELECT * FROM client WHERE mail = ? AND parola = ?`;
    }

    db.query(query, [email, parola], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Eroare de server' });

        if (results.length > 0) {
            const user = { ...results[0] };
            delete user.parola;

            // Setăm statusul la 'online doar dacă este șofer
            if (userType === 'driver') {
                const updateStatusQuery = "UPDATE sofer SET status = 'online' WHERE id_sofer = ?";
                db.query(updateStatusQuery, [user.id_sofer], (statusErr) => {
                    if (statusErr) console.error("Eroare la setarea statusului online:", statusErr.message);
                });
            }

            res.json({ success: true, user, role: userType });
        } else {
            res.status(401).json({ success: false, message: "Email sau parolă incorectă!" });
        }
    });
});

// SIGN UP (sofer sau client)
app.post('/api/signup', (req, res) => {
    const { nume, email, parola, userType } = req.body;
    const tableName = (userType === 'driver') ? 'sofer' : 'client';

    if (!nume || !email || !parola) {
        return res.status(400).json({ success: false, message: "Toate câmpurile sunt obligatorii!" });
    }

    console.log(`Înregistrare: ${userType} în tabelul ${tableName}`);

    const checkUser = `SELECT mail FROM ${tableName} WHERE mail = ?`;

    db.query(checkUser, [email], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        if (results.length > 0) {
            return res.status(400).json({ success: false, message: "Email deja înregistrat!" });
        }

        const insertQuery = `INSERT INTO ${tableName} (nume, mail, parola) VALUES (?, ?, ?)`;
        db.query(insertQuery, [nume, email, parola], (err, result) => {
            if (err) {
                console.error('Eroare SQL la inserare:', err.message);
                return res.status(500).json({ success: false, message: "Eroare la crearea contului." });
            }
            res.json({ success: true, message: `Cont de ${userType} creat cu succes!` });
        });
    });
});
// --- RUTE SOFER ---

// optinem statisticile si informatiile despre sofer
app.get('/api/driver-stats/:id_sofer', (req, res) => {
    const id = req.params.id_sofer;
    const querySofer = `
        SELECT
            s.nume, s.mail, s.telefon, s.cnp, 
            m.nr_inmatriculare, m.model, m.categorie, m.an_fabricare, m.culoare,
            (SELECT COUNT(*) FROM cursa WHERE sofer_id_sofer = ?) as totalTrips,
            (SELECT IFNULL(ROUND(AVG(rating), 1), 5.0) FROM recenzie WHERE sofer_id_sofer = ? AND tip_autor = 'client') as rating,
            (SELECT IFNULL(SUM(pret_final), 0) FROM cursa WHERE sofer_id_sofer = ?) as totalEarnings,
            (SELECT IFNULL(SUM(distanta), 0) FROM cursa WHERE sofer_id_sofer = ?) as km_parcursi
        FROM sofer s
                 LEFT JOIN masina m ON s.id_sofer = m.sofer_id_sofer
        WHERE s.id_sofer = ?
    `;

    db.query(querySofer, [id, id, id, id, id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            const driverData = results[0];
            const queryCert = `SELECT id_certificat, certificat_tip, data_exp_certif FROM certificat WHERE sofer_id_sofer = ?`;
            db.query(queryCert, [id], (errCert, certResults) => {
                if (errCert) {
                    console.error("Eroare la extragerea certificatelor:", errCert.message);
                    driverData.certificates = [];
                } else {
                    driverData.certificates = certResults;
                }
                res.json(driverData);
            });
        } else {
            res.status(404).json({ message: "Șoferul nu a fost găsit" });
        }
    });
});

// Actualizare profil șofer
app.put('/api/update-driver-profile', (req, res) => {
    const { id_sofer, telefon, cnp, nr_inmatriculare, model, categorie, an_fabricare, culoare } = req.body;

    // 1. Actualizăm datele în tabelul SOFER
    const querySofer = 'UPDATE sofer SET telefon = ?, cnp = ? WHERE id_sofer = ?';

    db.query(querySofer, [telefon, cnp, id_sofer], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Șofer inexistent!" });
        }

        // 2. Inserăm sau actualizăm datele în tabelul MASINA
        const queryMasina = `
            INSERT INTO masina (sofer_id_sofer, nr_inmatriculare, model, categorie, an_fabricare, culoare)
            VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE nr_inmatriculare = ?, model = ?, categorie = ?, an_fabricare = ?, culoare = ?
        `;
        const valoriMasina = [
            id_sofer, nr_inmatriculare, model, categorie, an_fabricare, culoare,
            nr_inmatriculare, model, categorie, an_fabricare, culoare
        ];

        db.query(queryMasina, valoriMasina, (errMasina, resMasina) => {
            if (errMasina) {
                console.error("Eroare la salvarea mașinii:", errMasina.message);
                return res.json({ success: true, message: "Profil salvat, dar eroare la mașină." });
            }

            res.json({ success: true, message: "Profil și mașină actualizate cu succes!" });
        });
    });
});

// ruta adaugare certificat
app.post('/api/add-certificate', (req, res) => {
    const { sofer_id_sofer, certificat_tip, data_exp_certif, fileData} = req.body;

    if (!sofer_id_sofer || !certificat_tip || !data_exp_certif) {
        return res.status(400).json({ success: false, message: "Toate câmpurile sunt obligatorii!" });
    }
    let fileBuffer = null;
    if (fileData) {
        const base64Data = fileData.split(';base64,').pop();
        fileBuffer = Buffer.from(base64Data, 'base64');
    }
    // Inserăm în baza de date
    const query = `
        INSERT INTO certificat (sofer_id_sofer, certificat_tip, data_exp_certif, certificat_poza) 
        VALUES (?, ?, ?, ?)
    `;

    db.query(query, [sofer_id_sofer, certificat_tip, data_exp_certif, fileBuffer], (err, result) => {
        if (err) {
            console.error("Eroare la inserarea certificatului:", err.message);
            return res.status(500).json({ success: false, message: "Eroare la salvarea documentului." });
        }
        res.json({ success: true, message: "Document adăugat cu succes!" });
    });
});

// ruta vizualizare certif
app.get('/api/view-certificate/:id', (req, res) => {
    const id = req.params.id;
    const query = 'SELECT certificat_poza FROM certificat WHERE id_certificat = ?';

    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).send("Eroare de server");

        if (results.length > 0 && results[0].certificat_poza) {
            const buffer = results[0].certificat_poza;
            let contentType = 'application/octet-stream';
            if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
                contentType = 'application/pdf'; // pdf
            } else if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
                contentType = 'image/jpeg'; //jpeg
            } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
                contentType = 'image/png'; //png
            }
            res.setHeader('Content-Type', contentType);
            res.send(buffer);
        } else {
            res.status(404).send("Fișierul nu a fost găsit sau nu a fost încărcat.");
        }
    });
});

// LOGOUT si modificare tabel sofer offline
app.post('/api/logout', (req, res) => {
    const { userId, userType } = req.body;

    if (userType === 'driver' && userId) {
        const query = "UPDATE sofer SET status = 'offline' WHERE id_sofer = ?";
        db.query(query, [userId], (err) => {
            if (err) {
                console.error("Eroare la setarea statusului offline:", err.message);
                return res.status(500).json({ success: false });
            }
            res.json({ success: true, message: "Status setat pe offline" });
        });
    } else {
        res.json({ success: true });
    }
});
// rute pentru sofer - curssa
// 1. Obține cursele disponibile (status: 'Waiting Driver')
app.get('/api/available-rides', (req, res) => {
    const query = `
        SELECT c.*, cl.nume as passengerName 
        FROM cursa c 
        JOIN client cl ON c.client_id_client = cl.id_client 
        WHERE c.status = 'Waiting Driver'
        ORDER BY c.data_comanda DESC, c.ora_comanda DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. Verifică dacă șoferul are o cursă activă ('In ride') atunci când reîncarcă pagina
app.get('/api/active-ride/:id_sofer', (req, res) => {
    const id = req.params.id_sofer;
    const query = `
        SELECT c.*, cl.nume as passengerName 
        FROM cursa c 
        JOIN client cl ON c.client_id_client = cl.id_client 
        WHERE c.sofer_id_sofer = ? AND c.status = 'In ride' 
        LIMIT 1
    `;

    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results.length > 0 ? results[0] : null);
    });
});

// 3. Șoferul ACCEPTĂ o cursă
app.post('/api/accept-ride', (req, res) => {
    const { id_cursa, id_sofer } = req.body
    // Pas A: Actualizăm statusul cursei și atribuim șoferul
    const updateCursa = "UPDATE cursa SET status = 'In ride', sofer_id_sofer = ? WHERE id_cursa = ?";

    db.query(updateCursa, [id_sofer, id_cursa], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        // Pas B: Actualizăm statusul șoferului la 'in_ride'
        const updateSofer = "UPDATE sofer SET status = 'in_ride' WHERE id_sofer = ?";
        db.query(updateSofer, [id_sofer], (errSofer) => {
            if (errSofer) console.error("Eroare update status sofer:", errSofer);
            res.json({ success: true, message: "Cursă preluată cu succes!" });
        });
    });
});
// 4. Șoferul TERMINĂ o cursă
app.post('/api/end-ride', (req, res) => {
    const { id_cursa, id_sofer } = req.body;

    // Pas A: Actualizăm statusul cursei
    const updateCursa = "UPDATE cursa SET status = 'Ride Finished' WHERE id_cursa = ?";

    db.query(updateCursa, [id_cursa], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        // Pas B: Readucem șoferul la statusul 'online'
        const updateSofer = "UPDATE sofer SET status = 'online' WHERE id_sofer = ?";
        db.query(updateSofer, [id_sofer], (errSofer) => {
            if (errSofer) console.error("Eroare update status sofer:", errSofer);
            res.json({ success: true, message: "Cursă finalizată!" });
        });
    });
});
// 5. Istoricul curselor pentru Sofer (Ride Finished)
app.get('/api/driver-history/:id_sofer', (req, res) => {
    const id = req.params.id_sofer;
    const query = `
        SELECT 
            c.id_cursa as id,
            c.data_comanda as date,
            c.ora_comanda as time,
            cl.nume as passenger,
            c.plecare as from_loc,
            c.destinatie as to_loc,
            c.distanta as distance,
            c.durata_estimata as duration,
            c.pret_final as fare,
            IFNULL(p.tips, 0) as tip
        FROM cursa c
        JOIN client cl ON c.client_id_client = cl.id_client
        LEFT JOIN plata p ON c.id_cursa = p.cursa_id_cursa
        WHERE c.sofer_id_sofer = ? AND c.status = 'Ride Finished'
        ORDER BY c.data_comanda DESC, c.ora_comanda DESC
    `;

    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});





//Not me
// --- RUTE CLIENT ---

app.put('/api/update-profile', (req, res) => {
    const { id_client, telefon, adresa, metoda_plata } = req.body;
    const query = 'UPDATE client SET telefon = ?, adresa = ?, metoda_plata = ? WHERE id_client = ?';

    db.query(query, [telefon, adresa, metoda_plata, id_client], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: "Profil client actualizat!" });
    });
});

const PORT = 5050;
app.listen(PORT, () => {
    console.log(`🚀 Serverul de backend rulează pe http://localhost:${PORT}`);
});
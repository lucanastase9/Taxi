const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

//LUCA
// Configurare conexiune baza de date pentru DBngin
const db = mysql.createConnection({
    host: 'localhost', 
    user: 'root',      
    password: '',      
    database: 'taxidb',
    port: 3306         
});

// Alexandra
/*const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'taxi_service',
    port: 3306
});*/
/*
//Aiven.io
const db = mysql.createConnection({
    host: 'taxidb-bordeialexandraioana-taxiservice.j.aivencloud.com', // NU mai e localhost
    user: 'avnadmin',
    password: 'AVNS_fZOrsnR2EPkWWa1tnG0',
    database: 'defaultdb',
    port: 11584
});
*/

db.connect((err) => {
    if (err) {
        console.error('❌ Eroare conexiune MySQL:', err.message);
        return;
    }
    console.log('✅ Conectat cu succes la baza de date din cloud');
});

// --- RUTE API GENERALE ---
//poti cand modifici sa pui rutele de ai nevoie pentru client dupa sistemul de autentificare si crearee cont ori inainte de driver ori dupa. nu cont.
// Istoricul curselor pentru Client


// SISTM DE AUTENTIFICARE
{
// LOGIN(sofer sau client)
    app.post('/api/login', (req, res) => {
        const {email, parola, userType} = req.body;
        let query = '';
        // SOFER
        if (userType === 'driver') {
            query = `
                SELECT s.*, m.nr_inmatriculare, m.model, m.categorie, m.km_parcursi, m.culoare, m.an_fabricare
                FROM sofer s
                         LEFT JOIN masina m ON s.id_sofer = m.sofer_id_sofer
                WHERE s.mail = ?
                  AND s.parola = ?
            `;
        } else {
            // CLIENT
            // aici faci modificarile daca ai nevoie de ceva legat de login pentru client. TE ROG NU MODIFICA PT DRIVER SI NU FACE ALTA METODA DE LOGIN CA SE FUTE
            // AM INCERCAT SA LE SEPAR!
            query = `SELECT *
                     FROM client
                     WHERE mail = ?
                       AND parola = ?`;
        }

        db.query(query, [email, parola], (err, results) => {
            if (err) return res.status(500).json({success: false, message: 'Eroare de server'});
            if (results.length > 0) {
                const user = {...results[0]};
                delete user.parola;
                if (userType === 'driver') {
                    const updateStatusQuery = "UPDATE sofer SET status = 'online' WHERE id_sofer = ?";
                    db.query(updateStatusQuery, [user.id_sofer], (statusErr) => {
                        if (statusErr) console.error("Eroare la setarea statusului online:", statusErr.message);
                    });
                }
                res.json({success: true, user, role: userType});
            } else {
                res.status(401).json({success: false, message: "Email sau parolă incorectă!"});
            }
        });
    });
// SIGN UP (sofer sau client)
    app.post('/api/signup', (req, res) => {
        const {nume, email, parola, userType} = req.body;
        const tableName = (userType === 'driver') ? 'sofer' : 'client';

        if (!nume || !email || !parola) {
            return res.status(400).json({success: false, message: "Toate câmpurile sunt obligatorii!"});
        }

        console.log(`Înregistrare: ${userType} în tabelul ${tableName}`);

        const checkUser = `SELECT mail
                           FROM ${tableName}
                           WHERE mail = ?`;

        db.query(checkUser, [email], (err, results) => {
            if (err) return res.status(500).json({success: false, message: err.message});

            if (results.length > 0) {
                return res.status(400).json({success: false, message: "Email deja înregistrat!"});
            }

            const insertQuery = `INSERT INTO ${tableName} (nume, mail, parola)
                                 VALUES (?, ?, ?)`;
            db.query(insertQuery, [nume, email, parola], (err, result) => {
                if (err) {
                    console.error('Eroare SQL la inserare:', err.message);
                    return res.status(500).json({success: false, message: "Eroare la crearea contului."});
                }
                res.json({success: true, message: `Cont de ${userType} creat cu succes!`});
            });
        });
    });
}
// --- RUTE SOFER ---
{
// optinem statisticile si informatiile despre sofer(most part of ACCOUNT)
    app.get('/api/driver-stats/:id_sofer', (req, res) => {
        const id = req.params.id_sofer;
        const querySofer = `
            SELECT s.nume,
                   s.mail,
                   s.telefon,
                   s.cnp,
                   m.nr_inmatriculare,
                   m.model,
                   m.categorie,
                   m.an_fabricare,
                   m.culoare,
                   (SELECT COUNT(*) FROM cursa WHERE sofer_id_sofer = ?)                   as totalTrips,
                   (SELECT IFNULL(ROUND(AVG(rating), 1), 5.0)
                    FROM recenzie
                    WHERE sofer_id_sofer = ? AND tip_autor = 'client')                     as rating,
                   (SELECT IFNULL(SUM(pret_final), 0) FROM cursa WHERE sofer_id_sofer = ?) as totalEarnings,
                   (SELECT IFNULL(SUM(distanta), 0) FROM cursa WHERE sofer_id_sofer = ?)   as km_parcursi
            FROM sofer s
                     LEFT JOIN masina m ON s.id_sofer = m.sofer_id_sofer
            WHERE s.id_sofer = ?
        `;
        db.query(querySofer, [id, id, id, id, id], (err, results) => {
            if (err) return res.status(500).json({error: err.message});
            if (results.length > 0) {
                const driverData = results[0];
                const queryCert = `SELECT id_certificat, certificat_tip, data_exp_certif
                                   FROM certificat
                                   WHERE sofer_id_sofer = ?`;
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
                res.status(404).json({message: "Șoferul nu a fost găsit"});
            }
        });
    });
// metoda de editare si actualizare a contului
    app.put('/api/update-driver-profile', (req, res) => {
        const {id_sofer, telefon, cnp, nr_inmatriculare, model, categorie, an_fabricare, culoare} = req.body;
        //pt tabelul sofer
        const querySofer = 'UPDATE sofer SET telefon = ?, cnp = ? WHERE id_sofer = ?';
        db.query(querySofer, [telefon, cnp, id_sofer], (err, result) => {
            if (err) return res.status(500).json({success: false, message: err.message});

            if (result.affectedRows === 0) {
                return res.status(404).json({success: false, message: "Șofer inexistent!"});
            }
            //pt tabelul masina
            const queryMasina = `
                INSERT INTO masina (sofer_id_sofer, nr_inmatriculare, model, categorie, an_fabricare, culoare)
                VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY
                UPDATE nr_inmatriculare = ?, model = ?, categorie = ?, an_fabricare = ?, culoare = ?
            `;
            const valoriMasina = [
                id_sofer, nr_inmatriculare, model, categorie, an_fabricare, culoare,
                nr_inmatriculare, model, categorie, an_fabricare, culoare
            ];
            db.query(queryMasina, valoriMasina, (errMasina, resMasina) => {
                if (errMasina) {
                    console.error("Eroare la salvarea mașinii:", errMasina.message);
                    return res.json({success: true, message: "Profil salvat, dar eroare la mașină."});
                }
                res.json({success: true, message: "Profil și mașină actualizate cu succes!"});
            });
        });
    });
// ruta de adaugare cerificat in tabelul CERTIFICAT
    app.post('/api/add-certificate', (req, res) => {
        const {sofer_id_sofer, certificat_tip, data_exp_certif, fileData} = req.body;
        if (!sofer_id_sofer || !certificat_tip || !data_exp_certif) {
            return res.status(400).json({success: false, message: "Toate câmpurile sunt obligatorii!"});
        }
        let fileBuffer = null;
        if (fileData) {
            const base64Data = fileData.split(';base64,').pop();
            fileBuffer = Buffer.from(base64Data, 'base64');
        }
        const query = `
            INSERT INTO certificat (sofer_id_sofer, certificat_tip, data_exp_certif, certificat_poza)
            VALUES (?, ?, ?, ?)
        `;
        db.query(query, [sofer_id_sofer, certificat_tip, data_exp_certif, fileBuffer], (err, result) => {
            if (err) {
                console.error("Eroare la inserarea certificatului:", err.message);
                return res.status(500).json({success: false, message: "Eroare la salvarea documentului."});
            }
            res.json({success: true, message: "Document adăugat cu succes!"});
        });
    });
// ruta vizualizare certificat
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
        const {userId, userType} = req.body;
        if (userType === 'driver' && userId) {
            const query = "UPDATE sofer SET status = 'offline' WHERE id_sofer = ?";
            db.query(query, [userId], (err) => {
                if (err) {
                    console.error("Eroare la setarea statusului offline:", err.message);
                    return res.status(500).json({success: false});
                }
                res.json({success: true, message: "Status setat pe offline"});
            });
        } else {
            res.json({success: true});
        }
    });
}
//metoda de a vedea reviewurile
app.get('/api/driver-reviews/:id_sofer', (req, res) => {
    const id = req.params.id_sofer;

    const query = `
        SELECT 
            r.id_recenzie as id,
            c.nume as passenger,
            r.rating,
            r.comentarii as comment
        FROM recenzie r
        JOIN client c ON r.client_id_client = c.id_client
        WHERE r.sofer_id_sofer = ? AND r.tip_autor = 'client'
        ORDER BY r.id_recenzie DESC
    `;

    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});
// rute pentru sofer - cursa
{
// 1. ruta de obtinere ce curse sunt active pe categoria noastra(status: 'Waiting Driver')
    app.get('/api/available-rides', (req, res) => {
        const categorieSofer = req.query.categorie;
        const query = `
            SELECT c.*, cl.nume as passengerName
            FROM cursa c
                     JOIN client cl ON c.client_id_client = cl.id_client
            WHERE c.status = 'Waiting Driver'
              AND c.categorie = ?
            ORDER BY c.data_comanda DESC, c.ora_comanda DESC
        `;
        db.query(query, [categorieSofer], (err, results) => {
            if (err) return res.status(500).json({error: err.message});
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
            WHERE c.sofer_id_sofer = ?
              AND c.status = 'In ride' LIMIT 1
        `;
        db.query(query, [id], (err, results) => {
            if (err) return res.status(500).json({error: err.message});
            res.json(results.length > 0 ? results[0] : null);
        });
    });
// 3. ruta ca soferul sa accepte calatoria(update status 'In ride')
    app.post('/api/accept-ride', (req, res) => {
        const {id_cursa, id_sofer} = req.body;
        const oraStart = new Date().getHours();
        const updateCursa = "UPDATE cursa SET status = 'In ride', sofer_id_sofer = ?, ora_start = ? WHERE id_cursa = ?";
        db.query(updateCursa, [id_sofer, oraStart, id_cursa], (err) => {
            if (err) return res.status(500).json({success: false, message: err.message});
            const updateSofer = "UPDATE sofer SET status = 'in_ride' WHERE id_sofer = ?";
            db.query(updateSofer, [id_sofer], (errSofer) => {
                if (errSofer) console.error("Eroare update status sofer:", errSofer);
                res.json({success: true, message: "Cursă preluată cu succes!", ora_start: oraStart});
            });
        });
    });
// 4. ruta de terminare a calatoriei(update status 'Ride Finished')
    app.post('/api/end-ride', (req, res) => {
        const { id_cursa, id_sofer } = req.body;
        const oraDestinatie = new Date().getHours();

        // Preluăm prețul, tips-ul și METODA DE PLATĂ a clientului (prin JOIN)
        const getQuery = `
            SELECT c.pret_estimat, c.tips, cl.metoda_plata 
            FROM cursa c
            JOIN client cl ON c.client_id_client = cl.id_client
            WHERE c.id_cursa = ?
        `;

        db.query(getQuery, [id_cursa], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (results.length === 0) return res.status(404).json({ success: false, message: "Cursa nu a fost găsită" });

            const pretEstimat = results[0].pret_estimat;
            const tipsClient = results[0].tips || 0;
            const metodaPlata = results[0].metoda_plata || 'Cash'; // Default numerar dacă nu a ales nimic

            // Fluctuatia de pret +/- 10 lei
            const variatieRandom = Math.floor(Math.random() * 21) - 10;
            let pretFinal = pretEstimat + variatieRandom;
            if (pretFinal < 5) pretFinal = 5;

            const updateCursa = "UPDATE cursa SET status = 'Ride Finished', ora_destinatie = ?, pret_final = ? WHERE id_cursa = ?";

            db.query(updateCursa, [oraDestinatie, pretFinal, id_cursa], (err) => {
                if (err) return res.status(500).json({ success: false, message: err.message });

                // Aici în loc de 'Card' hardcodat, punem variabila "metodaPlata" (care e Card sau Cash)
                const insertPlata = `
                    INSERT INTO plata (cursa_id_cursa, metoda_plata, data_ora, status, suma, tips)
                    VALUES (?, ?, NOW(), 1, ?, ?)
                `;

                db.query(insertPlata, [id_cursa, metodaPlata, pretFinal, tipsClient], (errPlata) => {
                    if (errPlata) console.error("Eroare la înregistrarea plății:", errPlata.message);

                    const updateSofer = "UPDATE sofer SET status = 'online' WHERE id_sofer = ?";
                    db.query(updateSofer, [id_sofer], (errSofer) => {
                        if (errSofer) console.error("Eroare update status sofer:", errSofer);
                        res.json({
                            success: true,
                            message: "Cursă finalizată și plată înregistrată!",
                            pret_cursa: pretFinal,
                            tips: tipsClient,
                            metoda: metodaPlata
                        });
                    });
                });
            });
        });
    });
// 5. Istoricul curselor pentru Sofer (SELECT cursa WHERE 'Ride Finished')
    app.get('/api/driver-history/:id_sofer', (req, res) => {
        const id = req.params.id_sofer;
        const query = `
            SELECT c.id_cursa as id,
                   c.data_comanda as date,
            c.ora_comanda as time,
            cl.nume as passenger,
            c.plecare as from_zone
            c.destinatie as to_zone,
            c.distanta as distance,
            c.pret_final as fare,
            IFNULL(p.tips, 0) as tip
            FROM cursa c
                JOIN client cl
            ON c.client_id_client = cl.id_client
                LEFT JOIN plata p ON c.id_cursa = p.cursa_id_cursa
            WHERE c.sofer_id_sofer = ? AND c.status = 'Ride Finished'
            ORDER BY c.data_comanda DESC, c.ora_comanda DESC
        `;
        db.query(query, [id], (err, results) => {
            if (err) return res.status(500).json({error: err.message});
            res.json(results);
        });
    });
    //ruta sa poata si amaratul de sofer sa lase review
    app.post('/api/submit-driver-review', (req, res) => {
        const { sofer_id_sofer, client_id_client, rating, comentarii } = req.body;

        if (!client_id_client || !sofer_id_sofer) {
            return res.status(400).json({ success: false, message: "Date incomplete." });
        }

        // Setăm tip_autor = 'sofer'
        const query = `
        INSERT INTO recenzie (sofer_id_sofer, client_id_client, rating, comentarii, tip_autor) 
        VALUES (?, ?, ?, ?, 'sofer')
    `;

        db.query(query, [sofer_id_sofer, client_id_client, rating, comentarii], (err) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: "Recenzie adăugată cu succes!" });
        });
    });
}
// rute pentru cursa - sofer
{
//creeare cursa
    app.post('/api/create-ride', (req, res) => {
        const {client_id_client, plecare, destinatie, distanta, categorie} = req.body;
        // Definim tarifele pe km
        const tarife = {
            'economy': 2.40,
            'standard': 2.90,
            'premium': 3.50,
            'xl': 4.50
        };
        const pret_estimat = parseFloat(distanta) * (tarife[categorie.toLowerCase()] || 2.90);
        const status = 'Waiting Driver';
        const data_comanda = new Date().toISOString().split('T')[0];
        const ora_comanda = new Date().toLocaleTimeString('ro-RO', {hour12: false});
        const query = `
            INSERT INTO cursa
            (client_id_client, status, plecare, destinatie, categorie, data_comanda, ora_comanda, pret_estimat,
             distanta)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(query, [client_id_client, status, plecare, destinatie, categorie, data_comanda, ora_comanda, pret_estimat, distanta], (err, result) => {
            if (err) return res.status(500).json({success: false, message: err.message});
            res.json({success: true, pret: pret_estimat, id_cursa: result.insertId});
        });
    });
// verifica daca statusul In ride, Waiting Driver
    app.get('/api/client-active-ride/:id_client', (req, res) => {
        const id = req.params.id_client;
        const query = `
            SELECT c.*, s.nume as driverName, m.nr_inmatriculare, m.model
            FROM cursa c
                     LEFT JOIN sofer s ON c.sofer_id_sofer = s.id_sofer
                     LEFT JOIN masina m ON s.id_sofer = m.sofer_id_sofer
            WHERE c.client_id_client = ?
              AND c.status IN ('Waiting Driver', 'In ride') LIMIT 1
        `;
        db.query(query, [id], (err, results) => {
            if (err) return res.status(500).json({error: err.message});
            res.json(results.length > 0 ? results[0] : null);
        });
    });
// tips pentru sofer
    app.put('/api/update-tip', (req, res) => {
        const {id_cursa, tips} = req.body;
        const query = "UPDATE cursa SET tips = ? WHERE id_cursa = ?";

        db.query(query, [tips, id_cursa], (err) => {
            if (err) return res.status(500).json({success: false, message: err.message});
            res.json({success: true, message: "Tips actualizat!"});
        });
    });
}
//well me now
// --- RUTE CLIENT ---
//client sa isi vada reviewurile
app.get('/api/client-reviews/:id_client', (req, res) => {
    const id = req.params.id_client;

    const query = `
        SELECT 
            r.id_recenzie as id,
            s.nume as driver,
            r.rating,
            r.comentarii as comment
        FROM recenzie r
        JOIN sofer s ON r.sofer_id_sofer = s.id_sofer
        WHERE r.client_id_client = ? AND r.tip_autor = 'sofer'
        ORDER BY r.id_recenzie DESC
    `;

    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});
// client da review la sofer
app.post('/api/submit-review', (req, res) => {
    const { sofer_id_sofer, client_id_client, rating, comentarii } = req.body;

    if (!sofer_id_sofer) {
        return res.status(400).json({ success: false, message: "Așteaptă ca un șofer să preia cursa mai întâi." });
    }

    const query = `
        INSERT INTO recenzie (sofer_id_sofer, client_id_client, rating, comentarii, tip_autor) 
        VALUES (?, ?, ?, ?, 'client')
    `;

    db.query(query, [sofer_id_sofer, client_id_client, rating, comentarii], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: "Recenzie adăugată cu succes!" });
    });
});
// 1. Obține datele și statisticile clientului (PENTRU CONT)
app.get('/api/client-stats/:id_client', (req, res) => {
    const id = req.params.id_client;

    const query = `
        SELECT
            c.id_client, c.nume, c.mail, c.nr_tel, c.adresa, c.metoda_plata,
            (SELECT COUNT(*) FROM cursa WHERE client_id_client = ? AND status = 'Ride Finished') as totalTrips,
            (SELECT IFNULL(SUM(pret_final), 0) FROM cursa WHERE client_id_client = ? AND status = 'Ride Finished') as totalSpent,
            (SELECT IFNULL(ROUND(AVG(rating), 1), 5.0) FROM recenzie WHERE client_id_client = ? AND tip_autor = 'sofer') as rating
        FROM client c
        WHERE c.id_client = ?
    `;

    db.query(query, [id, id, id, id], (err, results) => {
        if (err) {
            console.error("Eroare SQL stats client:", err.message);
            return res.status(500).json({ error: err.message });
        }
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ message: "Clientul nu a fost găsit" });
        }
    });
});
// 2. Actualizare profil client
app.put('/api/update-profile', (req, res) => {
    const { id_client, telefon, adresa, metoda_plata } = req.body;
    const query = 'UPDATE client SET nr_tel = ?, adresa = ?, metoda_plata = ? WHERE id_client = ?';

    db.query(query, [telefon, adresa, metoda_plata, id_client], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: "Profil client actualizat!" });
    });
});

app.get('/api/curse/:id_client', (req, res) => {
    const id = req.params.id_client;

    // Folosim JOIN pentru a aduce și detaliile șoferului și mașinii
    const query = `
        SELECT
            c.id_cursa as id,
            DATE_FORMAT(c.data_comanda, '%Y-%m-%d') as date,
            c.ora_destinatie as time,
            c.plecare as 'from',
            c.destinatie as 'to',
            c.distanta as distance,
            c.pret_final as price,
            IFNULL(s.nume, 'Șofer Necunoscut') as driver,
            CONCAT(IFNULL(m.model, 'Auto'), ' - ', IFNULL(m.nr_inmatriculare, 'Fără număr')) as car
        FROM cursa c
            LEFT JOIN sofer s ON c.sofer_id_sofer = s.id_sofer
            LEFT JOIN masina m ON s.id_sofer = m.sofer_id_sofer
        WHERE c.client_id_client = ? AND c.status = 'Ride Finished'
        ORDER BY c.data_comanda DESC, c.ora_destinatie DESC
    `;

    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});
const PORT = 5050;

// ==========================================
// RUTE ADMIN - GESTIONARE CLIENTI (CRUD)
// ==========================================

// 1. VIZUALIZARE (Read)
app.get('/api/admin/clients', (req, res) => {
    // Folosim CAST pentru a transforma BIT(1) într-un număr lizibil pentru Frontend
    const query = 'SELECT id_client, nume, nr_tel, mail, parola, km_parcursi, adresa, CAST(activ AS UNSIGNED) as activ FROM client ORDER BY id_client DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Eroare la citire clienți:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// 2. ADĂUGARE (Create)
app.post('/api/admin/clients', (req, res) => {
    const { nume, nr_tel, mail, parola } = req.body;
    // Setăm activ=1 implicit la creare
    const query = 'INSERT INTO client (nume, nr_tel, mail, parola, km_parcursi, activ) VALUES (?, ?, ?, ?, 0, 1)';
    
    db.query(query, [nume, nr_tel, mail, parola], (err, result) => {
        if (err) {
            console.error("Eroare la adăugare client:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: "Client adăugat cu succes!" });
    });
});

// 3. MODIFICARE (Update)
app.put('/api/admin/clients/:id', (req, res) => {
    const id = req.params.id;
    const { nume, nr_tel, mail } = req.body;
    
    const query = 'UPDATE client SET nume = ?, nr_tel = ?, mail = ? WHERE id_client = ?';
    db.query(query, [nume, nr_tel, mail, id], (err, result) => {
        if (err) {
            console.error("Eroare la editare client:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: "Datele clientului au fost actualizate!" });
    });
});

// 4. ȘTERGERE LOGICĂ (Delete)
app.delete('/api/admin/clients/:id', (req, res) => {
    const id = req.params.id;
    // Setăm activ = 0
    const query = 'UPDATE client SET activ = 0 WHERE id_client = ?';
    
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Eroare la arhivare client:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: "Contul clientului a fost arhivat!" });
    });
});


// ==========================================
// RUTE ADMIN - GESTIONARE ȘOFERI (CRUD)
// ==========================================

// 1. VIZUALIZARE (Read)
app.get('/api/admin/drivers', (req, res) => {
    const query = 'SELECT id_sofer, nume, telefon, mail, parola, status, cnp, CAST(activ AS UNSIGNED) as activ FROM sofer ORDER BY id_sofer DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error("Eroare la citire șoferi:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// 2. ADĂUGARE (Create)
app.post('/api/admin/drivers', (req, res) => {
    const { nume, telefon, mail, parola, cnp } = req.body;
    // Setăm status 'offline' implicit și activ=1
    const query = 'INSERT INTO sofer (nume, telefon, mail, parola, status, cnp, activ) VALUES (?, ?, ?, ?, "offline", ?, 1)';
    
    db.query(query, [nume, telefon, mail, parola, cnp], (err, result) => {
        if (err) {
            console.error("Eroare la adăugare șofer:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: "Șofer adăugat cu succes!" });
    });
});

// 3. MODIFICARE (Update)
app.put('/api/admin/drivers/:id', (req, res) => {
    const id = req.params.id;
    const { nume, telefon, mail, cnp } = req.body;
    
    const query = 'UPDATE sofer SET nume = ?, telefon = ?, mail = ?, cnp = ? WHERE id_sofer = ?';
    db.query(query, [nume, telefon, mail, cnp, id], (err, result) => {
        if (err) {
            console.error("Eroare la editare șofer:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: "Datele șoferului au fost actualizate!" });
    });
});

// 4. ȘTERGERE LOGICĂ (Delete)
app.delete('/api/admin/drivers/:id', (req, res) => {
    const id = req.params.id;
    const query = 'UPDATE sofer SET activ = 0 WHERE id_sofer = ?';
    
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Eroare la arhivare șofer:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: "Șoferul a fost dezactivat!" });
    });
});
// 5. REACTIVARE ȘOFER (Update activ = 1)
app.put('/api/admin/drivers/:id/activate', (req, res) => {
    const id = req.params.id;
    const query = 'UPDATE sofer SET activ = 1 WHERE id_sofer = ?';
    
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Eroare la reactivare șofer:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: "Șoferul a fost reactivat!" });
    });
});

// ==========================================
// RUTĂ AUTENTIFICARE ADMIN
// ==========================================
app.post('/api/admin/login', (req, res) => {
    const { parola } = req.body;
    
    // Setează aici parola pe care o dorești pentru panoul de admin
    const PAROLA_ADMIN = "admin123";

    if (parola === PAROLA_ADMIN) {
        res.json({ success: true, message: "Autentificare reușită!" });
    } else {
        res.status(401).json({ success: false, message: "Parolă incorectă!" });
    }
});

// RUTĂ ADMIN - DASHBOARD STATISTICI
app.get('/api/admin/dashboard-stats', (req, res) => {
    const query = `
        SELECT 
            (SELECT COUNT(*) FROM client WHERE activ = 1) AS total_clienti,
            (SELECT COUNT(*) FROM sofer WHERE activ = 1) AS total_soferi,
            (SELECT COUNT(*) FROM cursa) AS total_curse,
            (SELECT IFNULL(SUM(pret_final), 0) FROM cursa WHERE pret_final IS NOT NULL) AS venit_total
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Eroare la statistici dashboard:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results[0]); // Returnăm primul rând (singurul)
    });
});


// ==========================================
// RUTE ADMIN - GESTIONARE DISCOUNTURI (Relație N:M)
// ==========================================

// 1. VIZUALIZARE (Aducem toate discounturile)
app.get('/api/admin/discounts', (req, res) => {
    const query = 'SELECT * FROM discount ORDER BY id_discount DESC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. CREARE DISCOUNT NOU
app.post('/api/admin/discounts', (req, res) => {
    const { cod_discount, valoare, data_expirare, tip_valoare } = req.body;
    const query = 'INSERT INTO discount (cod_discount, valoare, data_expirare, tip_valoare) VALUES (?, ?, ?, ?)';
    
    db.query(query, [cod_discount, valoare, data_expirare, tip_valoare], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: "Discount creat cu succes!" });
    });
});

// 3. MAGIA N:M - ALOCĂ UN DISCOUNT UNUI CLIENT
app.post('/api/admin/assign-discount', (req, res) => {
    const { client_id_client, discount_id_discount } = req.body;
    const query = 'INSERT INTO client_has_discount (client_id_client, discount_id_discount) VALUES (?, ?)';
    
    db.query(query, [client_id_client, discount_id_discount], (err, result) => {
        if (err) {
            // Eroare 1062 înseamnă Duplicate Entry (clientul are deja acest discount)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: "Clientul are deja acest discount!" });
            }
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: "Discount alocat clientului cu succes!" });
    });
});


app.listen(PORT, () => {
    console.log(`🚀 Serverul de backend rulează pe http://localhost:${PORT}`);
});

// ruta de creeare cursa client

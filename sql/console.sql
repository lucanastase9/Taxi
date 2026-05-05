/*#############################################################*/
/* PARTEA 1 - STERGEREA SI RECREAREA BAZEI DE DATE      */
/*
-- ALEXANDR;

DROP DATABASE IF EXISTS taxi_service;
CREATE DATABASE taxi_service;
USE taxi_service;
 */

-- LUCA;

DROP DATABASE IF EXISTS taxidb;
CREATE DATABASE taxidb;
USE taxidb;

/*#############################################################*/


/*#############################################################*/
/* PARTEA 2 - CREAREA TABELELOR              */

CREATE TABLE administrativ (
    cnp_angajat VARCHAR(45) PRIMARY KEY,
    nume_prenume VARCHAR(100) NOT NULL,
    functie VARCHAR(45),
    email VARCHAR(100),
    nr_tel VARCHAR(45),
    salariu FLOAT,
    data_angajare DATETIME,
    bonusuri VARCHAR(45)
);

CREATE TABLE tranzactii (
    id_tranzactie INT AUTO_INCREMENT PRIMARY KEY,
    tip VARCHAR(45),
    suma FLOAT NOT NULL,
    data DATETIME,
    descriere MEDIUMTEXT,
    administrativ_cnp_angajat VARCHAR(45),
    FOREIGN KEY (administrativ_cnp_angajat) REFERENCES administrativ(cnp_angajat)
);

CREATE TABLE sofer (
    id_sofer INT AUTO_INCREMENT PRIMARY KEY,
    nume VARCHAR(45) NOT NULL,
    telefon VARCHAR(20),
    mail VARCHAR(100),
    parola VARCHAR(45),
    status VARCHAR(45),
    cnp VARCHAR(15),
    activ BIT(1) DEFAULT 1
);

CREATE TABLE masina (
    sofer_id_sofer INT PRIMARY KEY,
    nr_inmatriculare VARCHAR(45) NOT NULL,
    model VARCHAR(45),
    categorie VARCHAR(45),
    km_parcursi INT,
    culoare VARCHAR(45),
    an_fabricare INT,
    FOREIGN KEY (sofer_id_sofer) REFERENCES sofer(id_sofer) ON DELETE CASCADE
);

CREATE TABLE client (
    id_client INT AUTO_INCREMENT PRIMARY KEY,
    nume VARCHAR(100) NOT NULL,
    nr_tel DOUBLE,
    mail VARCHAR(100) UNIQUE,
    parola VARCHAR(45),
    km_parcursi INT DEFAULT 0,
    adresa VARCHAR(100),
    activ BIT(1) DEFAULT 1
);

CREATE TABLE discount (
    id_discount INT AUTO_INCREMENT PRIMARY KEY,
    cod_discount VARCHAR(45) UNIQUE,
    valoare FLOAT,
    data_expirare DATETIME,
    tip_valoare VARCHAR(45)
);

CREATE TABLE client_has_discount (
    client_id_client INT,
    discount_id_discount INT,
    PRIMARY KEY (client_id_client, discount_id_discount),
    FOREIGN KEY (client_id_client) REFERENCES client(id_client) ON DELETE CASCADE,
    FOREIGN KEY (discount_id_discount) REFERENCES discount(id_discount) ON DELETE CASCADE
);

CREATE TABLE cursa (
    id_cursa INT AUTO_INCREMENT PRIMARY KEY,
    client_id_client INT,
    sofer_id_sofer INT,
    status varchar(45),
    plecare INT,
    destinatie INT,
    data_comanda DATE,
    ora_comanda TIME,
    durata_estimata INT,
    ora_start INT,
    ora_destinatie INT,
    pret_estimat FLOAT,
    pret_final FLOAT,
    distanta FLOAT,
    FOREIGN KEY (client_id_client) REFERENCES client(id_client),
    FOREIGN KEY (sofer_id_sofer) REFERENCES sofer(id_sofer)
);

CREATE TABLE plata (
    cursa_id_cursa INT PRIMARY KEY,
    metoda_plata VARCHAR(45),
    data_ora DATETIME,
    status TINYINT,
    suma FLOAT,
    tips FLOAT,
    tranzactii_id_tranzactie INT,
    FOREIGN KEY (cursa_id_cursa) REFERENCES cursa(id_cursa),
    FOREIGN KEY (tranzactii_id_tranzactie) REFERENCES tranzactii(id_tranzactie)
);

CREATE TABLE card (
    idcard INT AUTO_INCREMENT PRIMARY KEY,
    client_id_client INT,
    plata_cursa_id_cursa INT,
    FOREIGN KEY (client_id_client) REFERENCES client(id_client),
    FOREIGN KEY (plata_cursa_id_cursa) REFERENCES plata(cursa_id_cursa)
);

CREATE TABLE recenzie (
    id_recenzie INT AUTO_INCREMENT PRIMARY KEY,
    sofer_id_sofer INT,
    client_id_client INT,
    rating INT,
    comentarii LONGTEXT,
    tip_autor VARCHAR(45),
    FOREIGN KEY (sofer_id_sofer) REFERENCES sofer(id_sofer),
    FOREIGN KEY (client_id_client) REFERENCES client(id_client)
);

CREATE TABLE certificat (
    id_certificat INT AUTO_INCREMENT PRIMARY KEY,
    sofer_id_sofer INT,
    certificat_tip VARCHAR(45),
    certificat_poza MEDIUMBLOB,
    data_exp_certif DATE,
    FOREIGN KEY (sofer_id_sofer) REFERENCES sofer(id_sofer) ON DELETE CASCADE
);

/*#############################################################*/


/*#############################################################*/
/* PARTEA 3 - INSERAREA INREGISTRARILOR IN TABELE (Manuala)   */

-- 1. Inserare Angajati Administrativ
INSERT INTO administrativ (cnp_angajat, nume_prenume, functie, email, nr_tel, salariu, data_angajare, bonusuri) VALUES
('1900101123456', 'Popa Andrei', 'Manager', 'andrei.popa@taxi.ro', '0722111222', 5000, '2023-01-15 09:00:00', '10%'),
('2950505987654', 'Radu Maria', 'Contabil', 'maria.radu@taxi.ro', '0733444555', 4000, '2023-03-01 10:00:00', '5%');

-- 2. Inserare Clienti
INSERT INTO client (nume, nr_tel, mail, parola, km_parcursi, activ) VALUES
('Popescu Ana', 0722000111, 'ana.popescu@mail.com', 'passA', 120, 1),
('Marin George', 0733111222, 'george.m@mail.com', 'passB', 45, 1),
('Enache Elena', 0744222333, 'elena.e@mail.com', 'passC', 300, 1);

-- 3. Inserare Soferi
INSERT INTO sofer (nume, telefon, mail, parola, status, cnp, activ) VALUES
('Ionescu Vasile', '0744123123', 'vasile@sofer.ro', 'parola1', 'disponibil', '1850202112233', 1),
('Dumitrescu Ion', '0755987987', 'ion@sofer.ro', 'parola2', 'in_cursa', '1880505334455', 1),
('Stan Mihai', '0766112233', 'mihai@sofer.ro', 'parola3', 'offline', '1920808998877', 1);

-- 4. Inserare Masini (Atentie: id_sofer trebuie sa existe deja!)
INSERT INTO masina (sofer_id_sofer, nr_inmatriculare, model, categorie, km_parcursi) VALUES
(1, 'B 101 ABC', 'Dacia Logan', 'Standard', 45000),
(2, 'CJ 20 DEF', 'Skoda Octavia', 'Premium', 80000),
(3, 'TM 33 GHI', 'VW Passat', 'Premium', 120000);

-- 5. Inserare Discounturi
INSERT INTO discount (cod_discount, valoare, data_expirare, tip_valoare) VALUES
('BUNVENIT', 15, '2025-12-31 23:59:59', 'procent'),
('REDUCERE10', 10, '2024-06-01 00:00:00', 'fix');

-- 6. Legatura Client - Discount
INSERT INTO client_has_discount (client_id_client, discount_id_discount) VALUES
(1, 1),
(2, 2);

-- 7. Inserare Curse
INSERT INTO cursa (client_id_client, sofer_id_sofer, plecare, destinatie, data_comanda, ora_comanda, durata_estimata, ora_start, ora_destinatie, pret_estimat, pret_final, distanta) VALUES
(1, 1, 10, 45, '2024-04-10', '14:30:00', 20, 14, 15, 25.5, 25.5, 7.2),
(2, 2, 20, 80, '2024-04-11', '09:00:00', 35, 9, 10, 40.0, 42.0, 12.5),
(3, 1, 5, 15, '2024-04-12', '18:15:00', 15, 18, 18, 18.0, 18.0, 4.5);

-- 8. Inserare Tranzactii (Banii intrati in firma)
INSERT INTO tranzactii (tip, suma, data, descriere, administrativ_cnp_angajat) VALUES
('Incasare Cursa', 25.5, '2024-04-10 15:00:00', 'Incasare card client 1', '2950505987654'),
('Incasare Cursa', 42.0, '2024-04-11 10:00:00', 'Incasare cash client 2', '2950505987654');

-- 9. Inserare Plata (Datele despre achitarea cursei)
INSERT INTO plata (cursa_id_cursa, metoda_plata, data_ora, status, suma, tips, tranzactii_id_tranzactie) VALUES
(1, 'Card', '2024-04-10 15:05:00', 1, 25.5, 5.0, 1),
(2, 'Cash', '2024-04-11 10:05:00', 1, 42.0, 0.0, 2);

-- 10. Inserare Card (Asocierea clientului cu plata din baza de date)
INSERT INTO card (client_id_client, plata_cursa_id_cursa) VALUES
(1, 1);

-- 11. Inserare Recenzii
INSERT INTO recenzie (sofer_id_sofer, client_id_client, rating, comentarii, tip_autor) VALUES
(1, 1, 5, 'Sofer foarte politicos, masina curata.', 'client'),
(2, 2, 4, 'A intarziat putin, dar a condus bine.', 'client'),
(1, 3, 5, 'Client la timp, cursa placuta.', 'sofer');

-- 12. Inserare Certificate Soferi
INSERT INTO certificat (sofer_id_sofer, certificat_tip, certificat_poza, data_exp_certif) VALUES
(1, NULL, NULL, '2026-05-20'),
(2, NULL, NULL,'2025-10-15');

-- testare LUCA;

INSERT INTO sofer (id_sofer, nume, telefon, mail, parola, status, cnp, activ) VALUES
    (99,'sofer', '0744123123', 'sofer@site.test', 'sofer', 'offline', '1850202112233', 1);
INSERT INTO client (id_client,nume, nr_tel, mail, parola, km_parcursi, activ) VALUES
    (99,'client', 0722000111, 'client@site.test', 'client', 120, 1);
INSERT INTO cursa (client_id_client, sofer_id_sofer, status, plecare, destinatie,
                   data_comanda, ora_comanda, durata_estimata, ora_start,
                   ora_destinatie, pret_estimat, pret_final, distanta) VALUES
    (99, 99, 'Waiting Driver', 10,45, '2024-04-10', '14:30:00',
    20, 14, 15, 25.5, 25.5, 7.2);

/*#############################################################*/


/*#############################################################*/
/* PARTEA 4 - VIZUALIZAREA STRUCTURII BD SI A INREGISTRARILOR */

SELECT * FROM client;
SELECT * FROM sofer;
SELECT * FROM masina;
SELECT * FROM cursa;
SELECT * FROM plata;

/*#############################################################*/

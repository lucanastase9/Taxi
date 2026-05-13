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
    nr_tel VARCHAR(20),
    mail VARCHAR(100) UNIQUE,
    parola VARCHAR(45),
    km_parcursi INT DEFAULT 0,
    adresa VARCHAR(100),
    metoda_plata VARCHAR(45),
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
    plecare VARCHAR(255),
    destinatie VARCHAR(255),
    data_comanda DATE,
    ora_comanda TIME,
    ora_start TIME,
    ora_destinatie TIME,
    pret_estimat FLOAT,
    pret_final FLOAT,
    distanta FLOAT,
    categorie VARCHAR(45),
    tips FLOAT DEFAULT 0,
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

-- testare LUCA;

INSERT INTO sofer (id_sofer, nume, telefon, mail, parola, status, cnp, activ) VALUES
    (99,'sofer', '0744123123', 'sofer@site.test', 'sofer', 'offline', '1850202112233', 1);
INSERT INTO client (id_client,nume, nr_tel, mail, parola, km_parcursi, activ) VALUES
    (99,'client', 0722000111, 'client@site.test', 'client', 120, 1);
INSERT INTO cursa (client_id_client, status, plecare, destinatie,
                   data_comanda, ora_comanda, durata_estimata, ora_start,
                   ora_destinatie, pret_estimat, pret_final, distanta) VALUES
    (99, 'Waiting Driver', 10,45, '2024-04-10', '14:30:00',
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

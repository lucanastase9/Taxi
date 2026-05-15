import mysql.connector
from faker import Faker
import random
from datetime import datetime, timedelta

# Inițializăm Faker pentru limba română
fake = Faker('ro_RO')

# ==========================================
# 1. CONFIGURARE CONEXIUNE AIVEN
# ==========================================
db_config = {
    'host': 'taxidb-bordeialexandraioana-taxiservice.j.aivencloud.com', 
    'user': 'avnadmin',
    'password': 'AVNS_fZOrsnR2EPkWWa1tnG0', 
    'database': 'taxidb',
    'port': 11584,
    'ssl_disabled': False
}

print("Conectare la baza de date din Cloud...")
try:
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    print("✅ Conectat cu succes!")
except Exception as e:
    print(f"❌ Eroare de conectare: {e}")
    exit()

# ==========================================
# 2. GENERARE CLIENȚI ȘI ȘOFERI
# ==========================================
print("Generare Clienți...")
for _ in range(15): # Generăm 15 clienți
    nume = fake.name()
    nr_tel = f"07{random.randint(10000000, 99999999)}" # Generează fix 10 cifre    mail = fake.email()
    parola = "parola123"
    mail = fake.email() 
    adresa = fake.address().replace('\n', ', ')
    km = random.randint(0, 500)
    activ = random.choice([0, 1, 1, 1]) # Mai multe șanse să fie activ (1)

    cursor.execute(
        "INSERT INTO client (nume, nr_tel, mail, parola, km_parcursi, adresa, activ) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (nume, nr_tel, mail, parola, km, adresa, activ)
    )

print("Generare Șoferi...")
for _ in range(10): # Generăm 10 șoferi
    nume = fake.name()
    nr_tel = f"07{random.randint(10000000, 99999999)}" # Păstrăm variabila așa
    mail = fake.email()
    parola = "sofer123"
    activ = random.choice([0, 1, 1])
    
    cursor.execute(
        "INSERT INTO sofer (nume, telefon, mail, parola, activ) VALUES (%s, %s, %s, %s, %s)",
        (nume, nr_tel, mail, parola, activ)
    )

conn.commit()

# ==========================================
# 3. EXTRAGERE ID-URI GENERATE PENTRU RELAȚII
# ==========================================
cursor.execute("SELECT id_client FROM client")
clienti_ids = [row[0] for row in cursor.fetchall()]

cursor.execute("SELECT id_sofer FROM sofer")
soferi_ids = [row[0] for row in cursor.fetchall()]

# ==========================================
# 4. GENERARE FLOTĂ AUTO (Doar pentru primii 7 șoferi)
# ==========================================
print("Generare Flotă Auto...")
modele_masini = ['Dacia Logan', 'Renault Clio', 'Skoda Octavia', 'Toyota Corolla', 'VW Passat']
categorii = ['Standard', 'Premium', 'Electric']
culori = ['Alb', 'Negru', 'Argintiu', 'Albastru', 'Roșu']

for sofer_id in soferi_ids[:7]: # Luăm primii 7 șoferi să lăsăm 3 liberi
    nr_inmatriculare = f"B {random.randint(10, 99)} {fake.lexify(text='???').upper()}"
    model = random.choice(modele_masini)
    categorie = random.choice(categorii)
    culoare = random.choice(culori)
    an = random.randint(2018, 2024)
    km_masina = random.randint(1000, 150000)

    cursor.execute(
        "INSERT IGNORE INTO masina (sofer_id_sofer, nr_inmatriculare, model, categorie, km_parcursi, culoare, an_fabricare) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (sofer_id, nr_inmatriculare, model, categorie, km_masina, culoare, an)
    )

conn.commit()
# ==========================================
# 5. GENERARE CURSE (Istoric)
# ==========================================
print("Generare Istoric Curse, Plăți și Recenzii...")
statusuri_curse = ['Finalizat', 'Finalizat', 'Finalizat', 'In curs', 'Anulat']
metode_plata = ['Card', 'Cash', 'Apple Pay']

for _ in range(30): # Generăm 30 de curse
    client_id = random.choice(clienti_ids)
    sofer_id = random.choice(soferi_ids)
    plecare = fake.street_address()
    destinatie = fake.street_address()
    
    # Generăm o dată aleatorie în ultimele 30 de zile
    zile_in_urma = random.randint(0, 30)
    data_comanda = datetime.now() - timedelta(days=zile_in_urma)
    
    status = random.choice(statusuri_curse)
    pret = round(random.uniform(15.0, 120.0), 2) if status != 'Anulat' else 0

    # Inserăm Cursa
    cursor.execute(
        "INSERT INTO cursa (client_id_client, sofer_id_sofer, plecare, destinatie, data_comanda, pret_final, status) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (client_id, sofer_id, plecare, destinatie, data_comanda, pret, status)
    )
    
    # SALVĂM ID-UL CURSEI (Aici crăpa!)
    cursa_id = cursor.lastrowid 

    # Dacă e finalizată, generăm o Plată și o Recenzie
    if status == 'Finalizat':
        # PLATA
        metoda = random.choice(metode_plata)
        cursor.execute(
            "INSERT INTO plata (cursa_id_cursa, suma, metoda_plata, status) VALUES (%s, %s, %s, 1)",
            (cursa_id, pret, metoda)
        )
        
        # RECENZIE
        if random.choice([True, False]):
            rating = random.randint(3, 5) 
            comentarii = fake.sentence() if random.choice([True, False]) else ""
            cursor.execute(
                "INSERT INTO recenzie (client_id_client, sofer_id_sofer, rating, comentarii) VALUES (%s, %s, %s, %s)",
                (client_id, sofer_id, rating, comentarii)
            )

conn.commit()


# ==========================================
# 6. GENERARE RECENZII DEDICATE
# ==========================================
print("Generare Recenzii suplimentare...")

# Listă de feedback-uri realiste în română pentru a ajuta Faker
feedback_pozitiv = [
    "Șofer foarte politicos, mașina curată.",
    "A ajuns foarte repede la destinație.",
    "Muzică bună și atmosferă plăcută.",
    "Conducere preventivă, m-am simțit în siguranță.",
    "Cea mai bună experiență de până acum!"
]

feedback_negativ = [
    "Șoferul a vorbit prea mult la telefon.",
    "Miros neplăcut în mașină.",
    "A ales un traseu mult mai lung.",
    "A întârziat 10 minute la preluare.",
    "Conducere cam agresivă prin oraș."
]

for _ in range(20): # Generăm 20 de recenzii noi
    client_id = random.choice(clienti_ids)
    sofer_id = random.choice(soferi_ids)
    
    # Decidem dacă e o recenzie bună sau proastă
    rating = random.choices([5, 4, 3, 2, 1], weights=[50, 30, 10, 5, 5])[0]
    
    if rating >= 4:
        text = random.choice(feedback_pozitiv)
    elif rating <= 2:
        text = random.choice(feedback_negativ)
    else:
        text = fake.sentence()

    cursor.execute(
        "INSERT INTO recenzie (client_id_client, sofer_id_sofer, rating, comentarii) VALUES (%s, %s, %s, %s)",
        (client_id, sofer_id, rating, text)
    )

conn.commit()
print("✅ Recenziile au fost adăugate!")

# Închidem conexiunea
cursor.close()
conn.close()

print("🎉 Baza de date a fost populată cu succes! Poți verifica panoul de Admin.")
# NutriApp Backend API

FastAPI backend per recuperare e aggiungere dati nutrizionali degli alimenti e gestire pazienti e diete dal database PostgreSQL.

## Struttura del Progetto

```
backend/
├── main.py          # Applicazione FastAPI principale
├── models.py        # Modelli Pydantic per i dati
├── database.py      # Funzioni per la connessione al database
├── config.py        # Configurazione del database
├── requirements.txt # Dipendenze Python
├── test_api.py      # Script di test per l'API
├── test_dieta_api.py # Script di test specifico per le diete
└── README.md        # Questo file
```

## Installazione

1. **Installa le dipendenze:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configurazione del database:**
   Il database è già configurato con le credenziali Neon. Se necessario, modifica `config.py` per cambiare la connessione.

3. **Setup del database:**
   ```bash
   # Crea la tabella pazienti con la colonna dieta
   cd ../db_management
   python3 create_pazienti_table.py
   python3 update_pazienti_table.py
   ```

## Avvio del Server

### Metodo 1: Diretto con Python
```bash
python main.py
```

### Metodo 2: Con Uvicorn
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Il server sarà disponibile su: `http://localhost:8000`

## Endpoints Disponibili

### 1. Root Endpoint
- **GET** `/`
- Descrizione: Informazioni generali sull'API

### 2. Alimenti - Lista
- **GET** `/alimenti`
- Parametri:
  - `limit` (opzionale): Numero massimo di risultati (default: 100, max: 1000)
  - `offset` (opzionale): Numero di risultati da saltare per paginazione (default: 0)
  - `search` (opzionale): Termine di ricerca per il nome dell'alimento

### 3. Alimenti - Crea Nuovo
- **POST** `/alimenti`
- **Campi obbligatori:**
  - `alimento`: Nome dell'alimento (stringa)
- **Campi opzionali:** Tutti gli altri campi nutrizionali possono essere omessi
- **Esempio di payload:**
  ```json
  {
    "alimento": "Mela Golden",
    "sorgente": "Database NutriApp",
    "energia_kcal": 52.0,
    "proteine_totali_g": 0.3,
    "lipidi_totali_g": 0.2,
    "carboidrati_disponibili_g": 14.0,
    "fibra_alimentare_totale_g": 2.4
  }
  ```

### 4. Alimenti - Per ID
- **GET** `/alimenti/{id}`
- Recupera un alimento specifico tramite il suo ID

### 5. Pazienti - Lista
- **GET** `/pazienti`
- Parametri:
  - `limit` (opzionale): Numero massimo di risultati (default: 100, max: 1000)
  - `offset` (opzionale): Numero di risultati da saltare per paginazione (default: 0)
  - `search` (opzionale): Termine di ricerca per nome, cognome o email

### 6. Pazienti - Crea Nuovo
- **POST** `/pazienti`
- **Campi obbligatori:**
  - `nome`: Nome del paziente (stringa)
  - `cognome`: Cognome del paziente (stringa)
- **Campi opzionali:**
  - `eta`: Età del paziente (numero intero)
  - `email`: Email del paziente (stringa)
  - `telefono`: Numero di telefono (stringa)
  - `note`: Note aggiuntive (stringa)
- **Esempio di payload:**
  ```json
  {
    "nome": "Mario",
    "cognome": "Rossi",
    "eta": 35,
    "email": "mario.rossi@email.com",
    "telefono": "+39 123 456 7890",
    "note": "Paziente per dieta dimagrante"
  }
  ```

### 7. Pazienti - Per ID
- **GET** `/pazienti/{id}`
- Recupera un paziente specifico tramite il suo ID

### 8. Pazienti - Aggiorna
- **PUT** `/pazienti/{id}`
- Aggiorna un paziente esistente
- **Tutti i campi sono opzionali** - solo i campi forniti verranno aggiornati
- **Esempio di payload:**
  ```json
  {
    "eta": 36,
    "note": "Paziente per dieta dimagrante - aggiornato"
  }
  ```

### 9. Pazienti - Elimina
- **DELETE** `/pazienti/{id}`
- Elimina un paziente dal database

### 10. Diete - Recupera Dieta
- **GET** `/pazienti/{id}/dieta`
- Recupera la dieta completa di un paziente specifico

### 11. Diete - Aggiorna Dieta Completa
- **PUT** `/pazienti/{id}/dieta`
- Aggiorna l'intera dieta di un paziente
- **Payload:** Oggetto JSON completo con la struttura della dieta

### 12. Diete - Aggiungi Alimento al Pasto
- **POST** `/pazienti/{id}/dieta/{pasto}/alimenti`
- Aggiunge un alimento specifico a un pasto della dieta
- **Parametri:**
  - `id`: ID del paziente
  - `pasto`: Nome del pasto (colazione, spuntino, pranzo, merenda, cena)
- **Esempio di payload:**
  ```json
  {
    "id": 1,
    "nome": "Latte intero",
    "quantita": 200,
    "unita": "ml",
    "kcal": 120,
    "proteine": 6.8,
    "lipidi": 6.4,
    "carboidrati": 9.6,
    "fibre": 0
  }
  ```

### 13. Health Check
- **GET** `/health`
- Verifica lo stato del servizio e della connessione al database

### 14. Documentazione API
- **GET** `/docs`
- Documentazione interattiva Swagger UI

## Struttura dei Dati

### Alimenti
Ogni alimento contiene:
- `id`: ID univoco dell'alimento
- `alimento`: Nome dell'alimento
- `kcal`: Calorie (energia in kcal)
- `proteine`: Proteine totali (g)
- `lipidi`: Lipidi totali (g)
- `carboidrati`: Carboidrati disponibili (g)
- `fibre`: Fibra alimentare totale (g)
- `sorgente`: Fonte dei dati

### Pazienti
Ogni paziente contiene:
- `id`: ID univoco del paziente
- `nome`: Nome del paziente
- `cognome`: Cognome del paziente
- `eta`: Età del paziente
- `email`: Email del paziente
- `telefono`: Numero di telefono
- `note`: Note aggiuntive
- `dieta`: Dati della dieta in formato JSON
- `created_at`: Data di creazione
- `updated_at`: Data dell'ultimo aggiornamento

### Diete
La struttura della dieta è organizzata in JSON con:

#### Struttura Pasto
```json
{
  "alimenti": [
    {
      "id": 1,
      "nome": "Latte intero",
      "quantita": 200,
      "unita": "ml",
      "kcal": 120,
      "proteine": 6.8,
      "lipidi": 6.4,
      "carboidrati": 9.6,
      "fibre": 0
    }
  ],
  "totale_kcal": 120,
  "totale_proteine": 6.8,
  "totale_lipidi": 6.4,
  "totale_carboidrati": 9.6,
  "totale_fibre": 0
}
```

#### Struttura Dieta Completa
```json
{
  "colazione": { /* struttura pasto */ },
  "spuntino": { /* struttura pasto */ },
  "pranzo": { /* struttura pasto */ },
  "merenda": { /* struttura pasto */ },
  "cena": { /* struttura pasto */ },
  "totale_giornaliero": {
    "totale_kcal": 926,
    "totale_proteine": 68.9,
    "totale_lipidi": 20.9,
    "totale_carboidrati": 122.7,
    "totale_fibre": 17.7
  }
}
```

## Esempi di Utilizzo

### Alimenti

#### Recuperare tutti gli alimenti (primi 100)
```bash
curl http://localhost:8000/alimenti
```

#### Cercare alimenti per nome
```bash
curl "http://localhost:8000/alimenti?search=mela&limit=10"
```

#### Recuperare un alimento specifico
```bash
curl http://localhost:8000/alimenti/1
```

#### Creare un nuovo alimento (dati minimi)
```bash
curl -X POST http://localhost:8000/alimenti \
  -H "Content-Type: application/json" \
  -d '{"alimento": "Nuovo Alimento"}'
```

#### Creare un nuovo alimento (dati completi)
```bash
curl -X POST http://localhost:8000/alimenti \
  -H "Content-Type: application/json" \
  -d '{
    "alimento": "Mela Golden",
    "sorgente": "Database NutriApp",
    "energia_kcal": 52.0,
    "proteine_totali_g": 0.3,
    "lipidi_totali_g": 0.2,
    "carboidrati_disponibili_g": 14.0,
    "fibra_alimentare_totale_g": 2.4
  }'
```

### Pazienti

#### Recuperare tutti i pazienti
```bash
curl http://localhost:8000/pazienti
```

#### Cercare pazienti per nome, cognome o email
```bash
curl "http://localhost:8000/pazienti?search=rossi&limit=10"
```

#### Recuperare un paziente specifico
```bash
curl http://localhost:8000/pazienti/1
```

#### Creare un nuovo paziente (dati completi)
```bash
curl -X POST http://localhost:8000/pazienti \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Mario",
    "cognome": "Rossi",
    "eta": 35,
    "email": "mario.rossi@email.com",
    "telefono": "+39 123 456 7890",
    "note": "Paziente per dieta dimagrante"
  }'
```

#### Creare un nuovo paziente (dati minimi)
```bash
curl -X POST http://localhost:8000/pazienti \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Giulia",
    "cognome": "Bianchi"
  }'
```

#### Aggiornare un paziente
```bash
curl -X PUT http://localhost:8000/pazienti/1 \
  -H "Content-Type: application/json" \
  -d '{
    "eta": 36,
    "note": "Paziente per dieta dimagrante - aggiornato"
  }'
```

#### Eliminare un paziente
```bash
curl -X DELETE http://localhost:8000/pazienti/1
```

### Diete

#### Recuperare la dieta di un paziente
```bash
curl http://localhost:8000/pazienti/1/dieta
```

#### Aggiornare l'intera dieta di un paziente
```bash
curl -X PUT http://localhost:8000/pazienti/1/dieta \
  -H "Content-Type: application/json" \
  -d '{
    "dieta": {
      "colazione": {
        "alimenti": [
          {
            "id": 1,
            "nome": "Latte intero",
            "quantita": 200,
            "unita": "ml",
            "kcal": 120,
            "proteine": 6.8,
            "lipidi": 6.4,
            "carboidrati": 9.6,
            "fibre": 0
          }
        ],
        "totale_kcal": 120,
        "totale_proteine": 6.8,
        "totale_lipidi": 6.4,
        "totale_carboidrati": 9.6,
        "totale_fibre": 0
      },
      "spuntino": { "alimenti": [], "totale_kcal": 0, "totale_proteine": 0, "totale_lipidi": 0, "totale_carboidrati": 0, "totale_fibre": 0 },
      "pranzo": { "alimenti": [], "totale_kcal": 0, "totale_proteine": 0, "totale_lipidi": 0, "totale_carboidrati": 0, "totale_fibre": 0 },
      "merenda": { "alimenti": [], "totale_kcal": 0, "totale_proteine": 0, "totale_lipidi": 0, "totale_carboidrati": 0, "totale_fibre": 0 },
      "cena": { "alimenti": [], "totale_kcal": 0, "totale_proteine": 0, "totale_lipidi": 0, "totale_carboidrati": 0, "totale_fibre": 0 },
      "totale_giornaliero": { "totale_kcal": 120, "totale_proteine": 6.8, "totale_lipidi": 6.4, "totale_carboidrati": 9.6, "totale_fibre": 0 }
    }
  }'
```

#### Aggiungere un alimento a un pasto specifico
```bash
curl -X POST http://localhost:8000/pazienti/1/dieta/colazione/alimenti \
  -H "Content-Type: application/json" \
  -d '{
    "id": 2,
    "nome": "Pane integrale",
    "quantita": 50,
    "unita": "g",
    "kcal": 120,
    "proteine": 4.5,
    "lipidi": 1.2,
    "carboidrati": 22.5,
    "fibre": 3.5
  }'
```

## Test dell'API

### Test Completo
Esegui lo script di test per verificare il funzionamento di tutti gli endpoints:

```bash
python test_api.py
```

### Test Specifico per le Diete
Esegui il test specifico per le funzionalità di dieta:

```bash
python test_dieta_api.py
```

Gli script testeranno:
- Endpoint di base e health check
- **Alimenti**: Recupero, ricerca, creazione (dati minimi, completi e parziali)
- **Pazienti**: Recupero, ricerca, creazione, aggiornamento, eliminazione (CRUD completo)
- **Diete**: Recupero, aggiornamento completo, aggiunta alimenti ai pasti

## Gestione degli Errori

L'API restituisce codici di stato HTTP appropriati:
- `200`: Successo
- `400`: Dati di input non validi
- `404`: Risorsa non trovata
- `422`: Dati di input non validi (validazione Pydantic)
- `500`: Errore interno del server
- `503`: Servizio non disponibile

## Note sulla Sicurezza

- In produzione, configurare CORS per limitare gli origin permessi
- Considerare l'implementazione di autenticazione se necessario
- Utilizzare variabili d'ambiente per le credenziali del database

## Campi Opzionali Alimenti

L'API supporta tutti i campi del database. Ecco i principali:

### Campi Nutrizionali Base
- `energia_kcal`: Calorie
- `proteine_totali_g`: Proteine totali
- `lipidi_totali_g`: Lipidi totali
- `carboidrati_disponibili_g`: Carboidrati
- `fibra_alimentare_totale_g`: Fibre

### Vitamine
- `vitamina_a_retinolo_eq_ug`: Vitamina A
- `vitamina_c_mg`: Vitamina C
- `vitamina_d_ug`: Vitamina D
- `vitamina_e_ate_mg`: Vitamina E
- `vitamina_b1_mg`: Vitamina B1
- `vitamina_b2_mg`: Vitamina B2
- `vitamina_b6_mg`: Vitamina B6
- `vitamina_b12_ug`: Vitamina B12

### Minerali
- `ferro_mg`: Ferro
- `calcio_mg`: Calcio
- `sodio_mg`: Sodio
- `potassio_mg`: Potassio
- `fosforo_mg`: Fosforo
- `zinco_mg`: Zinco
- `magnesio_mg`: Magnesio

### E molti altri...

Tutti i campi sono opzionali tranne `alimento`. I campi non specificati saranno impostati a `NULL` nel database.

## Database Tables

L'API gestisce automaticamente la creazione delle tabelle necessarie:

### Tabella `alimenti`
Contiene tutti i dati nutrizionali degli alimenti con oltre 90 colonne per vitamine, minerali, acidi grassi, ecc.

### Tabella `pazienti`
Contiene i dati dei pazienti:
- `id`: Chiave primaria auto-increment
- `nome`: Nome del paziente (obbligatorio)
- `cognome`: Cognome del paziente (obbligatorio)
- `eta`: Età (opzionale)
- `email`: Email (opzionale)
- `telefono`: Telefono (opzionale)
- `note`: Note aggiuntive (opzionale)
- `dieta`: Dati della dieta in formato JSONB (opzionale)
- `created_at`: Timestamp di creazione
- `updated_at`: Timestamp di aggiornamento

## Caratteristiche Avanzate

### Calcolo Automatico dei Totali
L'API calcola automaticamente:
- Totali per ogni pasto (kcal, proteine, lipidi, carboidrati, fibre)
- Totali giornalieri aggregando tutti i pasti
- Aggiornamento automatico quando si aggiungono/rimuovono alimenti

### Validazione Dati
- Validazione automatica dei nomi dei pasti (colazione, spuntino, pranzo, merenda, cena)
- Validazione dei tipi di dati per valori nutrizionali
- Controllo dell'esistenza del paziente prima delle operazioni sulla dieta

### Struttura Flessibile
- Supporto per quantità personalizzate per ogni alimento
- Unità di misura personalizzabili (g, ml, pezzi, ecc.)
- Possibilità di aggiungere alimenti con valori nutrizionali personalizzati 
import psycopg2
from psycopg2.extras import RealDictCursor
from config import DATABASE_URL

def get_db_connection():
    """Get a database connection"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        raise e

def create_pazienti_table():
    """Create the pazienti table if it doesn't exist"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS pazienti (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            cognome VARCHAR(100) NOT NULL,
            eta INTEGER,
            email VARCHAR(255),
            telefono VARCHAR(20),
            note TEXT,
            dieta JSONB DEFAULT '{
                "colazione": {
                    "alimenti": [],
                    "totale_kcal": 0,
                    "totale_proteine": 0,
                    "totale_lipidi": 0,
                    "totale_carboidrati": 0,
                    "totale_fibre": 0
                },
                "spuntino": {
                    "alimenti": [],
                    "totale_kcal": 0,
                    "totale_proteine": 0,
                    "totale_lipidi": 0,
                    "totale_carboidrati": 0,
                    "totale_fibre": 0
                },
                "pranzo": {
                    "alimenti": [],
                    "totale_kcal": 0,
                    "totale_proteine": 0,
                    "totale_lipidi": 0,
                    "totale_carboidrati": 0,
                    "totale_fibre": 0
                },
                "merenda": {
                    "alimenti": [],
                    "totale_kcal": 0,
                    "totale_proteine": 0,
                    "totale_lipidi": 0,
                    "totale_carboidrati": 0,
                    "totale_fibre": 0
                },
                "cena": {
                    "alimenti": [],
                    "totale_kcal": 0,
                    "totale_proteine": 0,
                    "totale_lipidi": 0,
                    "totale_carboidrati": 0,
                    "totale_fibre": 0
                },
                "totale_giornaliero": {
                    "totale_kcal": 0,
                    "totale_proteine": 0,
                    "totale_lipidi": 0,
                    "totale_carboidrati": 0,
                    "totale_fibre": 0
                }
            }'::jsonb,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        cursor.execute(create_table_sql)
        conn.commit()
        print("Table 'pazienti' created successfully or already exists!")
        
    except Exception as e:
        print(f"Error creating pazienti table: {e}")
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

def get_alimenti_data(limit: int = 100, offset: int = 0, search: str = None):
    """
    Retrieve food data from the database
    
    Args:
        limit: Maximum number of records to return
        offset: Number of records to skip
        search: Optional search term for food names
    
    Returns:
        List of dictionaries containing food data
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Base query
        query = """
        SELECT 
            id,
            alimento,
            energia_kcal as kcal,
            proteine_totali_g as proteine,
            lipidi_totali_g as lipidi,
            carboidrati_disponibili_g as carboidrati,
            fibra_alimentare_totale_g as fibre,
            sorgente
        FROM alimenti
        WHERE 1=1
        """
        
        params = []
        
        # Add search filter if provided
        if search:
            query += " AND alimento ILIKE %s"
            params.append(f"%{search}%")
        
        # Add ordering and pagination
        query += " ORDER BY alimento LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        
        return [dict(row) for row in results]
        
    except Exception as e:
        print(f"Error fetching data: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()

def get_alimento_by_id(alimento_id: int):
    """
    Get a specific food item by ID
    
    Args:
        alimento_id: The ID of the food item
    
    Returns:
        Dictionary containing food data or None if not found
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = """
        SELECT 
            id,
            alimento,
            energia_kcal as kcal,
            proteine_totali_g as proteine,
            lipidi_totali_g as lipidi,
            carboidrati_disponibili_g as carboidrati,
            fibra_alimentare_totale_g as fibre,
            sorgente
        FROM alimenti
        WHERE id = %s
        """
        
        cursor.execute(query, (alimento_id,))
        result = cursor.fetchone()
        
        return dict(result) if result else None
        
    except Exception as e:
        print(f"Error fetching alimento by ID: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()

def create_alimento(alimento_data: dict):
    """
    Create a new food item in the database

    Args:
        alimento_data: Dictionary containing food data with optional fields

    Returns:
        Dictionary containing the created food item
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    # Match the required fields from your Pydantic model
    REQUIRED_FIELDS = [
        "alimento", 
        "sorgente", 
        "energia_kcal", 
        "proteine_totali_g", 
        "lipidi_totali_g", 
        "carboidrati_disponibili_g", 
        "fibra_alimentare_totale_g"
    ]
    
    # Initialize valid_data at the top to avoid UnboundLocalError
    valid_data = {}
    
    try:
        # Get all column names from the database (excluding id and created_at)
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'alimenti' 
            AND column_name NOT IN ('id', 'created_at') 
            ORDER BY ordinal_position
        """)
        
        # Fix the KeyError issue - fetchall() returns a list of RealDictRow objects
        db_columns_result = cursor.fetchall()
        db_columns = [row['column_name'] for row in db_columns_result]  # Access by key name, not index
        
        print(f"Available database columns: {db_columns}")
        print(f"Input data keys: {list(alimento_data.keys())}")

        # Filter the input data to only include valid columns
        # Include fields that are not None (0 is a valid value for nutritional data)
        for col in db_columns:
            if col in alimento_data and alimento_data[col] is not None:
                valid_data[col] = alimento_data[col]

        print(f"Valid data after filtering: {valid_data}")

        # Check for required fields
        missing_fields = []
        for field in REQUIRED_FIELDS:
            if field not in valid_data:
                missing_fields.append(field)
            elif isinstance(valid_data[field], str) and not valid_data[field].strip():
                missing_fields.append(field)
        
        if missing_fields:
            raise ValueError(f"I seguenti campi obbligatori mancano o sono vuoti: {', '.join(missing_fields)}")

        # Build the INSERT query dynamically
        columns = list(valid_data.keys())
        placeholders = ', '.join(['%s'] * len(columns))
        column_names = ', '.join(columns)

        insert_query = f"""
        INSERT INTO alimenti ({column_names})
        VALUES ({placeholders})
        RETURNING 
            id,
            alimento,
            energia_kcal,
            proteine_totali_g,
            lipidi_totali_g,
            carboidrati_disponibili_g,
            fibra_alimentare_totale_g,
            sorgente,
            created_at
        """

        print(f"SQL Query: {insert_query}")
        
        # Execute the insert
        values = [valid_data[col] for col in columns]
        print(f"Values to insert: {values}")
        
        cursor.execute(insert_query, values)

        # Get the inserted record
        result = cursor.fetchone()
        conn.commit()
        
        print(f"Insert result: {result}")

        return dict(result) if result else None

    except ValueError as ve:
        # Handle validation errors
        conn.rollback()
        print(f"Validation error: {ve}")
        raise ve
    except Exception as e:
        conn.rollback()
        print(f"Database error creating alimento: {type(e).__name__}: {str(e)}")
        print(f"Exception args: {e.args}")
        print(f"Valid data being inserted: {valid_data}")
        
        # Check if we have the query variables defined
        try:
            print(f"SQL query: {insert_query}")
            print(f"Values: {values}")
        except NameError:
            print("Query variables not yet defined when error occurred")
        
        # Create a more descriptive error message
        error_msg = f"Database error: {type(e).__name__} - {str(e)}"
        raise Exception(error_msg)
    finally:
        cursor.close()
        conn.close()

def get_total_count(search: str = None):
    """
    Get total count of food items
    
    Args:
        search: Optional search term for food names
    
    Returns:
        Total count of matching records
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        query = "SELECT COUNT(*) FROM alimenti WHERE 1=1"
        params = []
        
        if search:
            query += " AND alimento ILIKE %s"
            params.append(f"%{search}%")
        
        cursor.execute(query, params)
        result = cursor.fetchone()
        
        return result[0] if result else 0
        
    except Exception as e:
        print(f"Error getting total count: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()

# Pazienti functions
def get_pazienti_data(limit: int = 100, offset: int = 0, search: str = None):
    """
    Retrieve patients data from the database
    
    Args:
        limit: Maximum number of records to return
        offset: Number of records to skip
        search: Optional search term for patient names
    
    Returns:
        List of dictionaries containing patient data
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Base query
        query = """
        SELECT 
            id,
            nome,
            cognome,
            eta,
            email,
            telefono,
            note,
            dieta,
            created_at,
            updated_at
        FROM pazienti
        WHERE 1=1
        """
        
        params = []
        
        # Add search filter if provided
        if search:
            query += " AND (nome ILIKE %s OR cognome ILIKE %s OR email ILIKE %s)"
            search_term = f"%{search}%"
            params.extend([search_term, search_term, search_term])
        
        # Add ordering and pagination
        query += " ORDER BY cognome, nome LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        
        return [dict(row) for row in results]
        
    except Exception as e:
        print(f"Error fetching pazienti data: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()

def get_paziente_by_id(paziente_id: int):
    """
    Get a specific patient by ID
    
    Args:
        paziente_id: The ID of the patient
    
    Returns:
        Dictionary containing patient data or None if not found
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = """
        SELECT 
            id,
            nome,
            cognome,
            eta,
            email,
            telefono,
            note,
            dieta,
            created_at,
            updated_at
        FROM pazienti
        WHERE id = %s
        """
        
        cursor.execute(query, (paziente_id,))
        result = cursor.fetchone()
        
        return dict(result) if result else None
        
    except Exception as e:
        print(f"Error fetching paziente by ID: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()

def create_paziente(paziente_data: dict):
    """
    Create a new patient in the database
    
    Args:
        paziente_data: Dictionary containing patient data
    
    Returns:
        Dictionary containing the created patient
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = """
        INSERT INTO pazienti (nome, cognome, eta, email, telefono, note)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING 
            id,
            nome,
            cognome,
            eta,
            email,
            telefono,
            note,
            dieta,
            created_at,
            updated_at
        """
        
        values = (
            paziente_data['nome'],
            paziente_data['cognome'],
            paziente_data.get('eta'),
            paziente_data.get('email'),
            paziente_data.get('telefono'),
            paziente_data.get('note')
        )
        
        cursor.execute(query, values)
        result = cursor.fetchone()
        conn.commit()
        
        return dict(result) if result else None
        
    except Exception as e:
        conn.rollback()
        print(f"Error creating paziente: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()

def update_paziente(paziente_id: int, paziente_data: dict):
    """
    Update an existing patient in the database
    
    Args:
        paziente_id: The ID of the patient to update
        paziente_data: Dictionary containing updated patient data
    
    Returns:
        Dictionary containing the updated patient or None if not found
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Build dynamic UPDATE query
        set_clauses = []
        values = []
        
        if 'nome' in paziente_data:
            set_clauses.append("nome = %s")
            values.append(paziente_data['nome'])
        
        if 'cognome' in paziente_data:
            set_clauses.append("cognome = %s")
            values.append(paziente_data['cognome'])
        
        if 'eta' in paziente_data:
            set_clauses.append("eta = %s")
            values.append(paziente_data['eta'])
        
        if 'email' in paziente_data:
            set_clauses.append("email = %s")
            values.append(paziente_data['email'])
        
        if 'telefono' in paziente_data:
            set_clauses.append("telefono = %s")
            values.append(paziente_data['telefono'])
        
        if 'note' in paziente_data:
            set_clauses.append("note = %s")
            values.append(paziente_data['note'])
        
        if not set_clauses:
            raise ValueError("No fields to update")
        
        set_clauses.append("updated_at = CURRENT_TIMESTAMP")
        values.append(paziente_id)
        
        query = f"""
        UPDATE pazienti 
        SET {', '.join(set_clauses)}
        WHERE id = %s
        RETURNING 
            id,
            nome,
            cognome,
            eta,
            email,
            telefono,
            note,
            dieta,
            created_at,
            updated_at
        """
        
        cursor.execute(query, values)
        result = cursor.fetchone()
        conn.commit()
        
        return dict(result) if result else None
        
    except Exception as e:
        conn.rollback()
        print(f"Error updating paziente: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()

def delete_paziente(paziente_id: int):
    """
    Delete a patient from the database
    
    Args:
        paziente_id: The ID of the patient to delete
    
    Returns:
        True if deleted successfully, False if not found
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        query = "DELETE FROM pazienti WHERE id = %s"
        cursor.execute(query, (paziente_id,))
        
        deleted = cursor.rowcount > 0
        conn.commit()
        
        return deleted
        
    except Exception as e:
        conn.rollback()
        print(f"Error deleting paziente: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()

def get_pazienti_total_count(search: str = None):
    """
    Get total count of patients
    
    Args:
        search: Optional search term for patient names
    
    Returns:
        Total count of matching records
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        query = "SELECT COUNT(*) FROM pazienti WHERE 1=1"
        params = []
        
        if search:
            query += " AND (nome ILIKE %s OR cognome ILIKE %s OR email ILIKE %s)"
            search_term = f"%{search}%"
            params.extend([search_term, search_term, search_term])
        
        cursor.execute(query, params)
        result = cursor.fetchone()
        
        return result[0] if result else 0
        
    except Exception as e:
        print(f"Error getting pazienti total count: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()

# Diet functions
def get_dieta_by_paziente_id(paziente_id: int):
    """
    Get diet data for a specific patient
    
    Args:
        paziente_id: The ID of the patient
    
    Returns:
        Dictionary containing diet data or None if not found
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = """
        SELECT dieta
        FROM pazienti
        WHERE id = %s
        """
        
        cursor.execute(query, (paziente_id,))
        result = cursor.fetchone()
        
        return result['dieta'] if result and result['dieta'] else None
        
    except Exception as e:
        print(f"Error fetching dieta by paziente ID: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()

def update_dieta_by_paziente_id(paziente_id: int, dieta_data: dict):
    """
    Update diet data for a specific patient
    
    Args:
        paziente_id: The ID of the patient
        dieta_data: Dictionary containing diet data
    
    Returns:
        Dictionary containing the updated diet data or None if not found
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = """
        UPDATE pazienti 
        SET dieta = %s::jsonb, updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
        RETURNING dieta
        """
        
        cursor.execute(query, (psycopg2.extras.Json(dieta_data), paziente_id))
        result = cursor.fetchone()
        conn.commit()
        
        return result['dieta'] if result else None
        
    except Exception as e:
        conn.rollback()
        print(f"Error updating dieta: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()

def add_alimento_to_pasto(paziente_id: int, pasto_name: str, alimento_data: dict):
    """
    Add a food item to a specific meal for a patient
    
    Args:
        paziente_id: The ID of the patient
        pasto_name: Name of the meal (colazione, spuntino, pranzo, merenda, cena)
        alimento_data: Dictionary containing food data with quantity
    
    Returns:
        Dictionary containing the updated diet data or None if not found
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # First get current diet data
        current_dieta = get_dieta_by_paziente_id(paziente_id)
        if not current_dieta:
            raise ValueError(f"Paziente with ID {paziente_id} not found")
        
        # Add alimento to the specified pasto
        if pasto_name not in current_dieta:
            raise ValueError(f"Invalid pasto name: {pasto_name}")
        
        # Add the alimento to the pasto
        current_dieta[pasto_name]["alimenti"].append(alimento_data)
        
        # Recalculate totals for this pasto
        totale_kcal = sum(alimento["kcal"] for alimento in current_dieta[pasto_name]["alimenti"])
        totale_proteine = sum(alimento["proteine"] for alimento in current_dieta[pasto_name]["alimenti"])
        totale_lipidi = sum(alimento["lipidi"] for alimento in current_dieta[pasto_name]["alimenti"])
        totale_carboidrati = sum(alimento["carboidrati"] for alimento in current_dieta[pasto_name]["alimenti"])
        totale_fibre = sum(alimento["fibre"] for alimento in current_dieta[pasto_name]["alimenti"])
        
        current_dieta[pasto_name]["totale_kcal"] = totale_kcal
        current_dieta[pasto_name]["totale_proteine"] = totale_proteine
        current_dieta[pasto_name]["totale_lipidi"] = totale_lipidi
        current_dieta[pasto_name]["totale_carboidrati"] = totale_carboidrati
        current_dieta[pasto_name]["totale_fibre"] = totale_fibre
        
        # Recalculate daily totals
        pasti = ["colazione", "spuntino", "pranzo", "merenda", "cena"]
        totale_giornaliero_kcal = sum(current_dieta[pasto]["totale_kcal"] for pasto in pasti)
        totale_giornaliero_proteine = sum(current_dieta[pasto]["totale_proteine"] for pasto in pasti)
        totale_giornaliero_lipidi = sum(current_dieta[pasto]["totale_lipidi"] for pasto in pasti)
        totale_giornaliero_carboidrati = sum(current_dieta[pasto]["totale_carboidrati"] for pasto in pasti)
        totale_giornaliero_fibre = sum(current_dieta[pasto]["totale_fibre"] for pasto in pasti)
        
        current_dieta["totale_giornaliero"]["totale_kcal"] = totale_giornaliero_kcal
        current_dieta["totale_giornaliero"]["totale_proteine"] = totale_giornaliero_proteine
        current_dieta["totale_giornaliero"]["totale_lipidi"] = totale_giornaliero_lipidi
        current_dieta["totale_giornaliero"]["totale_carboidrati"] = totale_giornaliero_carboidrati
        current_dieta["totale_giornaliero"]["totale_fibre"] = totale_giornaliero_fibre
        
        # Update the database
        return update_dieta_by_paziente_id(paziente_id, current_dieta)
        
    except Exception as e:
        print(f"Error adding alimento to pasto: {e}")
        raise e
    finally:
        cursor.close()
        conn.close() 
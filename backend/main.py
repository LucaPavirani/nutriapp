from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import Optional
from contextlib import asynccontextmanager
from datetime import datetime
import uvicorn

from models import (
    Alimento, AlimentoResponse, AlimentoCreate, AlimentoCreateResponse,
    Paziente, PazienteResponse, PazienteCreate, PazienteCreateResponse,
    PazienteUpdate, PazienteUpdateResponse, PazienteDeleteResponse,
    DietaUpdate, DietaResponse, ErrorResponse, PazientiWithDieteResponse
)
from database import (
    get_alimenti_data, get_alimento_by_id, get_total_count, create_alimento,
    get_pazienti_data, get_paziente_by_id, get_pazienti_total_count,
    create_paziente, update_paziente, delete_paziente, create_pazienti_table,
    get_dieta_by_paziente_id, update_dieta_by_paziente_id, add_alimento_to_pasto,
    fetch_all_pazienti_with_diete
)
from document_utils import create_diet_document

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database tables on startup"""
    try:
        create_pazienti_table()
        print("Database tables initialized successfully!")
    except Exception as e:
        print(f"Error initializing database tables: {e}")
    yield

# Create FastAPI app
app = FastAPI(
    title="NutriApp API",
    description="API per recuperare e aggiungere dati nutrizionali degli alimenti e gestire pazienti e diete",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    # Allow both development and production origins
    allow_origins=[
        "http://localhost:3000",
        "https://nutriapp-frontend.vercel.app",
        "https://nutriapp-psi.vercel.app",
        # Add your production frontend URL here
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Benvenuto nell'API NutriApp!",
        "endpoints": {
            "alimenti": {
                "GET": "/alimenti",
                "POST": "/alimenti",
                "GET_by_id": "/alimenti/{id}"
            },
            "pazienti": {
                "GET": "/pazienti",
                "POST": "/pazienti",
                "GET_by_id": "/pazienti/{id}",
                "PUT": "/pazienti/{id}",
                "DELETE": "/pazienti/{id}"
            },
            "diete": {
                "GET": "/pazienti/{id}/dieta",
                "PUT": "/pazienti/{id}/dieta",
                "POST": "/pazienti/{id}/dieta/{pasto}/alimenti",
                "GET_all": "/pazienti/diete"
            },
            "docs": "/docs"
        }
    }

# Alimenti endpoints
@app.get("/alimenti", response_model=AlimentoResponse)
async def get_alimenti(
    limit: int = Query(default=100, ge=1, le=1000, description="Numero massimo di risultati"),
    offset: int = Query(default=0, ge=0, description="Numero di risultati da saltare"),
    search: Optional[str] = Query(default=None, description="Termine di ricerca per il nome dell'alimento")
):
    """
    Recupera la lista degli alimenti con informazioni nutrizionali.
    
    - **limit**: Numero massimo di risultati (1-1000)
    - **offset**: Numero di risultati da saltare per la paginazione
    - **search**: Termine opzionale per cercare alimenti per nome
    """
    try:
        # Get data from database
        data = get_alimenti_data(limit=limit, offset=offset, search=search)
        total = get_total_count(search=search)
        
        # Convert to Pydantic models
        alimenti = [Alimento(**item) for item in data]
        
        return AlimentoResponse(
            success=True,
            data=alimenti,
            total=total,
            message=f"Recuperati {len(alimenti)} alimenti su {total} totali"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore nel recupero dei dati: {str(e)}"
        )

@app.post("/alimenti", response_model=AlimentoCreateResponse)
async def create_new_alimento(alimento: AlimentoCreate):
    """
    Aggiunge un nuovo alimento al database.
    
    Puoi inserire solo i campi che conosci, gli altri saranno impostati a NULL.
    Campi obbligatori:
    - **alimento**: Nome dell'alimento
    - **sorgente**: Fonte dei dati
    - **energia_kcal**: Calorie
    - **proteine_totali_g**: Proteine totali
    - **lipidi_totali_g**: Lipidi totali
    - **carboidrati_disponibili_g**: Carboidrati
    - **fibra_alimentare_totale_g**: Fibre
    
    Campi opzionali (esempi):
    - **parte_edibile_percent**: Percentuale parte edibile
    - **energia_kj**: Energia in kilojoule
    - **proteine_animali_g**: Proteine animali
    - etc...
    """
    try:
        print(f"Received data: {alimento.model_dump()}")
        
        # Convert Pydantic model to dict, excluding None values
        alimento_dict = alimento.model_dump(exclude_none=True)
        print(f"Processed data (exclude_none=True): {alimento_dict}")
        
        # Create the alimento in database
        created_alimento = create_alimento(alimento_dict)
        
        if not created_alimento:
            raise HTTPException(
                status_code=500,
                detail="Errore durante la creazione dell'alimento - nessun dato restituito"
            )
        
        return AlimentoCreateResponse(
            success=True,
            data=Alimento(**created_alimento),
            message=f"Alimento '{created_alimento['alimento']}' creato con successo con ID {created_alimento['id']}"
        )
        
    except HTTPException:
        raise
    except ValueError as ve:
        print(f"Validation error in endpoint: {ve}")
        raise HTTPException(
            status_code=400,
            detail=f"Errore di validazione: {str(ve)}"
        )
    except Exception as e:
        print(f"Unexpected error in endpoint: {type(e).__name__}: {str(e)}")
        print(f"Exception args: {e.args}")
        raise HTTPException(
            status_code=500,
            detail=f"Errore nella creazione dell'alimento: {type(e).__name__} - {str(e)}"
        )

@app.get("/alimenti/{alimento_id}", response_model=Alimento)
async def get_alimento(alimento_id: int):
    """
    Recupera un alimento specifico tramite ID.
    
    - **alimento_id**: ID dell'alimento da recuperare
    """
    try:
        alimento_data = get_alimento_by_id(alimento_id)
        
        if not alimento_data:
            raise HTTPException(
                status_code=404,
                detail=f"Alimento con ID {alimento_id} non trovato"
            )
        
        return Alimento(**alimento_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore nel recupero dell'alimento: {str(e)}"
        )

# Pazienti endpoints
@app.get("/pazienti/diete", response_model=PazientiWithDieteResponse)
async def get_all_pazienti_with_diete(
    limit: int = Query(default=100, ge=1, le=1000, description="Numero massimo di risultati"),
    offset: int = Query(default=0, ge=0, description="Numero di risultati da saltare")
):
    """
    Recupera tutti i pazienti con le loro diete.
    
    - **limit**: Numero massimo di risultati (1-1000)
    - **offset**: Numero di risultati da saltare per la paginazione
    """
    try:
        # Get all patients with their diets
        pazienti_with_diete = fetch_all_pazienti_with_diete(limit=limit, offset=offset)
        
        # Convert to Pydantic models
        pazienti = [Paziente(**item) for item in pazienti_with_diete]
        
        return PazientiWithDieteResponse(
            success=True,
            data=pazienti,
            message=f"Recuperati {len(pazienti)} pazienti con le loro diete"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore nel recupero dei pazienti con diete: {str(e)}"
        )

@app.get("/pazienti", response_model=PazienteResponse)
async def get_pazienti(
    limit: int = Query(default=100, ge=1, le=1000, description="Numero massimo di risultati"),
    offset: int = Query(default=0, ge=0, description="Numero di risultati da saltare"),
    search: Optional[str] = Query(default=None, description="Termine di ricerca per nome, cognome o email")
):
    """
    Recupera la lista dei pazienti.
    
    - **limit**: Numero massimo di risultati (1-1000)
    - **offset**: Numero di risultati da saltare per la paginazione
    - **search**: Termine opzionale per cercare pazienti per nome, cognome o email
    """
    try:
        # Get data from database
        data = get_pazienti_data(limit=limit, offset=offset, search=search)
        total = get_pazienti_total_count(search=search)
        
        # Convert to Pydantic models
        pazienti = [Paziente(**item) for item in data]
        
        return PazienteResponse(
            success=True,
            data=pazienti,
            total=total,
            message=f"Recuperati {len(pazienti)} pazienti su {total} totali"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore nel recupero dei pazienti: {str(e)}"
        )

@app.post("/pazienti", response_model=PazienteCreateResponse)
async def create_new_paziente(paziente: PazienteCreate):
    """
    Aggiunge un nuovo paziente al database.
    
    Campi obbligatori:
    - **nome**: Nome del paziente
    - **cognome**: Cognome del paziente
    
    Campi opzionali:
    - **eta**: Età del paziente
    - **email**: Email del paziente
    - **telefono**: Numero di telefono
    - **note**: Note aggiuntive
    """
    try:
        # Convert Pydantic model to dict
        paziente_dict = paziente.model_dump()
        
        # Create the paziente in database
        created_paziente = create_paziente(paziente_dict)
        
        if not created_paziente:
            raise HTTPException(
                status_code=500,
                detail="Errore durante la creazione del paziente"
            )
        
        return PazienteCreateResponse(
            success=True,
            data=Paziente(**created_paziente),
            message=f"Paziente '{created_paziente['nome']} {created_paziente['cognome']}' creato con successo con ID {created_paziente['id']}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore nella creazione del paziente: {str(e)}"
        )

@app.get("/pazienti/{paziente_id}", response_model=Paziente)
async def get_paziente(paziente_id: int):
    """
    Recupera un paziente specifico tramite ID.
    
    - **paziente_id**: ID del paziente da recuperare
    """
    try:
        paziente_data = get_paziente_by_id(paziente_id)
        
        if not paziente_data:
            raise HTTPException(
                status_code=404,
                detail=f"Paziente con ID {paziente_id} non trovato"
            )
        
        return Paziente(**paziente_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore nel recupero del paziente: {str(e)}"
        )

@app.put("/pazienti/{paziente_id}", response_model=PazienteUpdateResponse)
async def update_existing_paziente(paziente_id: int, paziente: PazienteUpdate):
    """
    Aggiorna un paziente esistente nel database.
    
    - **paziente_id**: ID del paziente da aggiornare
    
    Tutti i campi sono opzionali. Solo i campi forniti verranno aggiornati.
    """
    try:
        # Convert Pydantic model to dict, excluding None values
        paziente_dict = paziente.model_dump(exclude_none=True)
        
        if not paziente_dict:
            raise HTTPException(
                status_code=400,
                detail="Nessun campo da aggiornare fornito"
            )
        
        # Update the paziente in database
        updated_paziente = update_paziente(paziente_id, paziente_dict)
        
        if not updated_paziente:
            raise HTTPException(
                status_code=404,
                detail=f"Paziente con ID {paziente_id} non trovato"
            )
        
        return PazienteUpdateResponse(
            success=True,
            data=Paziente(**updated_paziente),
            message=f"Paziente '{updated_paziente['nome']} {updated_paziente['cognome']}' aggiornato con successo"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore nell'aggiornamento del paziente: {str(e)}"
        )

@app.delete("/pazienti/{paziente_id}", response_model=PazienteDeleteResponse)
async def delete_existing_paziente(paziente_id: int):
    """
    Elimina un paziente dal database.
    
    - **paziente_id**: ID del paziente da eliminare
    """
    try:
        # First check if paziente exists
        paziente_data = get_paziente_by_id(paziente_id)
        
        if not paziente_data:
            raise HTTPException(
                status_code=404,
                detail=f"Paziente con ID {paziente_id} non trovato"
            )
        
        # Delete the paziente
        deleted = delete_paziente(paziente_id)
        
        if not deleted:
            raise HTTPException(
                status_code=500,
                detail="Errore durante l'eliminazione del paziente"
            )
        
        return PazienteDeleteResponse(
            success=True,
            message=f"Paziente '{paziente_data['nome']} {paziente_data['cognome']}' eliminato con successo"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore nell'eliminazione del paziente: {str(e)}"
        )

# Diet endpoints
@app.get("/pazienti/{paziente_id}/dieta", response_model=DietaResponse)
async def get_paziente_dieta(paziente_id: int):
    """
    Recupera la dieta di un paziente specifico.
    
    - **paziente_id**: ID del paziente
    """
    try:
        # First check if paziente exists
        paziente_data = get_paziente_by_id(paziente_id)
        
        if not paziente_data:
            raise HTTPException(
                status_code=404,
                detail=f"Paziente con ID {paziente_id} non trovato"
            )
        
        # Get diet data
        dieta_data = get_dieta_by_paziente_id(paziente_id)
        
        if not dieta_data:
            raise HTTPException(
                status_code=404,
                detail=f"Dieta non trovata per il paziente con ID {paziente_id}"
            )
        
        return DietaResponse(
            success=True,
            data=dieta_data,
            message=f"Dieta recuperata con successo per {paziente_data['nome']} {paziente_data['cognome']}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore nel recupero della dieta: {str(e)}"
        )

@app.put("/pazienti/{paziente_id}/dieta", response_model=DietaResponse)
async def update_paziente_dieta(paziente_id: int, dieta_update: DietaUpdate):
    """
    Aggiorna la dieta di un paziente specifico.
    
    - **paziente_id**: ID del paziente
    - **dieta**: Dati completi della dieta in formato JSON
    """
    try:
        # First check if paziente exists
        paziente_data = get_paziente_by_id(paziente_id)
        
        if not paziente_data:
            raise HTTPException(
                status_code=404,
                detail=f"Paziente con ID {paziente_id} non trovato"
            )
        
        # Update diet data
        updated_dieta = update_dieta_by_paziente_id(paziente_id, dieta_update.dieta)
        
        if not updated_dieta:
            raise HTTPException(
                status_code=500,
                detail="Errore durante l'aggiornamento della dieta"
            )
        
        return DietaResponse(
            success=True,
            data=updated_dieta,
            message=f"Dieta aggiornata con successo per {paziente_data['nome']} {paziente_data['cognome']}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore nell'aggiornamento della dieta: {str(e)}"
        )

@app.post("/pazienti/{paziente_id}/dieta/{pasto}/alimenti", response_model=DietaResponse)
async def add_alimento_to_paziente_pasto(
    paziente_id: int, 
    pasto: str, 
    alimento_data: dict
):
    """
    Aggiunge un alimento a un pasto specifico della dieta di un paziente.
    
    - **paziente_id**: ID del paziente
    - **pasto**: Nome del pasto (colazione, spuntino, pranzo, merenda, cena)
    - **alimento_data**: Dati dell'alimento con quantità e valori nutrizionali
    
    Esempio di alimento_data:
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
    """
    try:
        # Validate pasto name
        valid_pasti = ["colazione", "spuntino", "pranzo", "merenda", "cena"]
        if pasto not in valid_pasti:
            raise HTTPException(
                status_code=400,
                detail=f"Nome pasto non valido. Deve essere uno di: {', '.join(valid_pasti)}"
            )
        
        # First check if paziente exists
        paziente_data = get_paziente_by_id(paziente_id)
        
        if not paziente_data:
            raise HTTPException(
                status_code=404,
                detail=f"Paziente con ID {paziente_id} non trovato"
            )
        
        # Validate alimento_data
        required_fields = ["id", "nome", "quantita", "unita", "kcal", "proteine", "lipidi", "carboidrati", "fibre"]
        missing_fields = [field for field in required_fields if field not in alimento_data]
        
        if missing_fields:
            raise HTTPException(
                status_code=400,
                detail=f"Campi obbligatori mancanti nei dati dell'alimento: {', '.join(missing_fields)}"
            )
        
        # Validate numeric fields
        numeric_fields = ["quantita", "kcal", "proteine", "lipidi", "carboidrati", "fibre"]
        for field in numeric_fields:
            try:
                # Check if field is None or empty
                if alimento_data[field] is None:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Il campo '{field}' non può essere vuoto"
                    )
                
                value = float(alimento_data[field])
                # Update with the converted float value
                alimento_data[field] = value
            except (ValueError, TypeError):
                raise HTTPException(
                    status_code=400,
                    detail=f"Il campo '{field}' deve essere un numero valido"
                )
        
        # Add alimento to pasto
        updated_dieta = add_alimento_to_pasto(paziente_id, pasto, alimento_data)
        
        if not updated_dieta:
            raise HTTPException(
                status_code=500,
                detail="Errore durante l'aggiunta dell'alimento al pasto"
            )
        
        return DietaResponse(
            success=True,
            data=updated_dieta,
            message=f"Alimento '{alimento_data['nome']}' aggiunto con successo al {pasto} di {paziente_data['nome']} {paziente_data['cognome']}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore nell'aggiunta dell'alimento al pasto: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        get_total_count()
        get_pazienti_total_count()
        return {
            "status": "healthy", 
            "database": "connected", 
            "tables": ["alimenti", "pazienti"],
            "timestamp": datetime.now().isoformat()
        }
    except ConnectionError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Database connection error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Service unhealthy: {type(e).__name__} - {str(e)}"
        )

# Export diet to Word document

@app.get("/pazienti/{paziente_id}/dieta/export")
async def export_diet_to_word(paziente_id: int, t: str = None):  # t parameter to prevent caching
    """
    Export a patient's diet to a Word document.
    
    Args:
        paziente_id: ID of the patient
        
    Returns:
        Word document as a downloadable file
    """
    try:
        # First check if paziente exists
        paziente_data = get_paziente_by_id(paziente_id)
        
        if not paziente_data:
            raise HTTPException(
                status_code=404,
                detail=f"Paziente con ID {paziente_id} non trovato"
            )
        
        # Get diet data
        dieta_data = get_dieta_by_paziente_id(paziente_id)
        
        if not dieta_data:
            raise HTTPException(
                status_code=404,
                detail=f"Dieta non trovata per il paziente con ID {paziente_id}"
            )
            
        
        # Generate Word document
        doc_stream = create_diet_document(paziente_data, dieta_data)
        
        # Return document as downloadable file
        filename = f"Piano_Nutrizionale_{paziente_data['nome']}_{paziente_data['cognome']}.docx"
        
        return StreamingResponse(
            doc_stream,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Errore nell'esportazione della dieta: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 
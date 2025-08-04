from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class Alimento(BaseModel):
    """Food item model with nutritional information"""
    id: int
    alimento: str
    kcal: Optional[float] = None
    proteine: Optional[float] = None
    lipidi: Optional[float] = None
    carboidrati: Optional[float] = None
    fibre: Optional[float] = None
    sorgente: Optional[str] = None

    class Config:
        from_attributes = True

class AlimentoCreate(BaseModel):
    """Model for creating new food items with required and optional fields"""
    alimento: str = Field(..., description="Nome dell'alimento")
    sorgente: Optional[str] = Field(None, description="Fonte dei dati")
    energia_kcal: Optional[float] = Field(None, description="Calorie")
    proteine_totali_g: Optional[float] = Field(None, description="Proteine totali")
    lipidi_totali_g: Optional[float] = Field(None, description="Lipidi totali")
    carboidrati_disponibili_g: Optional[float] = Field(None, description="Carboidrati disponibili")
    fibra_alimentare_totale_g: Optional[float] = Field(None, description="Fibra alimentare totale")
    parte_edibile_percent: Optional[float] = None
    energia_kj: Optional[float] = None
    proteine_animali_g: Optional[float] = None
    proteine_vegetali_g: Optional[float] = None
    lipidi_animali_g: Optional[float] = None
    lipidi_vegetali_g: Optional[float] = None
    colesterolo_mg: Optional[float] = None
    amido_g: Optional[float] = None
    carboidrati_solubili_g: Optional[float] = None
    alcol_g: Optional[float] = None
    acqua_g: Optional[float] = None
    ferro_mg: Optional[float] = None
    calcio_mg: Optional[float] = None
    sodio_mg: Optional[float] = None
    potassio_mg: Optional[float] = None
    fosforo_mg: Optional[float] = None
    zinco_mg: Optional[float] = None
    magnesio_mg: Optional[float] = None
    rame_mg: Optional[float] = None
    selenio_ug: Optional[float] = None
    cloro_mg: Optional[float] = None
    iodio_ug: Optional[float] = None
    manganese_mg: Optional[float] = None
    zolfo_mg: Optional[float] = None
    vitamina_b1_mg: Optional[float] = None
    vitamina_b2_mg: Optional[float] = None
    vitamina_c_mg: Optional[float] = None
    niacina_mg: Optional[float] = None
    vitamina_b6_mg: Optional[float] = None
    folati_totali_ug: Optional[float] = None
    acido_pantotenico_mg: Optional[float] = None
    biotina_ug: Optional[float] = None
    vitamina_b12_ug: Optional[float] = None
    vitamina_a_retinolo_eq_ug: Optional[float] = None
    retinolo_ug: Optional[float] = None
    beta_carotene_eq_ug: Optional[float] = None
    vitamina_e_ate_mg: Optional[float] = None
    vitamina_d_ug: Optional[float] = None
    vitamina_k_ug: Optional[float] = None
    acidi_grassi_saturi_totali_g: Optional[float] = None
    acidi_grassi_c4_c10_g: Optional[float] = None
    acido_laurico_g: Optional[float] = None
    acido_miristico_g: Optional[float] = None
    acido_palmitico_g: Optional[float] = None
    acido_stearico_g: Optional[float] = None
    acido_arachidico_g: Optional[float] = None
    acido_beenico_g: Optional[float] = None
    acidi_grassi_monoinsaturi_totali_g: Optional[float] = None
    acido_miristoleico_g: Optional[float] = None
    acido_palmitoleico_g: Optional[float] = None
    acido_oleico_g: Optional[float] = None
    acido_eicosenoico_g: Optional[float] = None
    acido_erucico_g: Optional[float] = None
    acidi_grassi_polinsaturi_totali_g: Optional[float] = None
    acido_linoleico_g: Optional[float] = None
    acido_linolenico_g: Optional[float] = None
    acido_arachidonico_g: Optional[float] = None
    acido_eicosapentaenoico_g: Optional[float] = None
    acido_docosaesaenoico_g: Optional[float] = None
    altri_acidi_grassi_polinsaturi_g: Optional[float] = None
    triptofano_mg: Optional[float] = None
    treonina_mg: Optional[float] = None
    isoleucina_mg: Optional[float] = None
    leucina_mg: Optional[float] = None
    lisina_mg: Optional[float] = None
    metionina_mg: Optional[float] = None
    cistina_mg: Optional[float] = None
    fenilalanina_mg: Optional[float] = None
    tirosina_mg: Optional[float] = None
    valina_mg: Optional[float] = None
    arginina_mg: Optional[float] = None
    istidina_mg: Optional[float] = None
    alanina_mg: Optional[float] = None
    acido_aspartico_mg: Optional[float] = None
    acido_glutammico_mg: Optional[float] = None
    glicina_mg: Optional[float] = None
    prolina_mg: Optional[float] = None
    serina_mg: Optional[float] = None
    glucosio_g: Optional[float] = None
    fruttosio_g: Optional[float] = None
    galattosio_g: Optional[float] = None
    saccarosio_g: Optional[float] = None
    maltosio_g: Optional[float] = None
    lattosio_g: Optional[float] = None

# Diet models
class AlimentoDieta(BaseModel):
    """Food item in diet with quantity and nutritional info"""
    id: int
    nome: str
    quantita: float
    unita: str
    kcal: float
    proteine: float
    lipidi: float
    carboidrati: float
    fibre: float

class Pasto(BaseModel):
    """Meal model with foods and totals"""
    alimenti: List[AlimentoDieta]
    totale_kcal: float
    totale_proteine: float
    totale_lipidi: float
    totale_carboidrati: float
    totale_fibre: float

class TotaleGiornaliero(BaseModel):
    """Daily totals model"""
    totale_kcal: float
    totale_proteine: float
    totale_lipidi: float
    totale_carboidrati: float
    totale_fibre: float

class Dieta(BaseModel):
    """Complete diet model"""
    colazione: Pasto
    spuntino: Pasto
    pranzo: Pasto
    merenda: Pasto
    cena: Pasto
    totale_giornaliero: TotaleGiornaliero

# Pazienti models
class Paziente(BaseModel):
    """Patient model"""
    id: int
    nome: str
    cognome: str
    eta: Optional[int] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    note: Optional[str] = None
    dieta: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PazienteCreate(BaseModel):
    """Model for creating new patients"""
    nome: str
    cognome: str
    eta: Optional[int] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    note: Optional[str] = None

class PazienteUpdate(BaseModel):
    """Model for updating patients with optional fields"""
    nome: Optional[str] = None
    cognome: Optional[str] = None
    eta: Optional[int] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    note: Optional[str] = None

class DietaUpdate(BaseModel):
    """Model for updating diet data"""
    dieta: Dict[str, Any]

class AlimentoResponse(BaseModel):
    """Response model for food items"""
    success: bool
    data: list[Alimento]
    total: int
    message: Optional[str] = None

class AlimentoCreateResponse(BaseModel):
    """Response model for creating food items"""
    success: bool
    data: Alimento
    message: str

class PazienteResponse(BaseModel):
    """Response model for patient items"""
    success: bool
    data: list[Paziente]
    total: int
    message: Optional[str] = None

class PazienteCreateResponse(BaseModel):
    """Response model for creating patients"""
    success: bool
    data: Paziente
    message: str

class PazienteUpdateResponse(BaseModel):
    """Response model for updating patients"""
    success: bool
    data: Paziente
    message: str

class PazienteDeleteResponse(BaseModel):
    """Response model for deleting patients"""
    success: bool
    message: str

class DietaResponse(BaseModel):
    """Response model for diet data"""
    success: bool
    data: Dict[str, Any]
    message: str

class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = False
    error: str
    message: str 
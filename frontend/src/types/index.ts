// Alimento types
export interface Alimento {
  id: number;
  alimento: string;
  kcal: number | null;
  proteine: number | null;
  lipidi: number | null;
  carboidrati: number | null;
  fibre: number | null;
  sorgente: string | null;
}

export interface AlimentoResponse {
  success: boolean;
  data: Alimento[];
  total: number;
  message?: string;
}

export interface AlimentoCreate {
  alimento: string;
  sorgente?: string;
  energia_kcal?: number;
  proteine_totali_g?: number;
  lipidi_totali_g?: number;
  carboidrati_disponibili_g?: number;
  fibra_alimentare_totale_g?: number;
}

// Diet types
export interface AlimentoDieta {
  id: number;
  nome: string;
  quantita: number;
  unita: string;
  kcal: number;
  proteine: number;
  lipidi: number;
  carboidrati: number;
  fibre: number;
  tipo: 'principale' | 'equivalente';
  parentId?: number; // ID of the parent alimento (for equivalenti)
  equivalenti?: AlimentoDieta[]; // Array of equivalent options
  selected?: boolean; // Whether this equivalent is selected
}

export interface Pasto {
  alimenti: AlimentoDieta[];
  totale_kcal: number;
  totale_proteine: number;
  totale_lipidi: number;
  totale_carboidrati: number;
  totale_fibre: number;
  note?: string;
}

export interface TotaleGiornaliero {
  totale_kcal: number;
  totale_proteine: number;
  totale_lipidi: number;
  totale_carboidrati: number;
  totale_fibre: number;
}

export interface Dieta {
  colazione: Pasto;
  spuntino: Pasto;
  pranzo: Pasto;
  merenda: Pasto;
  cena: Pasto;
  totale_giornaliero: TotaleGiornaliero;
  note?: string;
}

export interface DietaResponse {
  success: boolean;
  data: Dieta;
  message: string;
}

// Patient types
export interface Paziente {
  id: number;
  nome: string;
  cognome: string;
  eta?: number | null;
  email?: string | null;
  telefono?: string | null;
  note?: string | null;
  dieta?: Dieta | null;
  created_at: string;
  updated_at: string;
}

export interface PazienteResponse {
  success: boolean;
  data: Paziente[];
  total: number;
  message?: string;
}

export interface PazienteCreate {
  nome: string;
  cognome: string;
  eta?: number;
  email?: string;
  telefono?: string;
  note?: string;
}

export interface PazienteUpdate {
  nome?: string;
  cognome?: string;
  eta?: number | null;
  email?: string | null;
  telefono?: string | null;
  note?: string | null;
}

import axios from 'axios';
import { 
  Alimento, AlimentoResponse, AlimentoCreate,
  Paziente, PazienteResponse, PazienteCreate, PazienteUpdate,
  Dieta, DietaResponse, AlimentoDieta
} from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Alimenti API
export const alimentiApi = {
  getAlimenti: async (limit = 100, offset = 0, search?: string): Promise<AlimentoResponse> => {
    const params = { limit, offset, ...(search && { search }) };
    const response = await api.get('/alimenti', { params });
    return response.data;
  },

  getAlimentoById: async (id: number): Promise<Alimento> => {
    const response = await api.get(`/alimenti/${id}`);
    return response.data;
  },

  createAlimento: async (alimento: AlimentoCreate): Promise<Alimento> => {
    const response = await api.post('/alimenti', alimento);
    return response.data.data;
  },
};

// Pazienti API
export const pazientiApi = {
  getPazienti: async (limit = 100, offset = 0, search?: string): Promise<PazienteResponse> => {
    const params = { limit, offset, ...(search && { search }) };
    const response = await api.get('/pazienti', { params });
    return response.data;
  },

  getPazienteById: async (id: number): Promise<Paziente> => {
    const response = await api.get(`/pazienti/${id}`);
    return response.data;
  },

  createPaziente: async (paziente: PazienteCreate): Promise<Paziente> => {
    const response = await api.post('/pazienti', paziente);
    return response.data.data;
  },

  updatePaziente: async (id: number, paziente: PazienteUpdate): Promise<Paziente> => {
    const response = await api.put(`/pazienti/${id}`, paziente);
    return response.data.data;
  },

  deletePaziente: async (id: number): Promise<void> => {
    await api.delete(`/pazienti/${id}`);
  },
};

// Dieta API
export const dietaApi = {
  getDieta: async (pazienteId: number): Promise<Dieta> => {
    const response = await api.get(`/pazienti/${pazienteId}/dieta`);
    return response.data.data;
  },

  updateDieta: async (pazienteId: number, dieta: Dieta): Promise<Dieta> => {
    const response = await api.put(`/pazienti/${pazienteId}/dieta`, { dieta });
    return response.data.data;
  },

  addAlimentoToPasto: async (
    pazienteId: number, 
    pasto: string, 
    alimento: AlimentoDieta
  ): Promise<Dieta> => {
    const response = await api.post(
      `/pazienti/${pazienteId}/dieta/${pasto}/alimenti`, 
      alimento
    );
    return response.data.data;
  },
  
  exportDietaToWord: (pazienteId: number): string => {
    return `${API_URL}/pazienti/${pazienteId}/dieta/export`;
  },
};

export default {
  alimentiApi,
  pazientiApi,
  dietaApi,
};

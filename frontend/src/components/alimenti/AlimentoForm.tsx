import React, { useState } from 'react';
import {
  Box, TextField, Button, CircularProgress
} from '@mui/material';
import { AlimentoCreate } from '../../types';

interface AlimentoFormProps {
  onSave: (alimento: AlimentoCreate) => Promise<void>;
}

const AlimentoForm: React.FC<AlimentoFormProps> = ({ onSave }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AlimentoCreate>({
    alimento: '',
    sorgente: 'Inserimento manuale',
    energia_kcal: undefined,
    proteine_totali_g: undefined,
    lipidi_totali_g: undefined,
    carboidrati_disponibili_g: undefined,
    fibra_alimentare_totale_g: undefined,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name !== 'alimento' && name !== 'sorgente' ? 
        (value ? parseFloat(value) : undefined) : 
        value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await onSave(formData);
      setFormData({
        alimento: '',
        sorgente: 'Inserimento manuale',
        energia_kcal: undefined,
        proteine_totali_g: undefined,
        lipidi_totali_g: undefined,
        carboidrati_disponibili_g: undefined,
        fibra_alimentare_totale_g: undefined,
      });
    } catch (error) {
      console.error('Error saving alimento:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              required
              sx={{ flex: '1 1 45%', minWidth: '250px' }}
              label="Nome Alimento"
              name="alimento"
              value={formData.alimento}
              onChange={handleChange}
              variant="outlined"
            />
            <TextField
              sx={{ flex: '1 1 45%', minWidth: '250px' }}
              label="Sorgente"
              name="sorgente"
              value={formData.sorgente}
              onChange={handleChange}
              variant="outlined"
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              required
              sx={{ flex: '1 1 30%', minWidth: '200px' }}
              label="Energia (kcal)"
              name="energia_kcal"
              type="number"
              value={formData.energia_kcal || ''}
              onChange={handleChange}
              variant="outlined"
              inputProps={{ step: 0.1 }}
            />
            <TextField
              required
              sx={{ flex: '1 1 30%', minWidth: '200px' }}
              label="Proteine (g)"
              name="proteine_totali_g"
              type="number"
              value={formData.proteine_totali_g || ''}
              onChange={handleChange}
              variant="outlined"
              inputProps={{ step: 0.1 }}
            />
            <TextField
              required
              sx={{ flex: '1 1 30%', minWidth: '200px' }}
              label="Lipidi (g)"
              name="lipidi_totali_g"
              type="number"
              value={formData.lipidi_totali_g || ''}
              onChange={handleChange}
              variant="outlined"
              inputProps={{ step: 0.1 }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              required
              sx={{ flex: '1 1 45%', minWidth: '250px' }}
              label="Carboidrati (g)"
              name="carboidrati_disponibili_g"
              type="number"
              value={formData.carboidrati_disponibili_g || ''}
              onChange={handleChange}
              variant="outlined"
              inputProps={{ step: 0.1 }}
            />
            <TextField
              required
              sx={{ flex: '1 1 45%', minWidth: '250px' }}
              label="Fibre (g)"
              name="fibra_alimentare_totale_g"
              type="number"
              value={formData.fibra_alimentare_totale_g || ''}
              onChange={handleChange}
              variant="outlined"
              inputProps={{ step: 0.1 }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving || !formData.alimento || !formData.energia_kcal}
            >
              {saving ? <CircularProgress size={24} /> : 'Salva'}
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default AlimentoForm;

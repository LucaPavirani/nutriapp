import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, 
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { pazientiApi } from '../../services/api';
import { PazienteCreate, PazienteUpdate } from '../../types';

interface PatientFormProps {
  isEdit?: boolean;
}

const PatientForm: React.FC<PatientFormProps> = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PazienteCreate | PazienteUpdate>({
    nome: '',
    cognome: '',
    eta: undefined,
    email: '',
    telefono: '',
    note: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchPatient = async () => {
        setLoading(true);
        try {
          const patient = await pazientiApi.getPazienteById(parseInt(id));
          setFormData({
            nome: patient.nome,
            cognome: patient.cognome,
            eta: patient.eta,
            email: patient.email || '',
            telefono: patient.telefono || '',
            note: patient.note || '',
          });
        } catch (error) {
          console.error('Error fetching patient:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchPatient();
    }
  }, [isEdit, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'eta' ? (value ? parseInt(value) : null) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (isEdit && id) {
        await pazientiApi.updatePaziente(parseInt(id), formData);
      } else {
        await pazientiApi.createPaziente(formData as PazienteCreate);
      }
      navigate('/patients');
    } catch (error) {
      console.error('Error saving patient:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {isEdit ? 'Modifica Paziente' : 'Nuovo Paziente'}
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                required
                sx={{ flex: '1 1 45%', minWidth: '250px' }}
                label="Nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                variant="outlined"
              />
              <TextField
                required
                sx={{ flex: '1 1 45%', minWidth: '250px' }}
                label="Cognome"
                name="cognome"
                value={formData.cognome}
                onChange={handleChange}
                variant="outlined"
              />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                sx={{ flex: '1 1 30%', minWidth: '250px' }}
                label="Età"
                name="eta"
                type="number"
                value={formData.eta || ''}
                onChange={handleChange}
                variant="outlined"
                inputProps={{ min: 0, max: 120 }}
              />
              <TextField
                sx={{ flex: '1 1 30%', minWidth: '250px' }}
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
              />
              <TextField
                sx={{ flex: '1 1 30%', minWidth: '250px' }}
                label="Telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                variant="outlined"
              />
            </Box>
            <TextField
              fullWidth
              label="Note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={4}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/patients')}
              >
                Annulla
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={saving || !formData.nome || !formData.cognome}
              >
                {saving ? <CircularProgress size={24} /> : (isEdit ? 'Aggiorna' : 'Salva')}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default PatientForm;

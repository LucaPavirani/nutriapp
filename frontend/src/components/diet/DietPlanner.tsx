import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, CircularProgress,
  Divider, TextField
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Dieta, Paziente, Pasto } from '../../types';
import { pazientiApi, dietaApi } from '../../services/api';
import MealSection from './MealSection';
import { calculateDailyTotals, calculateMealTotals } from '../../utils/dietUtils';

const DietPlanner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState<Paziente | null>(null);
  const [diet, setDiet] = useState<Dieta | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (id) {
      fetchPatientAndDiet();
    }
  }, [id]);

  const fetchPatientAndDiet = async () => {
    setLoading(true);
    try {
      const patientData = await pazientiApi.getPazienteById(parseInt(id!));
      setPatient(patientData);
      
      try {
        const dietData = await dietaApi.getDieta(parseInt(id!));
        setDiet(dietData);
        // Set notes from diet data if available
        if (dietData.note) {
          setNotes(dietData.note);
        }
      } catch (error) {
        console.error('Error fetching diet:', error);
        // Create empty diet if none exists
        setDiet({
          colazione: createEmptyMeal(),
          spuntino: createEmptyMeal(),
          pranzo: createEmptyMeal(),
          merenda: createEmptyMeal(),
          cena: createEmptyMeal(),
          totale_giornaliero: {
            totale_kcal: 0,
            totale_proteine: 0,
            totale_lipidi: 0,
            totale_carboidrati: 0,
            totale_fibre: 0
          }
        });
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEmptyMeal = (): Pasto => ({
    alimenti: [],
    totale_kcal: 0,
    totale_proteine: 0,
    totale_lipidi: 0,
    totale_carboidrati: 0,
    totale_fibre: 0
  });

  const handleUpdateMeal = (mealName: string, updatedMeal: Pasto) => {
    if (!diet) return;
    
    // Calculate meal totals
    const mealTotals = calculateMealTotals(updatedMeal.alimenti);
    
    // Create updated diet
    const updatedDiet = {
      ...diet,
      [mealName]: {
        alimenti: updatedMeal.alimenti,
        ...mealTotals
      }
    };
    
    // Calculate daily totals
    const dailyTotals = calculateDailyTotals(updatedDiet);
    updatedDiet.totale_giornaliero = dailyTotals;
    
    setDiet(updatedDiet);
  };

  const handleSaveDiet = async () => {
    if (!diet || !id) return;
    
    setSaving(true);
    try {
      // Add notes to the diet before saving
      const dietWithNotes = {
        ...diet,
        note: notes
      };
      
      await dietaApi.updateDieta(parseInt(id), dietWithNotes);
      alert('Dieta salvata con successo!');
    } catch (error) {
      console.error('Error saving diet:', error);
      alert('Errore durante il salvataggio della dieta');
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

  if (!patient) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" color="error">
          Paziente non trovato
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/patients')}
          sx={{ mt: 2 }}
        >
          Torna alla lista pazienti
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Piano Dietetico: {patient.nome} {patient.cognome}
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/patients')}
            sx={{ mr: 1 }}
          >
            Indietro
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveDiet}
            disabled={saving}
            sx={{ mr: 1 }}
          >
            {saving ? <CircularProgress size={24} /> : 'Salva Dieta'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              if (id) {
                const exportUrl = dietaApi.exportDietaToWord(parseInt(id));
                
                // Create a temporary link element and trigger the download
                const link = document.createElement('a');
                link.href = exportUrl;
                link.download = `dieta_${patient?.nome}_${patient?.cognome}.docx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }}
            disabled={!diet}
          >
            Esporta Word
          </Button>
        </Box>
      </Box>

      {diet && (
        <>
          <MealSection 
            title="Colazione" 
            mealName="colazione" 
            meal={diet.colazione} 
            onUpdate={handleUpdateMeal} 
          />
          
          <MealSection 
            title="Spuntino" 
            mealName="spuntino" 
            meal={diet.spuntino} 
            onUpdate={handleUpdateMeal} 
          />
          
          <MealSection 
            title="Pranzo" 
            mealName="pranzo" 
            meal={diet.pranzo} 
            onUpdate={handleUpdateMeal} 
          />
          
          <MealSection 
            title="Merenda" 
            mealName="merenda" 
            meal={diet.merenda} 
            onUpdate={handleUpdateMeal} 
          />
          
          <MealSection 
            title="Cena" 
            mealName="cena" 
            meal={diet.cena} 
            onUpdate={handleUpdateMeal} 
          />

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Note</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Aggiungi note per la dieta..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Paper>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Totali Giornalieri</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box>
                <Typography variant="subtitle2">Calorie</Typography>
                <Typography variant="h6">{diet.totale_giornaliero.totale_kcal.toFixed(1)} kcal</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2">Proteine</Typography>
                <Typography variant="h6">{diet.totale_giornaliero.totale_proteine.toFixed(1)} g</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2">Lipidi</Typography>
                <Typography variant="h6">{diet.totale_giornaliero.totale_lipidi.toFixed(1)} g</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2">Carboidrati</Typography>
                <Typography variant="h6">{diet.totale_giornaliero.totale_carboidrati.toFixed(1)} g</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2">Fibre</Typography>
                <Typography variant="h6">{diet.totale_giornaliero.totale_fibre.toFixed(1)} g</Typography>
              </Box>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default DietPlanner;

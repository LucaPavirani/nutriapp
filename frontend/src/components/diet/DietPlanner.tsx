import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, CircularProgress,
  Divider, TextField
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Dieta, Paziente, Pasto } from '../../types';
import { pazientiApi, dietaApi } from '../../services/api';
import MealSection from './MealSection';
import ImportDietDialog from './ImportDietDialog';
import { calculateDailyTotals, calculateMealTotals } from '../../utils/dietUtils';

const DietPlanner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState<Paziente | null>(null);
  const [diet, setDiet] = useState<Dieta | null>(null);
  const [notes, setNotes] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);

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
    totale_fibre: 0,
    note: ''
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
        note: updatedMeal.note,
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
  
  const handleImportMeal = (mealName: string, importedMeal: Pasto) => {
    if (!diet) return;
    
    // Create updated diet with the imported meal
    // Ensure the note property is preserved if it exists in the imported meal
    const updatedDiet = {
      ...diet,
      [mealName]: {
        ...importedMeal,
        note: importedMeal.note || (diet[mealName as keyof Dieta] as Pasto).note
      }
    };
    
    // Calculate daily totals
    const dailyTotals = calculateDailyTotals(updatedDiet);
    updatedDiet.totale_giornaliero = dailyTotals;
    
    setDiet(updatedDiet);
  };
  
  const handleImportFullDiet = (data: { pazienteId: number, mealName?: string, diet: Dieta | Pasto }) => {
    if (!diet || !data.diet) return;
    
    // If we're importing a full diet
    if ('colazione' in data.diet) {
      // Create a new diet with imported data, ensuring correct structure
      const importedDiet: Dieta = {
        colazione: ensureValidMeal(data.diet.colazione),
        spuntino: ensureValidMeal(data.diet.spuntino),
        pranzo: ensureValidMeal(data.diet.pranzo),
        merenda: ensureValidMeal(data.diet.merenda),
        cena: ensureValidMeal(data.diet.cena),
        totale_giornaliero: {
          totale_kcal: typeof data.diet.totale_giornaliero?.totale_kcal === 'number' ? data.diet.totale_giornaliero.totale_kcal : 0,
          totale_proteine: typeof data.diet.totale_giornaliero?.totale_proteine === 'number' ? data.diet.totale_giornaliero.totale_proteine : 0,
          totale_lipidi: typeof data.diet.totale_giornaliero?.totale_lipidi === 'number' ? data.diet.totale_giornaliero.totale_lipidi : 0,
          totale_carboidrati: typeof data.diet.totale_giornaliero?.totale_carboidrati === 'number' ? data.diet.totale_giornaliero.totale_carboidrati : 0,
          totale_fibre: typeof data.diet.totale_giornaliero?.totale_fibre === 'number' ? data.diet.totale_giornaliero.totale_fibre : 0
        },
        note: notes || data.diet.note
      };
      
      setDiet(importedDiet);
    }
    
    setImportDialogOpen(false);
  };
  
  // Helper function to ensure a meal has valid structure
  const ensureValidMeal = (meal: any): Pasto => {
    if (!meal || typeof meal !== 'object') {
      return {
        alimenti: [],
        totale_kcal: 0,
        totale_proteine: 0,
        totale_lipidi: 0,
        totale_carboidrati: 0,
        totale_fibre: 0,
        note: ''
      };
    }
    
    return {
      alimenti: Array.isArray(meal.alimenti) ? meal.alimenti : [],
      totale_kcal: typeof meal.totale_kcal === 'number' ? meal.totale_kcal : 0,
      totale_proteine: typeof meal.totale_proteine === 'number' ? meal.totale_proteine : 0,
      totale_lipidi: typeof meal.totale_lipidi === 'number' ? meal.totale_lipidi : 0,
      totale_carboidrati: typeof meal.totale_carboidrati === 'number' ? meal.totale_carboidrati : 0,
      totale_fibre: typeof meal.totale_fibre === 'number' ? meal.totale_fibre : 0,
      note: typeof meal.note === 'string' ? meal.note : ''
    };
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
            onClick={() => setImportDialogOpen(true)}
            disabled={!diet}
            sx={{ mr: 1 }}
          >
            Importa Dieta
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
            pazienteId={parseInt(id!)} 
            onUpdate={handleUpdateMeal} 
            onImport={handleImportMeal}
          />
          
          <MealSection 
            title="Spuntino" 
            mealName="spuntino" 
            meal={diet.spuntino} 
            pazienteId={parseInt(id!)} 
            onUpdate={handleUpdateMeal} 
            onImport={handleImportMeal}
          />
          
          <MealSection 
            title="Pranzo" 
            mealName="pranzo" 
            meal={diet.pranzo} 
            pazienteId={parseInt(id!)} 
            onUpdate={handleUpdateMeal} 
            onImport={handleImportMeal}
          />
          
          <MealSection 
            title="Merenda" 
            mealName="merenda" 
            meal={diet.merenda} 
            pazienteId={parseInt(id!)} 
            onUpdate={handleUpdateMeal} 
            onImport={handleImportMeal}
          />
          
          <MealSection 
            title="Cena" 
            mealName="cena" 
            meal={diet.cena} 
            pazienteId={parseInt(id!)} 
            onUpdate={handleUpdateMeal} 
            onImport={handleImportMeal}
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
          
          {/* Import Full Diet Dialog */}
          <ImportDietDialog
            open={importDialogOpen}
            onClose={() => setImportDialogOpen(false)}
            currentPazienteId={parseInt(id!)}
            onImport={handleImportFullDiet}
          />
        </>
      )}
    </Box>
  );
};

export default DietPlanner;

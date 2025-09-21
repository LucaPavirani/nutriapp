import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, CircularProgress, Typography, Box,
  FormControl, InputLabel, Select, MenuItem, FormHelperText,
  Divider, List, ListItem, ListItemText, ListItemIcon, Checkbox
} from '@mui/material';
import { Paziente, Dieta, Pasto } from '../../types';
import { pazientiApi } from '../../services/api';

interface ImportDietDialogProps {
  open: boolean;
  onClose: () => void;
  currentPazienteId: number;
  mealName?: string;
  onImport: (data: { pazienteId: number, mealName?: string, diet: Dieta | Pasto }) => void;
}

const ImportDietDialog: React.FC<ImportDietDialogProps> = ({ 
  open, 
  onClose, 
  currentPazienteId,
  mealName,
  onImport 
}) => {
  const [loading, setLoading] = useState(false);
  const [pazienti, setPazienti] = useState<Paziente[]>([]);
  const [selectedPazienteId, setSelectedPazienteId] = useState<number | ''>('');
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  
  const isSingleMealMode = !!mealName;

  // Fetch patients with diets
  useEffect(() => {
    if (open) {
      fetchPazientiWithDiete();
    }
  }, [open]);

  const fetchPazientiWithDiete = async () => {
    setLoading(true);
    try {
      const response = await pazientiApi.getPazientiWithDiete();
      // Filter out the current patient
      const filteredPazienti = response.data.filter(p => p.id !== currentPazienteId);
      setPazienti(filteredPazienti);
    } catch (error) {
      console.error('Error fetching patients with diets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePazienteChange = (event: any) => {
    setSelectedPazienteId(event.target.value);
    setSelectedMeals([]);
  };

  const handleMealToggle = (mealName: string) => () => {
    const currentIndex = selectedMeals.indexOf(mealName);
    const newSelectedMeals = [...selectedMeals];

    if (currentIndex === -1) {
      newSelectedMeals.push(mealName);
    } else {
      newSelectedMeals.splice(currentIndex, 1);
    }

    setSelectedMeals(newSelectedMeals);
  };

  const handleImport = () => {
    if (selectedPazienteId === '') return;

    const selectedPaziente = pazienti.find(p => p.id === selectedPazienteId);
    if (!selectedPaziente || !selectedPaziente.dieta) return;

    if (isSingleMealMode && mealName) {
      // Import a single meal
      const mealToImport = selectedPaziente.dieta[mealName as keyof Dieta];
      
      // Ensure the meal has the correct structure
      if (mealToImport && typeof mealToImport === 'object' && mealToImport !== null && 'alimenti' in mealToImport) {
        onImport({
          pazienteId: selectedPazienteId as number,
          mealName,
          diet: {
            ...mealToImport,
            // Ensure alimenti is an array
            alimenti: Array.isArray(mealToImport.alimenti) ? mealToImport.alimenti : []
          } as Pasto
        });
      } else {
        console.error('Invalid meal structure:', mealToImport);
        alert('Errore: struttura del pasto non valida');
      }
    } else {
      // Import multiple meals or entire diet
      const dietToImport = { ...selectedPaziente.dieta } as Dieta;
      
      // Ensure all meals have the correct structure
      const mealKeys = ['colazione', 'spuntino', 'pranzo', 'merenda', 'cena'] as const;
      mealKeys.forEach(key => {
        if (dietToImport[key]) {
          dietToImport[key] = {
            ...dietToImport[key],
            alimenti: Array.isArray(dietToImport[key].alimenti) ? dietToImport[key].alimenti : []
          };
        } else {
          // Create empty meal if it doesn't exist
          dietToImport[key] = {
            alimenti: [],
            totale_kcal: 0,
            totale_proteine: 0,
            totale_lipidi: 0,
            totale_carboidrati: 0,
            totale_fibre: 0
          };
        }
      });
      
      // If specific meals are selected, only include those
      if (selectedMeals.length > 0) {
        const filteredDiet = {} as Dieta;
        
        // Initialize all meals as empty
        mealKeys.forEach(key => {
          filteredDiet[key] = {
            alimenti: [],
            totale_kcal: 0,
            totale_proteine: 0,
            totale_lipidi: 0,
            totale_carboidrati: 0,
            totale_fibre: 0
          };
        });
        
        // Copy only selected meals
        selectedMeals.forEach(meal => {
          const mealKey = meal as keyof Dieta;
          if (dietToImport[mealKey]) {
            // Type assertion to ensure TypeScript understands we're assigning compatible types
            filteredDiet[mealKey] = dietToImport[mealKey] as any;
          }
        });
        
        // Copy totals
        filteredDiet.totale_giornaliero = dietToImport.totale_giornaliero;
        
        onImport({
          pazienteId: selectedPazienteId as number,
          diet: filteredDiet
        });
      } else {
        // Import entire diet
        onImport({
          pazienteId: selectedPazienteId as number,
          diet: dietToImport
        });
      }
    }
    
    onClose();
  };

  const getMealLabel = (mealName: string): string => {
    switch(mealName) {
      case 'colazione': return 'Colazione';
      case 'spuntino': return 'Spuntino';
      case 'pranzo': return 'Pranzo';
      case 'merenda': return 'Merenda';
      case 'cena': return 'Cena';
      default: return mealName;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isSingleMealMode 
          ? `Importa ${getMealLabel(mealName!)} da un altro paziente` 
          : 'Importa dieta da un altro paziente'}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : pazienti.length === 0 ? (
          <Typography color="text.secondary">
            Non ci sono altri pazienti con diete disponibili.
          </Typography>
        ) : (
          <>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="paziente-select-label">Seleziona paziente</InputLabel>
              <Select
                labelId="paziente-select-label"
                value={selectedPazienteId}
                onChange={handlePazienteChange}
                label="Seleziona paziente"
              >
                <MenuItem value="" disabled>
                  <em>Seleziona un paziente</em>
                </MenuItem>
                {pazienti.map((paziente) => (
                  <MenuItem key={paziente.id} value={paziente.id}>
                    {paziente.nome} {paziente.cognome}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Seleziona il paziente da cui importare la dieta
              </FormHelperText>
            </FormControl>

            {!isSingleMealMode && selectedPazienteId !== '' && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Seleziona i pasti da importare:
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Se non selezioni nessun pasto, verrà importata l'intera dieta.
                </Typography>
                <List>
                  {['colazione', 'spuntino', 'pranzo', 'merenda', 'cena'].map((meal) => (
                    <ListItem 
                      key={meal} 
                      dense
                      onClick={handleMealToggle(meal)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={selectedMeals.indexOf(meal) !== -1}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText primary={getMealLabel(meal)} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button 
          onClick={handleImport}
          variant="contained" 
          disabled={loading || selectedPazienteId === ''}
        >
          Importa
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportDietDialog;

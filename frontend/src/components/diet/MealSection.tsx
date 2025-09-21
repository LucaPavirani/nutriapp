import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Divider, Radio, RadioGroup, FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CompareArrows as CompareArrowsIcon,
  ImportExport as ImportExportIcon
} from '@mui/icons-material';
import { Pasto, Alimento, AlimentoDieta, Dieta } from '../../types';
import AlimentiSearch from '../alimenti/AlimentiSearch';
import ImportDietDialog from './ImportDietDialog';
import { calculateEquivalentQuantity, convertToAlimentoDieta, calculateMealTotals } from '../../utils/dietUtils';

interface MealSectionProps {
  title: string;
  mealName: string;
  meal: Pasto;
  pazienteId: number;
  onUpdate: (mealName: string, updatedMeal: Pasto) => void;
  onImport?: (mealName: string, importedMeal: Pasto) => void;
}

const MealSection: React.FC<MealSectionProps> = ({ title, mealName, meal, pazienteId, onUpdate, onImport }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [equivalentDialogOpen, setEquivalentDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedAlimento, setSelectedAlimento] = useState<Alimento | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [targetCalories, setTargetCalories] = useState<number>(100);
  const [editingAlimento, setEditingAlimento] = useState<AlimentoDieta | null>(null);
  const [originalNutritionalValues, setOriginalNutritionalValues] = useState<{
    kcalPer100g: number;
    proteinePer100g: number;
    lipidiPer100g: number;
    carboidratiPer100g: number;
    fibrePer100g: number;
  } | null>(null);
  const [editIndex, setEditIndex] = useState<number>(-1);
  const [editingParentId, setEditingParentId] = useState<number | null>(null);

  // Add a new main food item
  const handleAddAlimento = () => {
    if (selectedAlimento) {
      const newAlimento = convertToAlimentoDieta(selectedAlimento, quantity, 'principale');
      
      const updatedAlimenti = [...meal.alimenti, newAlimento];
      const updatedMeal = {
        ...meal,
        alimenti: updatedAlimenti,
      };
      
      onUpdate(mealName, updatedMeal);
      setDialogOpen(false);
      setSelectedAlimento(null);
      setQuantity(100);
    }
  };

  // Add an equivalent to a specific food item
  const handleAddEquivalent = (alimentoId: number) => {
    // Find the parent alimento to get its calories
    const parentAlimento = meal.alimenti.find(item => item.id === alimentoId);
    
    if (parentAlimento) {
      // Set the target calories to match the parent food item's calories
      setTargetCalories(parentAlimento.kcal);
      // Store the parent ID for adding the equivalent
      setEditingParentId(alimentoId);
      setEquivalentDialogOpen(true);
    }
  };

  // Add an equivalent food item based on calories
  const handleAddEquivalentAlimento = () => {
    if (selectedAlimento && editingParentId !== null) {
      const calculatedQuantity = Math.round(calculateEquivalentQuantity(selectedAlimento, targetCalories));
      
      const newEquivalent = convertToAlimentoDieta(
        selectedAlimento, 
        calculatedQuantity, 
        'equivalente',
        editingParentId
      );
      
      // Find the parent alimento
      const updatedAlimenti = [...meal.alimenti];
      const parentIndex = updatedAlimenti.findIndex(item => item.id === editingParentId);
      
      if (parentIndex !== -1) {
        // Initialize equivalenti array if it doesn't exist
        if (!updatedAlimenti[parentIndex].equivalenti) {
          updatedAlimenti[parentIndex].equivalenti = [];
        }
        
        // Add the new equivalent
        updatedAlimenti[parentIndex].equivalenti!.push(newEquivalent);
        
        const updatedMeal = {
          ...meal,
          alimenti: updatedAlimenti,
        };
        
        onUpdate(mealName, updatedMeal);
      }
      
      setEquivalentDialogOpen(false);
      setSelectedAlimento(null);
      setTargetCalories(100);
      setEditingParentId(null);
    }
  };

  // Update an existing food item
  const handleUpdateAlimento = () => {
    if (editingAlimento) {
      const updatedAlimenti = [...meal.alimenti];
      
      // If it's a main food item
      if (editingAlimento.tipo === 'principale' && editIndex >= 0) {
        updatedAlimenti[editIndex] = {
          ...editingAlimento,
          // Preserve equivalents
          equivalenti: updatedAlimenti[editIndex].equivalenti || []
        };
      }
      // If it's an equivalent
      else if (editingAlimento.tipo === 'equivalente') {
        // Find the parent food item by parentId
        const parentId = editingAlimento.parentId || editingParentId;
        if (parentId) {
          const parentIndex = updatedAlimenti.findIndex(item => item.id === parentId);
          if (parentIndex !== -1 && updatedAlimenti[parentIndex].equivalenti) {
            // Find the equivalent by ID
            const eqIndex = updatedAlimenti[parentIndex].equivalenti!.findIndex(
              eq => eq.id === editingAlimento.id
            );
            if (eqIndex !== -1) {
              updatedAlimenti[parentIndex].equivalenti![eqIndex] = editingAlimento;
            }
          }
        }
      }
      
      const updatedMeal = {
        ...meal,
        alimenti: updatedAlimenti,
      };
      
      onUpdate(mealName, updatedMeal);
      setEditingAlimento(null);
      setEditIndex(-1);
      setEditingParentId(null);
      setOriginalNutritionalValues(null);
      setDialogOpen(false);
    }
  };

  // Delete a main food item
  const handleDeleteAlimento = (alimentoId: number) => {
    const updatedAlimenti = meal.alimenti.filter(item => item.id !== alimentoId);
    const updatedMeal = {
      ...meal,
      alimenti: updatedAlimenti,
    };
    
    onUpdate(mealName, updatedMeal);
  };

  // Delete an equivalent
  const handleDeleteEquivalent = (parentId: number, eqIndex: number) => {
    const updatedAlimenti = [...meal.alimenti];
    const parentIndex = updatedAlimenti.findIndex(item => item.id === parentId);
    
    if (parentIndex !== -1 && updatedAlimenti[parentIndex].equivalenti) {
      updatedAlimenti[parentIndex].equivalenti!.splice(eqIndex, 1);
      
      const updatedMeal = {
        ...meal,
        alimenti: updatedAlimenti,
      };
      
      onUpdate(mealName, updatedMeal);
    }
  };

  // Edit a main food item
  const handleEditAlimento = (alimento: AlimentoDieta, index: number) => {
    setEditingAlimento({...alimento});
    setEditIndex(index);
    
    // Store original nutritional values per 100g
    if (alimento.quantita > 0) {
      setOriginalNutritionalValues({
        kcalPer100g: (alimento.kcal / alimento.quantita) * 100,
        proteinePer100g: (alimento.proteine / alimento.quantita) * 100,
        lipidiPer100g: (alimento.lipidi / alimento.quantita) * 100,
        carboidratiPer100g: (alimento.carboidrati / alimento.quantita) * 100,
        fibrePer100g: (alimento.fibre / alimento.quantita) * 100
      });
    }
    
    setDialogOpen(true);
  };

  // Edit an equivalent
  const handleEditEquivalent = (parentId: number, eqIndex: number) => {
    const parentIndex = meal.alimenti.findIndex(item => item.id === parentId);
    
    if (parentIndex !== -1 && meal.alimenti[parentIndex].equivalenti) {
      const equivalent = meal.alimenti[parentIndex].equivalenti![eqIndex];
      setEditingAlimento({...equivalent});
      setEditingParentId(parentId);
      
      // Store original nutritional values per 100g
      if (equivalent.quantita > 0) {
        setOriginalNutritionalValues({
          kcalPer100g: (equivalent.kcal / equivalent.quantita) * 100,
          proteinePer100g: (equivalent.proteine / equivalent.quantita) * 100,
          lipidiPer100g: (equivalent.lipidi / equivalent.quantita) * 100,
          carboidratiPer100g: (equivalent.carboidrati / equivalent.quantita) * 100,
          fibrePer100g: (equivalent.fibre / equivalent.quantita) * 100
        });
      }
      
      setDialogOpen(true);
    }
  };

  // Select an equivalent (or the main item)
  const handleSelectEquivalent = (parentId: number, selectedIndex: number) => {
    const updatedAlimenti = [...meal.alimenti];
    const parentIndex = updatedAlimenti.findIndex(item => item.id === parentId);
    
    if (parentIndex !== -1) {
      const parent = updatedAlimenti[parentIndex];
      
      // If selecting the main item (index 0)
      if (selectedIndex === 0) {
        // Unselect all equivalents
        if (parent.equivalenti) {
          parent.equivalenti = parent.equivalenti.map(eq => ({
            ...eq,
            selected: false
          }));
        }
        // Select the main item
        parent.selected = true;
      } 
      // If selecting an equivalent
      else if (parent.equivalenti && selectedIndex > 0 && selectedIndex <= parent.equivalenti.length) {
        // Unselect all equivalents
        parent.equivalenti = parent.equivalenti.map((eq, i) => ({
          ...eq,
          selected: i === selectedIndex - 1
        }));
        // Unselect the main item
        parent.selected = false;
      }
      
      const updatedMeal = {
        ...meal,
        alimenti: updatedAlimenti,
      };
      
      onUpdate(mealName, updatedMeal);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    }
  };

  const handleTargetCaloriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setTargetCalories(value);
    }
  };

  const handleEditingAlimentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingAlimento) {
      const { name, value } = e.target;
      
      // Handle nome field separately to allow mixed text and numbers
      if (name === 'nome') {
        setEditingAlimento({
          ...editingAlimento,
          nome: value
        });
        return;
      }
      
      let numValue = parseFloat(value);
      
      // For numerical fields, round to whole numbers
      if (!isNaN(numValue) && ['quantita', 'kcal', 'proteine', 'lipidi', 'carboidrati', 'fibre'].includes(name)) {
        numValue = Math.round(numValue);
      }
      
      // If quantity is changing, recalculate all nutritional values
      if (name === 'quantita' && !isNaN(numValue)) {
        // Enforce minimum value of 1
        numValue = Math.max(1, numValue);
        
        // Use stored original values per 100g if available
        let kcalPer100g = 0;
        let proteinePer100g = 0;
        let lipidiPer100g = 0;
        let carboidratiPer100g = 0;
        let fibrePer100g = 0;
        
        if (originalNutritionalValues) {
          // Use the stored original values
          kcalPer100g = originalNutritionalValues.kcalPer100g;
          proteinePer100g = originalNutritionalValues.proteinePer100g;
          lipidiPer100g = originalNutritionalValues.lipidiPer100g;
          carboidratiPer100g = originalNutritionalValues.carboidratiPer100g;
          fibrePer100g = originalNutritionalValues.fibrePer100g;
        } else {
          // Calculate from current values as fallback
          const originalQuantity = editingAlimento.quantita;
          const originalKcal = editingAlimento.kcal;
          const originalProteine = editingAlimento.proteine;
          const originalLipidi = editingAlimento.lipidi;
          const originalCarboidrati = editingAlimento.carboidrati;
          const originalFibre = editingAlimento.fibre;
          
          // Calculate values per 100g (avoid division by zero)
          kcalPer100g = originalQuantity > 0 ? (originalKcal / originalQuantity) * 100 : 0;
          proteinePer100g = originalQuantity > 0 ? (originalProteine / originalQuantity) * 100 : 0;
          lipidiPer100g = originalQuantity > 0 ? (originalLipidi / originalQuantity) * 100 : 0;
          carboidratiPer100g = originalQuantity > 0 ? (originalCarboidrati / originalQuantity) * 100 : 0;
          fibrePer100g = originalQuantity > 0 ? (originalFibre / originalQuantity) * 100 : 0;
        }
        
        // Calculate new values based on new quantity
        const newFactor = numValue / 100;
        const newKcal = Math.round(kcalPer100g * newFactor);
        const newProteine = Math.round(proteinePer100g * newFactor);
        const newLipidi = Math.round(lipidiPer100g * newFactor);
        const newCarboidrati = Math.round(carboidratiPer100g * newFactor);
        const newFibre = Math.round(fibrePer100g * newFactor);
        
        // Update all values (ensure we use 0 instead of empty values)
        setEditingAlimento({
          ...editingAlimento,
          quantita: numValue,
          kcal: newKcal || 0,
          proteine: newProteine || 0,
          lipidi: newLipidi || 0,
          carboidrati: newCarboidrati || 0,
          fibre: newFibre || 0
        });
      } else {
        // Just update the single field
        setEditingAlimento({
          ...editingAlimento,
          [name]: !isNaN(numValue) ? numValue : value,
        });
      }
    }
  };

  const handleSelectAlimento = (alimento: Alimento) => {
    setSelectedAlimento(alimento);
  };
  
  const handleImportMeal = (data: { pazienteId: number, mealName?: string, diet: Dieta | Pasto }) => {
    if (onImport && data.mealName === mealName && data.diet && 'alimenti' in data.diet) {
      // Ensure the meal has the correct structure with alimenti as an array
      const importedMeal: Pasto = {
        ...data.diet,
        alimenti: Array.isArray(data.diet.alimenti) ? data.diet.alimenti : [],
        totale_kcal: typeof data.diet.totale_kcal === 'number' ? data.diet.totale_kcal : 0,
        totale_proteine: typeof data.diet.totale_proteine === 'number' ? data.diet.totale_proteine : 0,
        totale_lipidi: typeof data.diet.totale_lipidi === 'number' ? data.diet.totale_lipidi : 0,
        totale_carboidrati: typeof data.diet.totale_carboidrati === 'number' ? data.diet.totale_carboidrati : 0,
        totale_fibre: typeof data.diet.totale_fibre === 'number' ? data.diet.totale_fibre : 0
      };
      
      onImport(mealName, importedMeal);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onImport && (
            <Button 
              variant="outlined" 
              startIcon={<ImportExportIcon />}
              onClick={() => setImportDialogOpen(true)}
              color="secondary"
            >
              Importa
            </Button>
          )}
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingAlimento(null);
              setEditIndex(-1);
              setDialogOpen(true);
            }}
          >
            Aggiungi Alimento
          </Button>
        </Box>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Alimento</TableCell>
              <TableCell align="right">Quantità</TableCell>
              <TableCell align="right">Kcal</TableCell>
              <TableCell align="right">Proteine</TableCell>
              <TableCell align="right">Lipidi</TableCell>
              <TableCell align="right">Carboidrati</TableCell>
              <TableCell align="right">Fibre</TableCell>
              <TableCell align="right">Azioni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {meal.alimenti.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Nessun alimento aggiunto
                </TableCell>
              </TableRow>
            ) : (
              // Filter to only show principal items (not equivalents)
              meal.alimenti
                .filter(alimento => alimento.tipo === 'principale')
                .map((alimento, index) => (
                  <React.Fragment key={`${alimento.id}-${index}`}>
                    {/* Main food item row */}
                    <TableRow 
                      sx={{ 
                        backgroundColor: alimento.equivalenti && alimento.equivalenti.some(eq => eq.selected) 
                          ? '#f5f5f5' 
                          : 'white'
                      }}
                    >
                      <TableCell>{alimento.nome}</TableCell>
                      <TableCell align="right">{alimento.quantita} {alimento.unita}</TableCell>
                      <TableCell align="right">{alimento.kcal?.toFixed(1) || 0}</TableCell>
                      <TableCell align="right">{alimento.proteine?.toFixed(1) || 0}</TableCell>
                      <TableCell align="right">{alimento.lipidi?.toFixed(1) || 0}</TableCell>
                      <TableCell align="right">{alimento.carboidrati?.toFixed(1) || 0}</TableCell>
                      <TableCell align="right">{alimento.fibre?.toFixed(1) || 0}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          onClick={() => handleAddEquivalent(alimento.id)}
                          title="Aggiungi equivalente"
                        >
                          <CompareArrowsIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditAlimento(alimento, index)}
                          title="Modifica"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteAlimento(alimento.id)}
                          title="Elimina"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    
                    {/* Equivalent food items */}
                    {alimento.equivalenti && alimento.equivalenti.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={8} sx={{ py: 0, borderBottom: 'none' }}>
                          <Box sx={{ pl: 4, py: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Equivalenti:
                            </Typography>
                            <RadioGroup
                              value={alimento.equivalenti.findIndex(eq => eq.selected) + 1 || 0}
                              onChange={(e) => handleSelectEquivalent(alimento.id, parseInt(e.target.value))}
                            >
                              <FormControlLabel 
                                value={0} 
                                control={<Radio size="small" />} 
                                label={`${alimento.nome} (${alimento.quantita} ${alimento.unita})`} 
                              />
                              {alimento.equivalenti.map((eq, eqIndex) => (
                                <Box key={`eq-${eq.id}-${eqIndex}`} sx={{ display: 'flex', alignItems: 'center' }}>
                                  <FormControlLabel 
                                    value={eqIndex + 1} 
                                    control={<Radio size="small" />} 
                                    label={`${eq.nome} (${Math.round(eq.quantita)} ${eq.unita})`} 
                                  />
                                  <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleEditEquivalent(alimento.id, eqIndex)}
                                      title="Modifica equivalente"
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleDeleteEquivalent(alimento.id, eqIndex)}
                                      title="Elimina equivalente"
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Box>
                              ))}
                            </RadioGroup>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Aggiungi note per questo pasto..."
          label="Note"
          value={meal.note || ''}
          onChange={(e) => {
            const updatedMeal = {
              ...meal,
              note: e.target.value
            };
            onUpdate(mealName, updatedMeal);
          }}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Totali:
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Kcal: {meal.totale_kcal.toFixed(1)}
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Proteine: {meal.totale_proteine.toFixed(1)}g
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Lipidi: {meal.totale_lipidi.toFixed(1)}g
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Carboidrati: {meal.totale_carboidrati.toFixed(1)}g
          </Typography>
          <Typography variant="body2">
            Fibre: {meal.totale_fibre.toFixed(1)}g
          </Typography>
        </Box>
      </Box>

      {/* Add Alimento Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => {
          setDialogOpen(false);
          setOriginalNutritionalValues(null);
        }} 
        maxWidth="lg" 
        fullWidth>
        <DialogTitle>
          {editingAlimento ? 'Modifica Alimento' : 'Aggiungi Alimento'}
        </DialogTitle>
        <DialogContent>
          {editingAlimento ? (
            <Box sx={{ pt: 2 }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <TextField
                      sx={{ flex: '1 1 45%', minWidth: '250px' }}
                      label="Nome"
                      name="nome"
                      value={editingAlimento.nome}
                      onChange={handleEditingAlimentoChange}
                      inputProps={{ type: 'text' }}
                    />
                    <TextField
                      sx={{ flex: '1 1 45%', minWidth: '250px' }}
                      label="Quantità"
                      name="quantita"
                      type="number"
                      value={Math.max(1, Math.round(editingAlimento.quantita))}
                      onChange={handleEditingAlimentoChange}
                      inputProps={{ step: 1, min: 1 }}
                      helperText="Minimo 1g"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <TextField
                      sx={{ flex: '1 1 30%', minWidth: '200px' }}
                      label="Kcal"
                      name="kcal"
                      type="number"
                      value={Math.round(editingAlimento.kcal) || 0}
                      onChange={handleEditingAlimentoChange}
                      inputProps={{ step: 1 }}
                    />
                    <TextField
                      sx={{ flex: '1 1 30%', minWidth: '200px' }}
                      label="Proteine (g)"
                      name="proteine"
                      type="number"
                      value={Math.round(editingAlimento.proteine) || 0}
                      onChange={handleEditingAlimentoChange}
                      inputProps={{ step: 1 }}
                    />
                    <TextField
                      sx={{ flex: '1 1 30%', minWidth: '200px' }}
                      label="Lipidi (g)"
                      name="lipidi"
                      type="number"
                      value={Math.round(editingAlimento.lipidi) || 0}
                      onChange={handleEditingAlimentoChange}
                      inputProps={{ step: 1 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <TextField
                      sx={{ flex: '1 1 45%', minWidth: '250px' }}
                      label="Carboidrati (g)"
                      name="carboidrati"
                      type="number"
                      value={Math.round(editingAlimento.carboidrati) || 0}
                      onChange={handleEditingAlimentoChange}
                      inputProps={{ step: 1 }}
                    />
                    <TextField
                      sx={{ flex: '1 1 45%', minWidth: '250px' }}
                      label="Fibre (g)"
                      name="fibre"
                      type="number"
                      value={Math.round(editingAlimento.fibre) || 0}
                      onChange={handleEditingAlimentoChange}
                      inputProps={{ step: 1 }}
                    />
                  </Box>
                </Box>
            </Box>
          ) : (
            <>
              <AlimentiSearch onSelectAlimento={handleSelectAlimento} showAddButton={false} />
              
              {selectedAlimento && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Alimento selezionato: {selectedAlimento.alimento}
                  </Typography>
                  <TextField
                    fullWidth
                    label="Quantità (g)"
                    type="number"
                    value={Math.max(1, quantity)}
                    onChange={handleQuantityChange}
                    sx={{ mt: 1 }}
                    inputProps={{ min: 1, step: 1 }}
                    helperText="Minimo 1g"
                  />
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDialogOpen(false);
            setOriginalNutritionalValues(null);
          }}>Annulla</Button>
          <Button 
            onClick={editingAlimento ? handleUpdateAlimento : handleAddAlimento}
            disabled={editingAlimento ? false : !selectedAlimento}
            variant="contained"
            color={editingAlimento ? "primary" : "primary"}
          >
            {editingAlimento ? 'Aggiorna' : 'Aggiungi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Equivalent Alimento Dialog */}
      <Dialog open={equivalentDialogOpen} onClose={() => setEquivalentDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Aggiungi Alimento Equivalente</DialogTitle>
        <DialogContent>
          {editingParentId && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Stai aggiungendo un equivalente per:
              </Typography>
              {(() => {
                const parentAlimento = meal.alimenti.find(item => item.id === editingParentId);
                return parentAlimento ? (
                  <Box>
                    <Typography variant="subtitle1">
                      {parentAlimento.nome} ({parentAlimento.quantita} {parentAlimento.unita})
                    </Typography>
                    <Typography variant="body2">
                      {parentAlimento.kcal.toFixed(1)} kcal
                    </Typography>
                  </Box>
                ) : null;
              })()}
            </Box>
          )}
          
          <AlimentiSearch onSelectAlimento={handleSelectAlimento} showAddButton={false} />
          
          {selectedAlimento && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Alimento selezionato: {selectedAlimento.alimento}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TextField
                  sx={{ flex: 1 }}
                  label="Calorie target (±5 kcal)"
                  type="number"
                  value={targetCalories}
                  onChange={handleTargetCaloriesChange}
                  inputProps={{ min: 1, step: 1 }}
                  helperText="Calorie dell'alimento principale"
                />
                
                {selectedAlimento.kcal && (
                  <TextField
                    sx={{ flex: 1 }}
                    label="Quantità equivalente (g)"
                    type="number"
                    value={Math.max(1, Math.round(calculateEquivalentQuantity(selectedAlimento, targetCalories)))}
                    onChange={(e) => {
                      const newQuantity = parseFloat(e.target.value);
                      if (!isNaN(newQuantity) && newQuantity >= 1 && selectedAlimento.kcal) {
                        // Calculate calories based on the new quantity
                        const newCalories = (newQuantity / 100) * selectedAlimento.kcal;
                        setTargetCalories(newCalories);
                      }
                    }}
                    inputProps={{ min: 1, step: 1 }}
                    helperText="Minimo 1g - Puoi modificare la quantità suggerita"
                  />
                )}
              </Box>
              
              {selectedAlimento.kcal && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <strong>Calorie per 100g:</strong> {selectedAlimento.kcal.toFixed(1)} kcal
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <strong>Calorie con quantità suggerita:</strong> {targetCalories.toFixed(1)} kcal
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEquivalentDialogOpen(false)}>Annulla</Button>
          <Button 
            onClick={handleAddEquivalentAlimento}
            disabled={!selectedAlimento}
            variant="contained"
          >
            Aggiungi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      {onImport && (
        <ImportDietDialog
          open={importDialogOpen}
          onClose={() => setImportDialogOpen(false)}
          currentPazienteId={pazienteId}
          mealName={mealName}
          onImport={handleImportMeal}
        />
      )}
    </Paper>
  );
};

export default MealSection;

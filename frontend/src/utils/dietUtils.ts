import { Alimento, AlimentoDieta } from '../types';

/**
 * Calculate equivalent quantity based on target calories
 * @param alimento The food item
 * @param targetCalories Target calories
 * @returns Equivalent quantity in grams
 */
export const calculateEquivalentQuantity = (alimento: Alimento, targetCalories: number): number => {
  if (!alimento.kcal || alimento.kcal === 0) {
    return 0;
  }
  
  // Calculate grams needed to reach target calories
  // Formula: (targetCalories / kcalPer100g) * 100
  return (targetCalories / alimento.kcal) * 100;
};

/**
 * Convert Alimento to AlimentoDieta
 * @param alimento The food item
 * @param quantity Quantity in grams
 * @param tipo Type of food (principale or opzionale)
 * @returns AlimentoDieta object
 */
export const convertToAlimentoDieta = (
  alimento: Alimento, 
  quantity: number = 100, 
  tipo: 'principale' | 'equivalente' = 'principale',
  parentId?: number
): AlimentoDieta => {
  // Calculate nutritional values based on quantity
  const factor = quantity / 100;
  
  return {
    id: alimento.id,
    nome: alimento.alimento,
    quantita: quantity,
    unita: 'g',
    kcal: alimento.kcal ? alimento.kcal * factor : 0,
    proteine: alimento.proteine ? alimento.proteine * factor : 0,
    lipidi: alimento.lipidi ? alimento.lipidi * factor : 0,
    carboidrati: alimento.carboidrati ? alimento.carboidrati * factor : 0,
    fibre: alimento.fibre ? alimento.fibre * factor : 0,
    tipo,
    parentId,
    equivalenti: [],
    selected: tipo === 'principale' ? true : false
  };
};

/**
 * Calculate totals for a meal
 * @param alimenti List of food items in the meal
 * @returns Object with total nutritional values
 */
export const calculateMealTotals = (alimenti: AlimentoDieta[]) => {
  // Group main foods with their equivalents
  const foodGroups: { main: AlimentoDieta, equivalents: AlimentoDieta[] }[] = [];
  const standaloneItems: AlimentoDieta[] = [];
  
  // First, organize foods into groups (main food + all equivalents) or standalone items
  alimenti.forEach(item => {
    if (item.tipo === 'principale') {
      // Check if this main food has equivalents
      if (item.equivalenti && item.equivalenti.length > 0) {
        // This main food has equivalents
        foodGroups.push({ 
          main: item, 
          equivalents: item.equivalenti 
        });
      } else {
        // This is a standalone main food (no equivalents)
        standaloneItems.push(item);
      }
    } else if (item.tipo === 'equivalente' && !item.parentId) {
      // This is a standalone equivalent (shouldn't normally happen, but handle it)
      if (item.selected) {
        standaloneItems.push(item);
      }
    }
  });
  
  // Initialize totals
  const totals = {
    totale_kcal: 0,
    totale_proteine: 0,
    totale_lipidi: 0,
    totale_carboidrati: 0,
    totale_fibre: 0,
  };
  
  // Add standalone items to totals
  standaloneItems.forEach(item => {
    totals.totale_kcal += (item.kcal || 0);
    totals.totale_proteine += (item.proteine || 0);
    totals.totale_lipidi += (item.lipidi || 0);
    totals.totale_carboidrati += (item.carboidrati || 0);
    totals.totale_fibre += (item.fibre || 0);
  });
  
  // Add mean values of each food group (main food + all equivalents)
  foodGroups.forEach(group => {
    // Get all items in this group (main + equivalents)
    const allItems = [group.main, ...group.equivalents];
    
    // Calculate mean values for each nutritional property
    const meanKcal = allItems.reduce((sum, item) => sum + (item.kcal || 0), 0) / allItems.length;
    const meanProteine = allItems.reduce((sum, item) => sum + (item.proteine || 0), 0) / allItems.length;
    const meanLipidi = allItems.reduce((sum, item) => sum + (item.lipidi || 0), 0) / allItems.length;
    const meanCarboidrati = allItems.reduce((sum, item) => sum + (item.carboidrati || 0), 0) / allItems.length;
    const meanFibre = allItems.reduce((sum, item) => sum + (item.fibre || 0), 0) / allItems.length;
    
    // Add mean values to totals
    totals.totale_kcal += meanKcal;
    totals.totale_proteine += meanProteine;
    totals.totale_lipidi += meanLipidi;
    totals.totale_carboidrati += meanCarboidrati;
    totals.totale_fibre += meanFibre;
  });
  
  // Round all values to 1 decimal place
  return {
    totale_kcal: Math.round(totals.totale_kcal * 10) / 10,
    totale_proteine: Math.round(totals.totale_proteine * 10) / 10,
    totale_lipidi: Math.round(totals.totale_lipidi * 10) / 10,
    totale_carboidrati: Math.round(totals.totale_carboidrati * 10) / 10,
    totale_fibre: Math.round(totals.totale_fibre * 10) / 10,
  };
};

/**
 * Calculate daily totals from all meals
 * @param dieta Diet object with all meals
 * @returns Object with total nutritional values
 */
export const calculateDailyTotals = (dieta: any) => {
  const meals = ['colazione', 'spuntino', 'pranzo', 'merenda', 'cena'];
  
  return meals.reduce(
    (totals, mealName) => {
      const meal = dieta[mealName];
      return {
        totale_kcal: totals.totale_kcal + (meal.totale_kcal || 0),
        totale_proteine: totals.totale_proteine + (meal.totale_proteine || 0),
        totale_lipidi: totals.totale_lipidi + (meal.totale_lipidi || 0),
        totale_carboidrati: totals.totale_carboidrati + (meal.totale_carboidrati || 0),
        totale_fibre: totals.totale_fibre + (meal.totale_fibre || 0),
      };
    },
    {
      totale_kcal: 0,
      totale_proteine: 0,
      totale_lipidi: 0,
      totale_carboidrati: 0,
      totale_fibre: 0,
    }
  );
};

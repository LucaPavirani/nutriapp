import React from 'react';
import { Box } from '@mui/material';
import DietPlanner from '../components/diet/DietPlanner';

const DietPlannerPage: React.FC = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <DietPlanner />
    </Box>
  );
};

export default DietPlannerPage;

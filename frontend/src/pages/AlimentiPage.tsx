import React from 'react';
import { Box, Typography } from '@mui/material';
import AlimentiSearch from '../components/alimenti/AlimentiSearch';

const AlimentiPage: React.FC = () => {
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Database Alimenti
      </Typography>
      <AlimentiSearch />
    </Box>
  );
};

export default AlimentiPage;

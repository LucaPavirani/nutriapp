import React from 'react';
import { Box } from '@mui/material';
import PatientList from '../components/patients/PatientList';

const PatientsPage: React.FC = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <PatientList />
    </Box>
  );
};

export default PatientsPage;

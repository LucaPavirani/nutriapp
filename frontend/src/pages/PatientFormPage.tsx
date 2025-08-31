import React from 'react';
import { Box } from '@mui/material';
import PatientForm from '../components/patients/PatientForm';
import { useParams } from 'react-router-dom';

const PatientFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  return (
    <Box sx={{ width: '100%' }}>
      <PatientForm isEdit={isEdit} />
    </Box>
  );
};

export default PatientFormPage;

import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PeopleAlt as PeopleIcon, RestaurantMenu as RestaurantIcon } from '@mui/icons-material';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Benvenuto in NutriApp
      </Typography>
      
      <Typography variant="body1" paragraph>
        Gestisci facilmente i tuoi pazienti e crea piani dietetici personalizzati.
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
        <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
          <Paper 
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              height: '100%'
            }}
          >
            <PeopleIcon sx={{ fontSize: 60, mb: 2, color: 'primary.main' }} />
            <Typography variant="h5" gutterBottom>
              Gestione Pazienti
            </Typography>
            <Typography variant="body1" paragraph align="center">
              Aggiungi, modifica e gestisci i tuoi pazienti. Tieni traccia delle loro informazioni personali.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/patients')}
              sx={{ mt: 'auto' }}
            >
              Vai ai Pazienti
            </Button>
          </Paper>
        </Box>
        
        <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
          <Paper 
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              height: '100%'
            }}
          >
            <RestaurantIcon sx={{ fontSize: 60, mb: 2, color: 'primary.main' }} />
            <Typography variant="h5" gutterBottom>
              Database Alimenti
            </Typography>
            <Typography variant="body1" paragraph align="center">
              Accedi al database degli alimenti con informazioni nutrizionali dettagliate. Aggiungi nuovi alimenti se necessario.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/alimenti')}
              sx={{ mt: 'auto' }}
            >
              Vai agli Alimenti
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;

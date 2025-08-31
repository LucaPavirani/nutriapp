import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination,
  Button, IconButton, TextField, InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  RestaurantMenu as DietIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { pazientiApi } from '../../services/api';
import { Paziente } from '../../types';

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Paziente[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await pazientiApi.getPazienti(
        rowsPerPage, 
        page * rowsPerPage, 
        search
      );
      setPatients(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page, rowsPerPage, search]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleAddPatient = () => {
    navigate('/patients/new');
  };

  const handleEditPatient = (id: number) => {
    navigate(`/patients/${id}/edit`);
  };

  const handleViewDiet = (id: number) => {
    navigate(`/patients/${id}/diet`);
  };

  const handleDeletePatient = async (id: number) => {
    if (window.confirm('Sei sicuro di voler eliminare questo paziente?')) {
      try {
        await pazientiApi.deletePaziente(id);
        fetchPatients();
      } catch (error) {
        console.error('Error deleting patient:', error);
      }
    }
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Gestione Pazienti
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddPatient}
        >
          Nuovo Paziente
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Cerca pazienti..."
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="patients table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Cognome</TableCell>
              <TableCell>Età</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefono</TableCell>
              <TableCell align="right">Azioni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Caricamento...</TableCell>
              </TableRow>
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Nessun paziente trovato</TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.id}</TableCell>
                  <TableCell>{patient.nome}</TableCell>
                  <TableCell>{patient.cognome}</TableCell>
                  <TableCell>{patient.eta || '-'}</TableCell>
                  <TableCell>{patient.email || '-'}</TableCell>
                  <TableCell>{patient.telefono || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleViewDiet(patient.id)}
                      title="Gestisci dieta"
                    >
                      <DietIcon />
                    </IconButton>
                    <IconButton 
                      color="info" 
                      onClick={() => handleEditPatient(patient.id)}
                      title="Modifica paziente"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeletePatient(patient.id)}
                      title="Elimina paziente"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Righe per pagina:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} di ${count !== -1 ? count : `più di ${to}`}`}
      />
    </Box>
  );
};

export default PatientList;

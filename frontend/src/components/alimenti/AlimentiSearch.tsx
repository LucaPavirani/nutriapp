import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, CircularProgress, Button,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import { alimentiApi } from '../../services/api';
import { Alimento, AlimentoCreate } from '../../types';
import AlimentoForm from './AlimentoForm';

interface AlimentiSearchProps {
  onSelectAlimento?: (alimento: Alimento) => void;
  showAddButton?: boolean;
}

const AlimentiSearch: React.FC<AlimentiSearchProps> = ({ 
  onSelectAlimento,
  showAddButton = true
}) => {
  const [alimenti, setAlimenti] = useState<Alimento[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchAlimenti = async () => {
    setLoading(true);
    try {
      const response = await alimentiApi.getAlimenti(
        rowsPerPage,
        page * rowsPerPage,
        search
      );
      setAlimenti(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching alimenti:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlimenti();
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

  const handleSelectAlimento = (alimento: Alimento) => {
    if (onSelectAlimento) {
      onSelectAlimento(alimento);
    }
  };

  const handleAddAlimento = async (alimento: AlimentoCreate) => {
    try {
      await alimentiApi.createAlimento(alimento);
      setDialogOpen(false);
      fetchAlimenti();
    } catch (error) {
      console.error('Error creating alimento:', error);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Alimenti
        </Typography>
        {showAddButton && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Nuovo Alimento
          </Button>
        )}
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Cerca alimenti..."
        value={search}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="alimenti table">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell align="right">Kcal</TableCell>
              <TableCell align="right">Proteine (g)</TableCell>
              <TableCell align="right">Lipidi (g)</TableCell>
              <TableCell align="right">Carboidrati (g)</TableCell>
              <TableCell align="right">Fibre (g)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : alimenti.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Nessun alimento trovato
                </TableCell>
              </TableRow>
            ) : (
              alimenti.map((alimento) => (
                <TableRow 
                  key={alimento.id}
                  hover
                  onClick={() => handleSelectAlimento(alimento)}
                  sx={{ cursor: onSelectAlimento ? 'pointer' : 'default' }}
                >
                  <TableCell component="th" scope="row">
                    {alimento.alimento}
                  </TableCell>
                  <TableCell align="right">{alimento.kcal?.toFixed(1) || '-'}</TableCell>
                  <TableCell align="right">{alimento.proteine?.toFixed(1) || '-'}</TableCell>
                  <TableCell align="right">{alimento.lipidi?.toFixed(1) || '-'}</TableCell>
                  <TableCell align="right">{alimento.carboidrati?.toFixed(1) || '-'}</TableCell>
                  <TableCell align="right">{alimento.fibre?.toFixed(1) || '-'}</TableCell>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Aggiungi Nuovo Alimento</DialogTitle>
        <DialogContent>
          <AlimentoForm onSave={handleAddAlimento} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annulla</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AlimentiSearch;

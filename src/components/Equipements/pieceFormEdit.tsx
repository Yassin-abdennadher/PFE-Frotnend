// pages/PieceForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const PieceForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const role = currentUser?.role || 'user';
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const urlMainService = process.env.REACT_APP_URL_GATEWAY_MAIN;

  const [formData, setFormData] = useState({
    reference: '',
    nom: '',
    description: '',
    prixUnitaire: 0,
    quantiteStock: 0,
    seuilAlerte: 5,
    fournisseur: '',
    emplacement: ''
  });

  useEffect(() => {
    if (isEditMode) {
      fetchPiece();
    }
  }, [id]);

  const fetchPiece = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${urlMainService}/pieces/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      setFormData({
        reference: data.reference || '',
        nom: data.nom || '',
        description: data.description || '',
        prixUnitaire: data.prixUnitaire || 0,
        quantiteStock: data.quantiteStock || 0,
        seuilAlerte: data.seuilAlerte || 5,
        fournisseur: data.fournisseur || '',
        emplacement: data.emplacement || ''
      });
    } catch (err) {
      setError('Erreur chargement pièce');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = isEditMode 
        ? `${urlMainService}/pieces/${id}`
        : `${urlMainService}/pieces`;
      
      const method = isEditMode ? axios.put : axios.post;
      
      await method(url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      navigate('/equipements');
    } catch (err) {
      setError('Erreur sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  if (role !== 'admin') {
    return (
      <Container>
        <Alert severity="error">Accès interdit</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ p: 3, mt: 8 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/equipements')}>
              Retour
            </Button>
            <Typography variant="h5" sx={{ ml: 2 }}>
              {isEditMode ? 'Modifier la pièce' : 'Ajouter une pièce'}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Référence" name="reference" value={formData.reference} onChange={handleChange} required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Nom" name="nom" value={formData.nom} onChange={handleChange} required />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Description" name="description" value={formData.description} onChange={handleChange} multiline rows={2} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Prix unitaire" name="prixUnitaire" type="number" value={formData.prixUnitaire} onChange={handleChange} required />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Stock" name="quantiteStock" type="number" value={formData.quantiteStock} onChange={handleChange} required />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Seuil alerte" name="seuilAlerte" type="number" value={formData.seuilAlerte} onChange={handleChange} required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Fournisseur" name="fournisseur" value={formData.fournisseur} onChange={handleChange} required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Emplacement" name="emplacement" value={formData.emplacement} onChange={handleChange} />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button variant="outlined" onClick={() => navigate('/equipements')}>Annuler</Button>
              <Button type="submit" variant="contained" disabled={loading} startIcon={<SaveIcon />}>
                {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Modifier' : 'Ajouter')}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default PieceForm;
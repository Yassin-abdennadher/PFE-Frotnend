// pages/MachineForm.tsx
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
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const MachineForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const role = currentUser?.role || 'user';
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const urlMainService = process.env.REACT_APP_URL_GATEWAY_MAIN;

  const [formData, setFormData] = useState({
    nom: '',
    type: '',
    marque: '',
    modele: '',
    numeroSerie: '',
    localisation: '',
    statut: 'actif',
    dateAchat: '',
    fournisseur: '',
    contactFournisseur: ''
  });

  const statuts = [
    { value: 'actif', label: 'Actif' },
    { value: 'en_panne', label: 'En panne' },
    { value: 'en_maintenance', label: 'En maintenance' },
    { value: 'hors_service', label: 'Hors service' }
  ];

  useEffect(() => {
    if (isEditMode) {
      fetchMachine();
    }
  }, [id]);

  const fetchMachine = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${urlMainService}/machines/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      setFormData({
        nom: data.nom || '',
        type: data.type || '',
        marque: data.marque || '',
        modele: data.modele || '',
        numeroSerie: data.numeroSerie || '',
        localisation: data.localisation || '',
        statut: data.statut || 'actif',
        dateAchat: data.dateAchat ? data.dateAchat.split('T')[0] : '',
        fournisseur: data.fournisseur || '',
        contactFournisseur: data.contactFournisseur || ''
      });
    } catch (err) {
      setError('Erreur chargement machine');
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
        ? `${urlMainService}/machines/${id}`
        : `${urlMainService}/machines`;
      
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
              {isEditMode ? 'Modifier la machine' : 'Ajouter une machine'}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Nom" name="nom" value={formData.nom} onChange={handleChange} required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Type" name="type" value={formData.type} onChange={handleChange} required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Marque" name="marque" value={formData.marque} onChange={handleChange} required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Modèle" name="modele" value={formData.modele} onChange={handleChange} required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Numéro de série" name="numeroSerie" value={formData.numeroSerie} onChange={handleChange} required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Localisation" name="localisation" value={formData.localisation} onChange={handleChange} required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField select fullWidth label="Statut" name="statut" value={formData.statut} onChange={handleChange}>
                  {statuts.map(s => (<MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Date d'achat" name="dateAchat" type="date" value={formData.dateAchat} onChange={handleChange} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Fournisseur" name="fournisseur" value={formData.fournisseur} onChange={handleChange} required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Contact fournisseur" name="contactFournisseur" value={formData.contactFournisseur} onChange={handleChange} />
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

export default MachineForm;
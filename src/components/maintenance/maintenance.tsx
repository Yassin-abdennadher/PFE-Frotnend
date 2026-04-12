// pages/Maintenance.tsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  Build as BuildIcon,
  DateRange as DateRangeIcon,
  Description as DescriptionIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { RootState } from '../../redux/store';
import axios from 'axios';
import './maintenance.css';

const steps = ['Choisir la machine', 'Décrire la panne', 'Confirmation'];

const Maintenance: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const role = currentUser?.role || 'user';
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [machines, setMachines] = useState<any[]>([]);
  const [techniciens, setTechniciens] = useState<any[]>([]);
  const urlMain = process.env.REACT_APP_URL_GATEWAY_MAIN;
  const urlAuth = process.env.REACT_APP_URL_GATEWAY_USERS;

  const [formData, setFormData] = useState({
    machineId: '',
    titre: '',
    description: '',
    urgence: 'moyenne',
    dateSouhaitee: '',
    panne: '',
    technicienId : ''
  });

  const [errors, setErrors] = useState({
    machineId: false,
    titre: false,
    description: false,
    dateSouhaitee: false,
    panne: false
  });

  const urgenceList = [
    { value: 'basse', label: 'Basse - Pas urgent' },
    { value: 'moyenne', label: 'Moyenne - Dans la semaine' },
    { value: 'haute', label: 'Haute - Dans 48h' },
    { value: 'critique', label: 'Critique - Immédiat' }
  ];

  useEffect(() => {
    fetchMachines();
    if (role === 'admin') {
      fetchTechniciens();
    }
  }, []);

  const fetchMachines = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${urlMain}/machines`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMachines(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTechniciens = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${urlAuth}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const users = res.data.data || res.data || [];
      const techs = users.filter((u: any) => u.role === 'technicien');
      setTechniciens(techs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrors({
      ...errors,
      [e.target.name]: false
    });
  };

  const validateStep = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (activeStep === 0) {
      if (!formData.machineId) {
        newErrors.machineId = true;
        isValid = false;
      }
    } else if (activeStep === 1) {
      if (!formData.titre) {
        newErrors.titre = true;
        isValid = false;
      }
      if (!formData.description) {
        newErrors.description = true;
        isValid = false;
      }
      if (!formData.dateSouhaitee) {
        newErrors.dateSouhaitee = true;
        isValid = false;
      }
      if (!formData.panne) {
        newErrors.panne = true;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (activeStep === steps.length - 1) {
        handleSubmit();
      } else {
        setActiveStep(activeStep + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Créer une tâche curative (demande de réparation)
      const interventionData = {
        titre: formData.titre,
        description: formData.description,
        machineId: formData.machineId,
        technicienId: role === 'admin' ? formData.technicienId : null,
        urgence: formData.urgence,
        panne: formData.panne,
        statut: 'ouverte',
        tempsPasse: 0,
        rapport: ''
      };

      await axios.post(`${urlMain}/taches/curative`, interventionData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/Interventions');
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMachineNom = (id: string) => {
    const machine = machines.find(m => m._id === id);
    return machine?.nom || id;
  };

  if (success) {
    return (
      <Box className="maintenance-container">
        <Container maxWidth="sm">
          <Paper className="success-paper">
            <CheckCircleIcon className="success-icon" />
            <Typography variant="h5" gutterBottom>
              Demande envoyée avec succès !
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Votre demande d'intervention a été transmise. Un technicien vous contactera rapidement.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/Interventions')}
              sx={{ mt: 3 }}
            >
              Voir mes interventions
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box className="maintenance-container">
      <Container maxWidth="md">
        <Paper className="maintenance-paper">
          <Box className="maintenance-header">
            <BuildIcon className="header-icon" />
            <Typography variant="h4" className="page-title">
              Demande d'intervention
            </Typography>
            <Typography variant="body2" className="page-subtitle">
              Remplissez ce formulaire pour signaler une panne ou demander une maintenance
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} className="stepper">
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Étape 1 : Choix machine */}
          {activeStep === 0 && (
            <Box className="step-content">
              <Typography variant="h6" gutterBottom>
                Quelle machine nécessite une intervention ?
              </Typography>
              <TextField
                select
                fullWidth
                label="Sélectionner une machine"
                name="machineId"
                value={formData.machineId}
                onChange={handleChange}
                error={errors.machineId}
                helperText={errors.machineId && "Veuillez sélectionner une machine"}
                margin="normal"
              >
                {machines.map((machine) => (
                  <MenuItem key={machine._id} value={machine._id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BuildIcon fontSize="small" />
                      <span>{machine.nom}</span>
                      <Chip 
                        label={machine.statut} 
                        size="small" 
                        color={machine.statut === 'actif' ? 'success' : 'warning'}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              {formData.machineId && (
                <Card className="machine-info">
                  <CardContent>
                    <Typography variant="subtitle2" color="primary">
                      Informations machine
                    </Typography>
                    <Typography variant="body2">
                      Localisation: {machines.find(m => m._id === formData.machineId)?.localisation || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Fournisseur: {machines.find(m => m._id === formData.machineId)?.fournisseur || 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}

          {/* Étape 2 : Description panne */}
          {activeStep === 1 && (
            <Box className="step-content">
              <Typography variant="h6" gutterBottom>
                Décrivez le problème
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Titre de l'intervention"
                    name="titre"
                    placeholder="Ex: Panne moteur, Fuite d'huile, etc."
                    value={formData.titre}
                    onChange={handleChange}
                    error={errors.titre}
                    helperText={errors.titre && "Le titre est requis"}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Description détaillée"
                    name="description"
                    multiline
                    rows={3}
                    placeholder="Décrivez précisément le problème constaté..."
                    value={formData.description}
                    onChange={handleChange}
                    error={errors.description}
                    helperText={errors.description && "La description est requise"}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Panne constatée"
                    name="panne"
                    multiline
                    rows={2}
                    placeholder="Quel est le symptôme ? (bruit, arrêt, fuite, etc.)"
                    value={formData.panne}
                    onChange={handleChange}
                    error={errors.panne}
                    helperText={errors.panne && "La description de la panne est requise"}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Niveau d'urgence"
                    name="urgence"
                    value={formData.urgence}
                    onChange={handleChange}
                  >
                    {urgenceList.map((u) => (
                      <MenuItem key={u.value} value={u.value}>
                        {u.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Date souhaitée"
                    name="dateSouhaitee"
                    type="date"
                    value={formData.dateSouhaitee}
                    onChange={handleChange}
                    error={errors.dateSouhaitee}
                    helperText={errors.dateSouhaitee && "La date souhaitée est requise"}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Étape 3 : Confirmation */}
          {activeStep === 2 && (
            <Box className="step-content">
              <Typography variant="h6" gutterBottom>
                Vérifiez vos informations
              </Typography>
              <Card className="confirmation-card">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" color="primary">Machine</Typography>
                      <Typography>{getMachineNom(formData.machineId)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" color="primary">Titre</Typography>
                      <Typography>{formData.titre}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" color="primary">Description</Typography>
                      <Typography>{formData.description}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" color="primary">Panne</Typography>
                      <Typography>{formData.panne}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="subtitle2" color="primary">Urgence</Typography>
                      <Chip 
                        label={urgenceList.find(u => u.value === formData.urgence)?.label} 
                        color={formData.urgence === 'critique' ? 'error' : formData.urgence === 'haute' ? 'warning' : 'info'}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="subtitle2" color="primary">Date souhaitée</Typography>
                      <Typography>{new Date(formData.dateSouhaitee).toLocaleDateString()}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Boutons navigation */}
          <Box className="button-container">
            {activeStep > 0 && (
              <Button variant="outlined" onClick={handleBack}>
                Retour
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              startIcon={activeStep === steps.length - 1 ? <SendIcon /> : null}
            >
              {loading ? <CircularProgress size={24} /> : (activeStep === steps.length - 1 ? 'Envoyer la demande' : 'Suivant')}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Maintenance;
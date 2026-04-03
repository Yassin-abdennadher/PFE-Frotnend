// pages/Inscription.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Grid
} from '@mui/material';
import {
  LockOutlined,
  Visibility,
  VisibilityOff,
  PersonAdd,
  Email,
  Person,
  Badge,
  Business
} from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import './inscription.css';

const roles = [
  { value: 'technicien', label: 'Technicien' },
  { value: 'user', label: 'Utilisateur' }
];

const steps = ['Informations personnelles', 'Compte', 'Confirmation'];

const Inscription: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Formulaire
  const [formData, setFormData] = useState({
    userFullname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'technicien'
  });

  const urlGateway = process.env.REACT_APP_URL_GATEWAY_USERS;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateStep = () => {
    if (activeStep === 0) {
      if (!formData.userFullname.trim()) {
        setError('Nom complet requis');
        return false;
      }
      if (!formData.username.trim()) {
        setError("Nom d'utilisateur requis");
        return false;
      }
      if (formData.username.length < 3) {
        setError("Nom d'utilisateur trop court (min 3 caractères)");
        return false;
      }
      return true;
    }
    
    if (activeStep === 1) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        setError('Email requis');
        return false;
      }
      if (!emailRegex.test(formData.email)) {
        setError('Email invalide');
        return false;
      }
      if (!formData.password) {
        setError('Mot de passe requis');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Mot de passe trop court (min 6 caractères)');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return false;
      }
      return true;
    }
    
    return true;
  };

  const handleNext = () => {
    setError('');
    if (validateStep()) {
      if (activeStep === steps.length - 1) {
        handleSubmit();
      } else {
        setActiveStep(activeStep + 1);
      }
    }
  };

  const handleBack = () => {
    setError('');
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${urlGateway}`, {
        userFullname: formData.userFullname,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(response.data.message || 'Erreur lors de l\'inscription');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box className="step-content">
            <TextField
              fullWidth
              name="userFullname"
              label="Nom complet"
              value={formData.userFullname}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              name="username"
              label="Nom d'utilisateur"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
              helperText="Utilisé pour la connexion"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        );
      
      case 1:
        return (
          <Box className="step-content">
            <TextField
              fullWidth
              name="email"
              label="Email professionnel"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              name="password"
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              name="confirmPassword"
              label="Confirmer le mot de passe"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              select
              name="role"
              label="Rôle"
              value={formData.role}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business />
                  </InputAdornment>
                )
              }}
            >
              {roles.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );
      
      case 2:
        return (
          <Box className="step-content confirmation">
            <div className="confirmation-card">
              <PersonAdd className="confirmation-icon" />
              <Typography variant="h6">Vérifiez vos informations</Typography>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary">Nom complet :</Typography>
                  <Typography variant="body1">{formData.userFullname}</Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary">Nom d'utilisateur :</Typography>
                  <Typography variant="body1">{formData.username}</Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary">Email :</Typography>
                  <Typography variant="body1">{formData.email}</Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary">Rôle :</Typography>
                  <Typography variant="body1">
                    {formData.role === 'technicien' ? 'Technicien' : 'Utilisateur'}
                  </Typography>
                </Grid>
              </Grid>
            </div>
          </Box>
        );
      
      default:
        return null;
    }
  };

  if (success) {
    return (
      <Container component="main" maxWidth="xs">
        <Box className="success-container">
          <Paper className="success-paper">
            <PersonAdd className="success-icon" />
            <Typography variant="h5" gutterBottom>
              Inscription réussie !
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Votre compte a été créé avec succès.
              Vous allez être redirigé vers la page de connexion...
            </Typography>
            <CircularProgress size={24} sx={{ mt: 3 }} />
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box className="inscription-container">
        <Paper className="inscription-paper">
          <Button
                    variant='contained'
                    startIcon={<ArrowBackIcon />}
                    onClick={() => { navigate('/') }}
                >
                </Button>
          {/* Logo */}
          <Box className="logo-container">
            <Box className="logo-box">
              <PersonAdd sx={{ color: 'white', fontSize: 32 }} />
            </Box>
          </Box>

          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Créer un compte
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            GMAO - Gestion de Maintenance Assistée par Ordinateur
          </Typography>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Message d'erreur */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Formulaire */}
          <Box component="form" noValidate>
            {renderStepContent()}

            {/* Boutons navigation */}
            <Box className="button-container">
              {activeStep > 0 && (
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={loading}
                >
                  Retour
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                sx={{ ml: activeStep > 0 ? 2 : 0 }}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : activeStep === steps.length - 1 ? (
                  "S'inscrire"
                ) : (
                  "Suivant"
                )}
              </Button>
            </Box>
          </Box>

          {/* Lien connexion */}
          <Box className="login-link">
            <Typography variant="body2">
              Vous avez déjà un compte ?{' '}
              <Typography
                component="span"
                variant="body2"
                color="primary"
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate('/')}
              >
                Se connecter
              </Typography>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Inscription;
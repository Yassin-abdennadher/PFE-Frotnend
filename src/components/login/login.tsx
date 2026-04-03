// Login.tsx
import React, { useEffect, useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert, InputAdornment, IconButton } from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { login, logout } from '../../redux/slice/userSlice';
import { useDispatch } from 'react-redux';
import axios from 'axios';

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const urlGateway = process.env.REACT_APP_URL_GATEWAY_USERS;

  useEffect(() => {
    dispatch(logout());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    try {
      const res = await axios.post(`${urlGateway}/login`, {
        email: email,
        password: password
      });

      if (res.data.success) {
        localStorage.setItem('token', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);

        // ✅ AJOUTE CETTE LIGNE POUR QUE LES PROCHAINES REQUETES AIENT LE TOKEN
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;

        dispatch(login({
          user: res.data.user,
          token: res.data.accessToken,
          refreshToken: res.data.refreshToken
        }));
        navigate('/Home');
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur de connexion');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box sx={{ bgcolor: 'primary.main', borderRadius: '50%', p: 1, width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LockOutlined sx={{ color: 'white', fontSize: 32 }} />
            </Box>
          </Box>
          <Typography component="h1" variant="h5" align="center" gutterBottom>GMAO - Connexion</Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>Gestion de Maintenance Assistée par Ordinateur</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField margin="normal" required fullWidth id="email" label="Email professionnel" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField margin="normal" required fullWidth name="password" label="Mot de passe" type={showPassword ? 'text' : 'password'} id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
            <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 2, py: 1.5 }}>Se connecter</Button>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography onClick={() => navigate('/Inscription')} variant="body2" color="primary" sx={{ cursor: 'pointer' }}>S'inscrire</Typography>
              <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>Mot de passe oublié ?</Typography>
            </Box>
          </Box>
          <Typography variant="caption" align="center" display="block" sx={{ mt: 3, color: 'text.disabled' }}>Version 1.0.0 - © {new Date().getFullYear()} GMAO Pro</Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
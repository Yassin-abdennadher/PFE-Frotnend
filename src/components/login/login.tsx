import React, { useEffect, useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { login } from '../../redux/slice/userSlice';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { InternalAxiosRequestConfig } from 'axios';

const setupAxiosInterceptor = () => {
  axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    console.log('Interceptor - token:', token);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

setupAxiosInterceptor();

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const [usersData, setUsersData] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const urlGateway = process.env.REACT_APP_URL_GATEWAY_USERS;

  interface User {
    id: number,
    userFullname: string,
    username: string,
    email: string,
    password: string,
    role: 'admin' | 'technicien' | 'user'
  }

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${urlGateway}`);
      setUsersData(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    try {
      const res = await axios.post(`${urlGateway}/login`, {
        header: { 'Content-Type': 'application/json' },
        email: email,
        password: password
      });
      console.log('response', res.data);
      if (res.data.success) {
        localStorage.setItem('token', res.data.accessToken);
        dispatch(login({
          user: res.data.user,
          token: res.data.accessToken
        }));
        navigate('/Home');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          {/* Logo/Icon */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                borderRadius: '50%',
                p: 1,
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockOutlined sx={{ color: 'white', fontSize: 32 }} />
            </Box>
          </Box>

          {/* Titre */}
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            GMAO - Connexion
          </Typography>

          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Gestion de Maintenance Assistée par Ordinateur
          </Typography>

          {/* Message d'erreur */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Formulaire */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email professionnel"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              Se connecter
            </Button>

            {/* Liens supplémentaires */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography onClick={()=>navigate('/Inscritption')} variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                S'inscrire
              </Typography>
              <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                Mot de passe oublié ?
              </Typography>
            </Box>
          </Box>

          {/* Version */}
          <Typography
            variant="caption"
            align="center"
            display="block"
            sx={{ mt: 3, color: 'text.disabled' }}
          >
            Version 1.0.0 - © {new Date().getFullYear()} GMAO Pro
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
// pages/Profile.tsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Card,
  CardContent
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  Edit as EditIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material';
import { RootState } from '../../redux/store';
import { updateProfile } from '../../redux/slice/userSlice';
import axios from 'axios';
import './profile.css';

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Formulaire profil
  const [profileData, setProfileData] = useState({
    userFullname: currentUser?.userFullname || '',
    username: currentUser?.username || '',
    email: currentUser?.email || ''
  });

  // Formulaire mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_URL_GATEWAY_USERS}/${currentUser?.id}`,
        {
          userFullname: profileData.userFullname,
          username: profileData.username,
          email: profileData.email
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        dispatch(updateProfile(response.data.user));
        setSuccess('Profil mis à jour avec succès');
        setEditingProfile(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoadingPassword(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_URL_GATEWAY_USERS}/${currentUser?.id}/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSuccess('Mot de passe modifié avec succès');
        setEditingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoadingPassword(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'technicien': return 'Technicien';
      default: return 'Utilisateur';
    }
  };

  return (
    <Box className="profile-container">
      <Container maxWidth="md">
        <Paper className="profile-paper">
          {/* En-tête */}
          <Box className="profile-header">
            <Avatar className="profile-avatar">
              {currentUser?.userFullname?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="h5" className="profile-title">
              Mon profil
            </Typography>
            <Typography variant="body2" className="profile-role">
              {getRoleLabel(currentUser?.role || 'user')}
            </Typography>
          </Box>

          <Divider />

          {/* Messages */}
          {success && (
            <Alert severity="success" className="alert-message" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" className="alert-message" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Section Informations personnelles */}
          <Card className="profile-section">
            <CardContent>
              <Box className="section-header">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="h6">Informations personnelles</Typography>
                </Box>
                {!editingProfile && (
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => setEditingProfile(true)}
                  >
                    Modifier
                  </Button>
                )}
              </Box>

              <Grid container spacing={3} className="profile-form">
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Nom complet"
                    name="userFullname"
                    value={profileData.userFullname}
                    onChange={handleProfileChange}
                    disabled={!editingProfile}
                    variant={editingProfile ? 'outlined' : 'filled'}
                    InputProps={{
                      startAdornment: editingProfile && (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Nom d'utilisateur"
                    name="username"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    disabled={!editingProfile}
                    variant={editingProfile ? 'outlined' : 'filled'}
                    InputProps={{
                      startAdornment: editingProfile && (
                        <InputAdornment position="start">
                          <BadgeIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    disabled={!editingProfile}
                    variant={editingProfile ? 'outlined' : 'filled'}
                    InputProps={{
                      startAdornment: editingProfile && (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>

              {editingProfile && (
                <Box className="section-actions">
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditingProfile(false);
                      setProfileData({
                        userFullname: currentUser?.userFullname || '',
                        username: currentUser?.username || '',
                        email: currentUser?.email || ''
                      });
                    }}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Section Sécurité - Mot de passe */}
          <Card className="profile-section">
            <CardContent>
              <Box className="section-header">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VpnKeyIcon color="primary" />
                  <Typography variant="h6">Sécurité</Typography>
                </Box>
                {!editingPassword && (
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => setEditingPassword(true)}
                  >
                    Changer le mot de passe
                  </Button>
                )}
              </Box>

              {editingPassword && (
                <Grid container spacing={3} className="profile-form">
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Mot de passe actuel"
                      name="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                              {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Nouveau mot de passe"
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      helperText="Minimum 6 caractères"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                              {showNewPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Confirmer le nouveau mot de passe"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon />
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
                  </Grid>
                </Grid>
              )}

              {editingPassword && (
                <Box className="section-actions">
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditingPassword(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    disabled={loadingPassword}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleUpdatePassword}
                    disabled={loadingPassword}
                    startIcon={loadingPassword ? <CircularProgress size={20} /> : <SaveIcon />}
                  >
                    {loadingPassword ? 'Modification...' : 'Changer le mot de passe'}
                  </Button>
                </Box>
              )}

              {!editingPassword && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  • • • • • • • • • • • • • • • • 
                </Typography>
              )}
            </CardContent>
          </Card>
        </Paper>
      </Container>
    </Box>
  );
};

export default Profile;
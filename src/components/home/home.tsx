// pages/Home.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Paper,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { RootState } from '../../redux/store';
import './home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const role = currentUser?.role || 'user';

  const stats = {
    machines: 24,
    interventions: 8,
    enCours: 3,
    alertes: 2
  };

  const menuItems = [
    { title: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard', roles: ['admin', 'user', 'technicien'] },
    { title: 'Équipements', icon: <InventoryIcon />, path: '/Equipements', roles: ['admin', 'user', 'technicien'] },
    { title: 'Interventions', icon: <AssignmentIcon />, path: '/taches', roles: ['admin', 'technicien'] },
    { title: 'Maintenance', icon: <BuildIcon />, path: '/maintenance', roles: ['admin','technicien', 'user'] },
    { title: 'Techniciens', icon: <PeopleIcon />, path: '/techniciens', roles: ['admin', 'user'] }
  ];

  const visibleMenu = menuItems.filter(item => item.roles.includes(role));

  return (
    <Box className="home-container">
      <Container maxWidth="lg">
        {/* En-tête */}
        <Box className="welcome-section">
          <Avatar className="welcome-avatar">
            {currentUser?.userFullname?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" className="welcome-title">
              Bienvenue, {currentUser?.userFullname} !
            </Typography>
            <Typography variant="body1" className="welcome-subtitle">
              {role === 'admin' && 'Gestionnaire principal'}
              {role === 'user' && 'utilisateur'}
              {role === 'technicien' && 'Technicien de maintenance'}
            </Typography>
          </Box>
        </Box>

        {/* Cartes statistiques */}
        <Grid container spacing={3} className="stats-grid">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper className="stats-card">
              <InventoryIcon className="stats-icon primary" />
              <Typography className="stats-value">{stats.machines}</Typography>
              <Typography className="stats-label">Équipements</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper className="stats-card">
              <AssignmentIcon className="stats-icon warning" />
              <Typography className="stats-value">{stats.interventions}</Typography>
              <Typography className="stats-label">Interventions</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper className="stats-card">
              <ScheduleIcon className="stats-icon info" />
              <Typography className="stats-value">{stats.enCours}</Typography>
              <Typography className="stats-label">En cours</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper className={`stats-card ${stats.alertes > 0 ? 'alert' : ''}`}>
              <WarningIcon className="stats-icon error" />
              <Typography className={`stats-value ${stats.alertes > 0 ? 'error-text' : ''}`}>
                {stats.alertes}
              </Typography>
              <Typography className="stats-label">Alertes</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Divider className="divider" />

        {/* Menu rapide */}
        <Typography className="section-title">Accès rapide</Typography>
        <Grid container spacing={2} className="menu-grid">
          {visibleMenu.map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.title}>
              <Card className="menu-card" onClick={() => navigate(item.path)}>
                <CardContent>
                  <Box className="menu-icon">{item.icon}</Box>
                  <Typography className="menu-title">{item.title}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Dernières interventions */}
        <Typography className="section-title">Dernières interventions</Typography>
        <Paper className="empty-state">
          <Typography variant="body2">Aucune intervention en cours</Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;
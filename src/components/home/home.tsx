import React, { useEffect, useState } from 'react';
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
  Divider,
  Chip
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
import axios from 'axios';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const role = currentUser?.role || 'user';
  const urlMain = process.env.REACT_APP_URL_GATEWAY_MAIN;
  const [equipements, setEquipements] = useState(0);
  const [interventionsNbr, setInterventionsNbr] = useState(0);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [interEnCours, setInterEnCours] = useState(0);
  const [alertes , setAlertes]=useState<number>(0);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const resMachines = await axios.get(`${urlMain}/machines`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resPieces = await axios.get(`${urlMain}/pieces`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlertes(resPieces.data.filter((piece : any)=>piece.quantiteStock < piece.seuilAlerte).length);
      setEquipements(resMachines.data.length + resPieces.data.length);
      const resPrev = await axios.get(`${urlMain}/taches/preventive`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resCur = await axios.get(`${urlMain}/taches/curative`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const somme = resCur.data.data.length + resPrev.data.data.length
      setInterventionsNbr(somme);
      setInterventions([...resPrev.data.data, ...resCur.data.data]);
      const resEnCours = resCur.data.data.filter((tachCur: any) => tachCur.statut === 'en_cours').length + resPrev.data.data.filter((tachPrev: any) => tachPrev.statut === 'en_cours').length;
      setInterEnCours(resEnCours);
    } catch (err) {
      console.error('Error : ', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = {
    machines: equipements,
    interventions: interventionsNbr,
    enCours: interEnCours,
    alertes: alertes
  };

  const menuItems = [
    { title: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard', roles: ['admin', 'technicien'] },
    { title: 'Équipements', icon: <InventoryIcon />, path: '/Equipements', roles: ['admin', 'user', 'technicien'] },
    { title: 'Interventions', icon: <AssignmentIcon />, path: '/Interventions', roles: ['admin', 'technicien'] },
    { title: 'Maintenance', icon: <BuildIcon />, path: '/maintenance', roles: ['technicien', 'user'] },
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
            <Typography variant="h4" className="welcome-title" color="text.primary">
              Bienvenue, {currentUser?.userFullname} !
            </Typography>
            <Typography variant="body1" className="welcome-subtitle" color="text.secondary">
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
        <Typography className="section-title" color="text.primary">Accès rapide</Typography>
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
        <Typography className="section-title" color="text.primary">Dernières interventions</Typography>
        <Paper className="empty-state">
          {interventionsNbr === 0 ? (
            <Typography variant="body2">Aucune intervention</Typography>
          ) : (
            <Box>
              {
                (role === 'technicien'
                  ? interventions?.filter((i: any) => i.technicienId === currentUser?.id?.toString()).sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  ).slice(0, 5)
                  : interventions?.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  ).slice(0, 10)
                ).map((intervention: any) => (
                  <Box
                    key={intervention._id}
                    sx={{
                      p: 2,
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => navigate(`/taches/${intervention.type === 'preventive' ? 'preventive' : 'curative'}/${intervention._id}`)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight={500}>
                        {intervention.titre}
                      </Typography>
                      <Chip
                        label={intervention.statut}
                        size="small"
                        color={
                          intervention.statut === 'terminee' ? 'success' :
                            intervention.statut === 'en_cours' ? 'warning' : 'default'
                        }
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {intervention.type === 'preventive' ? 'Préventive' : 'Curative'} - {new Date(intervention.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;
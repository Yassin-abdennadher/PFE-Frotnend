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
import GroupIcon from '@mui/icons-material/Group';
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
  const [alertes, setAlertes] = useState<number>(0);
  const [demandes, setDemandes] = useState<any[]>([]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const resMachines = await axios.get(`${urlMain}/machines`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resPieces = await axios.get(`${urlMain}/pieces`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlertes(resPieces.data.filter((piece: any) => piece.quantiteStock < piece.seuilAlerte).length);
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

      // Récupérer les demandes pour l'utilisateur
      if (role === 'user') {
        const resDemandes = await axios.get(`${urlMain}/demandes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        let demandesData = resDemandes.data.data || resDemandes.data || [];
        demandesData = demandesData.filter((d: any) => d.userId === currentUser?.id?.toString());
        setDemandes(demandesData);
      }
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
    { title: 'Utilisateurs', icon: <GroupIcon />, path: '/utilisateurs', roles: ['admin'] },
    { title: 'Techniciens', icon: <PeopleIcon />, path: '/techniciens', roles: ['admin', 'user'] },
    { title: 'Demandes', icon: <PeopleIcon />, path: '/Demandes', roles: ['admin', 'user'] }
  ];

  const visibleMenu = menuItems.filter(item => item.roles.includes(role));

  const getStatutChip = (statut: string) => {
    const config: any = {
      planifiee: { label: 'Planifiée', color: 'info' },
      ouverte: { label: 'Ouverte', color: 'warning' },
      en_cours: { label: 'En cours', color: 'primary' },
      terminee: { label: 'Terminée', color: 'success' },
      en_attente: { label: 'En attente', color: 'warning' },
      validee: { label: 'Validée', color: 'success' },
      refusee: { label: 'Refusée', color: 'error' },
      transformee: { label: 'Transformée', color: 'primary' }
    };
    const { label, color } = config[statut] || { label: statut, color: 'default' };
    return <Chip label={label} color={color} size="small" />;
  };

  // Pour l'utilisateur, afficher les demandes au lieu des interventions
  const userRecentItems = role === 'user' ? demandes : interventions;

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
              {role === 'user' && 'Utilisateur'}
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

        {/* Dernières interventions / Demandes */}
        <Typography className="section-title" color="text.primary">
          {role === 'user' ? 'Mes demandes récentes' : 'Dernières interventions'}
        </Typography>
        <Paper className="empty-state">
          {userRecentItems.length === 0 ? (
            <Typography variant="body2">
              {role === 'user' ? 'Aucune demande' : 'Aucune intervention'}
            </Typography>
          ) : (
            <Box>
              {(role === 'technicien'
                ? userRecentItems?.filter((i: any) => i.technicienId === currentUser?.id?.toString()).sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  ).slice(0, 5)
                : userRecentItems?.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  ).slice(0, 10)
              ).map((item: any) => (
                <Box
                  key={item._id}
                  sx={{
                    p: 2,
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => {
                    if (role === 'user') {
                      navigate(`/Demandes`);
                    } else {
                      navigate(`/taches/${item.type === 'preventive' ? 'preventive' : 'curative'}/${item._id}`);
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" fontWeight={500}>
                      {item.titre}
                    </Typography>
                    {getStatutChip(item.statut)}
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {role === 'user' 
                      ? `Demande - ${new Date(item.createdAt).toLocaleDateString()}`
                      : `${item.type === 'preventive' ? 'Préventive' : 'Curative'} - ${new Date(item.createdAt).toLocaleDateString()}`
                    }
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
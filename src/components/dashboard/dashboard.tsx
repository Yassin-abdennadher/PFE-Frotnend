// pages/Dashboard.tsx
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
  Paper,
  Divider,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Build as BuildIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { RootState } from '../../redux/store';
import axios from 'axios';
import './dashboard.css';

// Définir les interfaces
interface Intervention {
  _id: string;
  titre: string;
  type: 'preventive' | 'curative';
  statut: string;
  createdAt: string;
  machineId: string;
}

interface Machine {
  _id: string;
  nom: string;
}

interface Piece {
  _id: string;
  nom: string;
  quantiteStock: number;
  seuilAlerte: number;
}

interface TopPanne {
  machineId: string;
  machineNom: string;
  count: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const role = currentUser?.role || 'user';
  const urlMain = process.env.REACT_APP_URL_GATEWAY_MAIN;

  const [stats, setStats] = useState({
    totalMachines: 0,
    totalInterventions: 0,
    interventionsEnCours: 0,
    interventionsTerminees: 0,
    alertesStock: 0
  });

  const [recentInterventions, setRecentInterventions] = useState<Intervention[]>([]);
  const [topPannes, setTopPannes] = useState<TopPanne[]>([]);
  const [alertesStock, setAlertesStock] = useState<Piece[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Machines
      const machinesRes = await axios.get(`${urlMain}/machines`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const machines: Machine[] = machinesRes.data.data || machinesRes.data || [];
      
      // Pièces pour alertes stock
      const piecesRes = await axios.get(`${urlMain}/pieces`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pieces: Piece[] = piecesRes.data.data || piecesRes.data || [];
      const alertes = pieces.filter((p: Piece) => p.quantiteStock <= p.seuilAlerte);
      
      // Interventions
      const prevRes = await axios.get(`${urlMain}/taches/preventive`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const curRes = await axios.get(`${urlMain}/taches/curative`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const prevData: Intervention[] = prevRes.data.data || prevRes.data || [];
      const curData: Intervention[] = curRes.data.data || curRes.data || [];
      const allInterventions = [...prevData, ...curData];
      
      const enCours = allInterventions.filter((i: Intervention) => i.statut === 'en_cours').length;
      const terminees = allInterventions.filter((i: Intervention) => i.statut === 'terminee').length;
      
      // Top 3 machines les plus en panne
      const pannesCount = new Map<string, number>();
      curData.forEach((i: Intervention) => {
        pannesCount.set(i.machineId, (pannesCount.get(i.machineId) || 0) + 1);
      });
      const topPannesList = Array.from(pannesCount.entries())
        .map(([id, count]) => ({ machineId: id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      
      // Récupérer les noms des machines
      const machinesMap = new Map(machines.map((m: Machine) => [m._id, m.nom]));
      const topPannesWithNames: TopPanne[] = topPannesList.map((p: { machineId: string; count: number }) => ({
        machineId: p.machineId,
        machineNom: machinesMap.get(p.machineId) || p.machineId,
        count: p.count
      }));
      
      // Dernières interventions (5 dernières)
      const recent = [...allInterventions]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5) as Intervention[];
      
      setStats({
        totalMachines: machines.length,
        totalInterventions: allInterventions.length,
        interventionsEnCours: enCours,
        interventionsTerminees: terminees,
        alertesStock: alertes.length
      });
      
      setRecentInterventions(recent);
      setTopPannes(topPannesWithNames);
      setAlertesStock(alertes);
      
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatutChip = (statut: string) => {
    const config: Record<string, { label: string; color: 'info' | 'warning' | 'primary' | 'success' | 'default' }> = {
      planifiee: { label: 'Planifiée', color: 'info' },
      ouverte: { label: 'Ouverte', color: 'warning' },
      en_cours: { label: 'En cours', color: 'primary' },
      terminee: { label: 'Terminée', color: 'success' }
    };
    const { label, color } = config[statut] || { label: statut, color: 'default' };
    return <Chip label={label} size="small" color={color} />;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, mt: 8 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>Chargement...</Typography>
      </Box>
    );
  }

  return (
    <Box className="dashboard-container">
      <Container maxWidth="lg">
        {/* En-tête */}
        <Box className="dashboard-header">
          <Typography variant="h4" className="page-title">
            Tableau de bord
          </Typography>
          <Typography variant="body2" className="page-subtitle">
            Vue d'ensemble de votre activité maintenance
          </Typography>
        </Box>

        {/* Cartes KPIs */}
        <Grid container spacing={3} className="kpi-grid">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card className="kpi-card">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h3" className="kpi-value">{stats.totalMachines}</Typography>
                    <Typography variant="body2" color="text.secondary">Équipements</Typography>
                  </Box>
                  <InventoryIcon className="kpi-icon primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card className="kpi-card">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h3" className="kpi-value">{stats.totalInterventions}</Typography>
                    <Typography variant="body2" color="text.secondary">Interventions</Typography>
                  </Box>
                  <AssignmentIcon className="kpi-icon warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card className="kpi-card">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h3" className="kpi-value">{stats.interventionsEnCours}</Typography>
                    <Typography variant="body2" color="text.secondary">En cours</Typography>
                  </Box>
                  <PendingIcon className="kpi-icon info" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card className="kpi-card alert-card">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h3" className="kpi-value error-text">{stats.alertesStock}</Typography>
                    <Typography variant="body2" color="text.secondary">Alertes stock</Typography>
                  </Box>
                  <WarningIcon className="kpi-icon error" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider className="divider" />

        <Grid container spacing={3}>
          {/* Dernières interventions */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper className="dashboard-panel">
              <Box className="panel-header">
                <Typography variant="h6">Dernières interventions</Typography>
                <Button size="small" onClick={() => navigate('/Interventions')}>Voir tout</Button>
              </Box>
              <Divider />
              {recentInterventions.length === 0 ? (
                <Box className="empty-state">
                  <Typography variant="body2" color="text.secondary">Aucune intervention</Typography>
                </Box>
              ) : (
                <List>
                  {recentInterventions.map((intervention, idx) => (
                    <React.Fragment key={intervention._id}>
                      <ListItem 
                        component="div"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/taches/${intervention.type === 'preventive' ? 'preventive' : 'curative'}/${intervention._id}`)}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: intervention.type === 'preventive' ? 'primary.main' : 'warning.main' }}>
                            <BuildIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={intervention.titre}
                          secondary={`${intervention.type === 'preventive' ? 'Préventive' : 'Curative'} - ${new Date(intervention.createdAt).toLocaleDateString()}`}
                        />
                        {getStatutChip(intervention.statut)}
                      </ListItem>
                      {idx < recentInterventions.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* Top machines en panne */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper className="dashboard-panel">
              <Box className="panel-header">
                <Typography variant="h6">Machines les plus en panne</Typography>
              </Box>
              <Divider />
              {topPannes.length === 0 ? (
                <Box className="empty-state">
                  <Typography variant="body2" color="text.secondary">Aucune panne enregistrée</Typography>
                </Box>
              ) : (
                <List>
                  {topPannes.map((item, idx) => (
                    <React.Fragment key={item.machineId}>
                      <ListItem component="div">
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'error.main' }}>
                            <BuildIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.machineNom}
                          secondary={`${item.count} intervention${item.count > 1 ? 's' : ''}`}
                        />
                        <Chip label={`${item.count}`} size="small" color="error" />
                      </ListItem>
                      {idx < topPannes.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* Alertes stock */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper className="dashboard-panel">
              <Box className="panel-header">
                <Typography variant="h6">Alertes stock</Typography>
                <Button size="small" onClick={() => navigate('/Equipements')}>Voir tout</Button>
              </Box>
              <Divider />
              {alertesStock.length === 0 ? (
                <Box className="empty-state">
                  <Typography variant="body2" color="text.secondary">Aucune alerte stock</Typography>
                </Box>
              ) : (
                <List>
                  {alertesStock.map((piece, idx) => (
                    <React.Fragment key={piece._id}>
                      <ListItem 
                        component="div"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate('/Equipements')}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'warning.main' }}>
                            <WarningIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={piece.nom}
                          secondary={`Stock: ${piece.quantiteStock} / Seuil: ${piece.seuilAlerte}`}
                        />
                        <Chip label="Stock bas" size="small" color="warning" />
                      </ListItem>
                      {idx < alertesStock.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* Statistiques rapides */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper className="dashboard-panel">
              <Box className="panel-header">
                <Typography variant="h6">Statistiques</Typography>
              </Box>
              <Divider />
              <Box className="stats-summary">
                <Box className="stat-item">
                  <CheckCircleIcon className="stat-icon success" />
                  <Box>
                    <Typography variant="h5">{stats.interventionsTerminees}</Typography>
                    <Typography variant="caption" color="text.secondary">Interventions terminées</Typography>
                  </Box>
                </Box>
                <Box className="stat-item">
                  <PeopleIcon className="stat-icon primary" />
                  <Box>
                    <Typography variant="h5">-</Typography>
                    <Typography variant="caption" color="text.secondary">Techniciens actifs</Typography>
                  </Box>
                </Box>
                <Box className="stat-item">
                  <TrendingUpIcon className="stat-icon info" />
                  <Box>
                    <Typography variant="h5">{stats.totalInterventions === 0 ? 0 : Math.round(stats.interventionsTerminees / stats.totalInterventions * 100)}%</Typography>
                    <Typography variant="caption" color="text.secondary">Taux d'achèvement</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
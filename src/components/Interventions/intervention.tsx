// pages/Interventions.tsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Grid,
  Rating,
  LinearProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Done as DoneIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { RootState } from '../../redux/store';
import axios from 'axios';
import './interventions.css';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

interface Machine {
  _id: string;
  nom: string;
}

interface Technicien {
  id: number;
  userFullname: string;
}

interface TachePreventive {
  _id: string;
  titre: string;
  description: string;
  machineId: string;
  machineNom?: string;
  technicienId: string;
  technicienNom?: string;
  type: 'preventive';
  frequence: 'hebdomadaire' | 'mensuel' | 'trimestriel' | 'annuel';
  compteurRequis?: number;
  dateProchaine: string;
  dateDerniere?: string;
  statut: 'planifiee' | 'en_cours' | 'terminee';
}

interface TacheCurative {
  _id: string;
  titre: string;
  description: string;
  machineId: string;
  machineNom?: string;
  technicienId: string;
  technicienNom?: string;
  type: 'curative';
  urgence: 'basse' | 'moyenne' | 'haute' | 'critique';
  piecesUtilisees: { pieceId: string; quantite: number }[];
  tempsPasse: number;
  rapport: string;
  panne: string;
  statut: 'ouverte' | 'en_cours' | 'terminee';
}

const Interventions: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const role = currentUser?.role || 'user';
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTache, setSelectedTache] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openDialogDelete, setOpenDialogDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'preventive' | 'curative' } | null>(null);

  const [preventives, setPreventives] = useState<TachePreventive[]>([]);
  const [curatives, setCuratives] = useState<TacheCurative[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [techniciens, setTechniciens] = useState<Technicien[]>([]);

  const urlMain = process.env.REACT_APP_URL_GATEWAY_MAIN;
  const urlAuth = process.env.REACT_APP_URL_GATEWAY_USERS;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');

        const machinesRes = await axios.get(`${urlMain}/machines`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setMachines(machinesRes.data);

        const techRes = await axios.get(`${urlAuth}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const techniciens = techRes.data.data.filter((user: any) => {
          return user.role === 'technicien'
        })
        setTechniciens(techniciens);

        const prevRes = await axios.get(`${urlMain}/taches/preventive`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPreventives(prevRes.data.data);

        const curRes = await axios.get(`${urlMain}/taches/curative`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCuratives(curRes.data.data || []);
      } catch (error) {
        console.error('Erreur chargement:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getMachineNom = (machineId: string) => {
    return machines.find(m => m._id === machineId)?.nom || machineId;
  };

  const getTechnicienNom = (techId: number) => {
    return techniciens.find((t) => t.id === techId)?.userFullname || techId;
  };

  const getStatutChip = (statut: string) => {
    const config: any = {
      planifiee: { label: 'Planifiée', color: 'info' },
      ouverte: { label: 'Ouverte', color: 'warning' },
      en_cours: { label: 'En cours', color: 'primary' },
      terminee: { label: 'Terminée', color: 'success' }
    };
    const { label, color } = config[statut] || { label: statut, color: 'default' };
    return <Chip label={label} color={color} size="small" />;
  };

  const getUrgenceChip = (urgence: string) => {
    const config: any = {
      basse: { label: 'Basse', color: 'success' },
      moyenne: { label: 'Moyenne', color: 'info' },
      haute: { label: 'Haute', color: 'warning' },
      critique: { label: 'Critique', color: 'error' }
    };
    const { label, color } = config[urgence];
    return <Chip label={label} color={color} size="small" />;
  };

  const getFrequenceLabel = (freq: string) => {
    const labels: any = {
      hebdomadaire: 'Hebdomadaire',
      mensuel: 'Mensuel',
      trimestriel: 'Trimestriel',
      annuel: 'Annuel'
    };
    return labels[freq] || freq;
  };

  const filteredPreventives = preventives.filter(p =>
    p.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCuratives = curatives.filter(c =>
    c.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.panne.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canEdit = role === 'admin';
  const isTechnicien = role === 'technicien';

  const handleDelete = (id: string, type: 'preventive' | 'curative') => {
    setDeleteTarget({ id, type });
    setOpenDialogDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const token = localStorage.getItem('token');
      const endpoint = deleteTarget.type === 'preventive'
        ? `${urlMain}/taches/preventive/${deleteTarget.id}`
        : `${urlMain}/taches/curative/${deleteTarget.id}`;

      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (deleteTarget.type === 'preventive') {
        setPreventives(prev => prev.filter(p => p._id !== deleteTarget.id));
      } else {
        setCuratives(prev => prev.filter(c => c._id !== deleteTarget.id));
      }

      setOpenDialogDelete(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string, type: 'preventive' | 'curative') => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'preventive'
        ? `${urlMain}/taches/preventive/${id}`
        : `${urlMain}/taches/curative/${id}`;

      await axios.put(endpoint, { statut: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (type === 'preventive') {
        const res = await axios.get(`${urlMain}/taches/preventive`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPreventives(res.data.data);
      } else {
        const res = await axios.get(`${urlMain}/taches/curative`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCuratives(res.data.data);
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
    }
  };

  const handleViewDetail = (tache: any) => {
    setSelectedTache(tache);
    setOpenDialog(true);
  };

  if (loading) {
    return (
      <Box className="interventions-container">
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>Chargement...</Typography>
      </Box>
    );
  }

  return (
    <Box className="interventions-container">
      <Container maxWidth="lg">
        {/* En-tête */}
        <Box className="interventions-header">
          <Box>
            <Button
              variant='contained'
              startIcon={<ArrowBackIcon />}
              onClick={() => { navigate('/Home') }}
            >
              retour
            </Button>
            <Typography variant="h4" className="page-title" color="text.primary">
              Interventions
            </Typography>
            <Typography variant="body2" className="page-subtitle" color="text.secondary">
              Gérez les maintenances préventives et curatives
            </Typography>
          </Box>
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(tabValue === 0 ? '/taches/preventive/ajouter' : '/taches/curative/ajouter')}
            >
              {tabValue === 0 ? 'Nouvelle préventive' : 'Nouvelle curative'}
            </Button>
          )}
        </Box>

        {/* Tabs */}
        <Paper className="tabs-container">
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab icon={<BuildIcon />} label="Préventives" />
            <Tab icon={<AssignmentIcon />} label="Curatives" />
          </Tabs>
        </Paper>

        {/* Barre de recherche */}
        <TextField
          fullWidth
          placeholder="Rechercher par titre, description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />

        {/* Onglet Préventives */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper} className="table-container">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Titre</TableCell>
                  <TableCell>Machine</TableCell>
                  <TableCell>Technicien</TableCell>
                  <TableCell>Fréquence</TableCell>
                  <TableCell>Prochaine date</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPreventives.map((tache) => (
                  <TableRow key={tache._id} hover onClick={() => handleViewDetail(tache)} sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {tache.titre}
                      </Typography>
                    </TableCell>
                    <TableCell>{getMachineNom(tache.machineId)}</TableCell>
                    <TableCell>{getTechnicienNom(parseInt(tache.technicienId))}</TableCell>
                    <TableCell>{getFrequenceLabel(tache.frequence)}</TableCell>
                    <TableCell>{new Date(tache.dateProchaine).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatutChip(tache.statut)}</TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      {isTechnicien && tache.statut === 'planifiee' && (
                        <IconButton size="small" onClick={() => handleStatusChange(tache._id, 'en_cours', 'preventive')}>
                          <PlayArrowIcon fontSize="small" />
                        </IconButton>
                      )}
                      {isTechnicien && tache.statut === 'en_cours' && (
                        <IconButton size="small" onClick={() => handleStatusChange(tache._id, 'terminee', 'preventive')}>
                          <DoneIcon fontSize="small" color="success" />
                        </IconButton>
                      )}
                      {canEdit && (
                        <>
                          <IconButton size="small" onClick={() => navigate(`/taches/preventive/${tache._id}`)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(tache._id, 'preventive')}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPreventives.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Aucune tâche préventive trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Onglet Curatives */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper} className="table-container">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Titre</TableCell>
                  <TableCell>Machine</TableCell>
                  <TableCell>Panne</TableCell>
                  <TableCell>Urgence</TableCell>
                  <TableCell>Temps passé</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCuratives.map((tache) => (
                  <TableRow key={tache._id} hover onClick={() => handleViewDetail(tache)} sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {tache.titre}
                      </Typography>
                    </TableCell>
                    <TableCell>{getMachineNom(tache.machineId)}</TableCell>
                    <TableCell>{tache.panne}</TableCell>
                    <TableCell>{getUrgenceChip(tache.urgence)}</TableCell>
                    <TableCell>{tache.tempsPasse} min</TableCell>
                    <TableCell>{getStatutChip(tache.statut)}</TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      {isTechnicien && tache.statut === 'ouverte' && (
                        <IconButton size="small" onClick={() => handleStatusChange(tache._id, 'en_cours', 'curative')}>
                          <PlayArrowIcon fontSize="small" />
                        </IconButton>
                      )}
                      {isTechnicien && tache.statut === 'en_cours' && (
                        <IconButton size="small" onClick={() => handleStatusChange(tache._id, 'terminee', 'curative')}>
                          <DoneIcon fontSize="small" color="success" />
                        </IconButton>
                      )}
                      {canEdit && (
                        <>
                          <IconButton size="small" onClick={() => navigate(`/taches/curative/${tache._id}`)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(tache._id, 'curative')}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCuratives.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Aucune tâche curative trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Container>

      {/* Dialogue détails */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTache?.titre}
          <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setOpenDialog(false)}>
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTache && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">Machine</Typography>
                <Typography>{getMachineNom(selectedTache.machineId)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">Technicien</Typography>
                <Typography>{getTechnicienNom(parseInt(selectedTache.technicienId))}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">Description</Typography>
                <Typography>{selectedTache.description || 'Aucune description'}</Typography>
              </Grid>
              {selectedTache.type === 'curative' && (
                <>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">Panne</Typography>
                    <Typography>{selectedTache.panne}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">Temps passé</Typography>
                    <Typography>{selectedTache.tempsPasse} minutes</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">Rapport</Typography>
                    <Typography>{selectedTache.rapport || 'Non renseigné'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">Pièces utilisées</Typography>
                    {selectedTache.piecesUtilisees?.length > 0 ? (
                      selectedTache.piecesUtilisees.map((p: any, idx: number) => (
                        <Typography key={idx}>• {p.pieceId} x{p.quantite}</Typography>
                      ))
                    ) : (
                      <Typography>Aucune</Typography>
                    )}
                  </Grid>
                </>
              )}
              {selectedTache.type === 'preventive' && (
                <>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">Fréquence</Typography>
                    <Typography>{getFrequenceLabel(selectedTache.frequence)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">Prochaine date</Typography>
                    <Typography>{new Date(selectedTache.dateProchaine).toLocaleDateString()}</Typography>
                  </Grid>
                  {selectedTache.compteurRequis && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" color="text.secondary">Compteur requis</Typography>
                      <Typography>{selectedTache.compteurRequis}</Typography>
                    </Grid>
                  )}
                </>
              )}
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">Statut</Typography>
                <Box sx={{ mt: 1 }}>{getStatutChip(selectedTache.statut)}</Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Fermer</Button>
          {canEdit && selectedTache && (
            <Button variant="contained" onClick={() => {
              setOpenDialog(false);
              navigate(`/taches/${selectedTache.type}/${selectedTache._id}`);
            }}>
              Modifier
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <Dialog open={openDialogDelete} onClose={() => setOpenDialogDelete(false)}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>Voulez-vous vraiment supprimer ?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialogDelete(false)}>Annuler</Button>
          <Button onClick={handleConfirmDelete} color="error">Supprimer</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Interventions;
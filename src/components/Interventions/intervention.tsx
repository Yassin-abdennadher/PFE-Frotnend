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
  Grid,
  MenuItem,
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

interface Piece {
  _id: string;
  nom: string;
  reference: string;
  quantiteStock: number;
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
  const [openPiecesDialog, setOpenPiecesDialog] = useState(false);
  const [piecesUtilisees, setPiecesUtilisees] = useState([{ pieceId: '', quantite: 1 }]);
  const [currentTacheId, setCurrentTacheId] = useState('');
  const [currentTacheType, setCurrentTacheType] = useState<'preventive' | 'curative'>('curative');
  const [tempsPasse, setTempsPasse] = useState(0);

  const [preventives, setPreventives] = useState<TachePreventive[]>([]);
  const [curatives, setCuratives] = useState<TacheCurative[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [techniciens, setTechniciens] = useState<Technicien[]>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);

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

        const piecesRes = await axios.get(`${urlMain}/pieces`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPieces(piecesRes.data.data || piecesRes.data || []);

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
        let prevData = prevRes.data.data || [];

        if (role === 'technicien' && currentUser?.id) {
          prevData = prevData.filter((tache: any) => tache.technicienId === currentUser.id.toString());
        }
        setPreventives(prevData);

        const curRes = await axios.get(`${urlMain}/taches/curative`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        let curData = curRes.data.data || [];

        if (role === 'technicien' && currentUser?.id) {
          curData = curData.filter((tache: any) => tache.technicienId === currentUser.id.toString());
        }
        setCuratives(curData);
      } catch (error) {
        console.error('Erreur chargement:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [role, currentUser?.id]);

  const getMachineNom = (machineId: string) => {
    return machines.find(m => m._id === machineId)?.nom || machineId;
  };

  const getTechnicienNom = (techId: number) => {
    return techniciens.find((t) => t.id === techId)?.userFullname || techId;
  };

  const getPieceNom = (pcsId : string)=>{
    return pieces.find((p)=>p._id === pcsId)?.nom || pcsId ;
  }

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

  const updateStockPieces = async (piecesUtilisees: { pieceId: string; quantite: number }[]) => {
    try {
      const token = localStorage.getItem('token');

      for (const piece of piecesUtilisees) {
        const pieceRes = await axios.get(`${urlMain}/pieces/${piece.pieceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const pieceActuelle = pieceRes.data;
        const nouvelleQuantite = pieceActuelle.quantiteStock - piece.quantite;

        await axios.put(`${urlMain}/pieces/${piece.pieceId}`, {
          quantiteStock: nouvelleQuantite
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Erreur mise à jour stock:', error);
      throw error;
    }
  };

  const handleStatusChange = async (id: string, newStatus: string, type: 'preventive' | 'curative') => {
    if (type === 'curative' && newStatus === 'terminee') {
      setCurrentTacheId(id);
      setCurrentTacheType(type);
      setTempsPasse(0);
      setPiecesUtilisees([{ pieceId: '', quantite: 1 }]);
      setOpenPiecesDialog(true);
      return;
    }

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
        let data = res.data.data || [];
        if (role === 'technicien' && currentUser?.id) {
          data = data.filter((tache: any) => tache.technicienId === currentUser.id.toString());
        }
        setPreventives(data);
      } else {
        const res = await axios.get(`${urlMain}/taches/curative`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        let data = res.data.data || [];
        if (role === 'technicien' && currentUser?.id) {
          data = data.filter((tache: any) => tache.technicienId === currentUser.id.toString());
        }
        setCuratives(data);
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
    }
  };


  const handleConfirmTerminer = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = `${urlMain}/taches/curative/${currentTacheId}`;

      await updateStockPieces(piecesUtilisees);

      await axios.put(endpoint, {
        statut: 'terminee',
        piecesUtilisees: piecesUtilisees,
        tempsPasse: tempsPasse
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOpenPiecesDialog(false);
      setPiecesUtilisees([{ pieceId: '', quantite: 1 }]);
      setTempsPasse(0);

      const res = await axios.get(`${urlMain}/taches/curative`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let data = res.data.data || [];
      if (role === 'technicien' && currentUser?.id) {
        data = data.filter((tache: any) => tache.technicienId === currentUser.id.toString());
      }
      setCuratives(data);

      const piecesRes = await axios.get(`${urlMain}/pieces`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPieces(piecesRes.data.data || piecesRes.data || []);

    } catch (error) {
      console.error('Erreur:', error);
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
                        <Typography key={idx}>• {getPieceNom(p.pieceId)} x{p.quantite}</Typography>
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

      {/* Dialogue suppression */}
      <Dialog open={openDialogDelete} onClose={() => setOpenDialogDelete(false)}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>Voulez-vous vraiment supprimer ?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialogDelete(false)}>Annuler</Button>
          <Button onClick={handleConfirmDelete} color="error">Supprimer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue pièces utilisées et temps passé */}
      <Dialog open={openPiecesDialog} onClose={() => setOpenPiecesDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Terminer l'intervention
          <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setOpenPiecesDialog(false)}>
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
            Pièces utilisées
          </Typography>
          {piecesUtilisees.map((piece, index) => (
            <Grid container spacing={2} key={index} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Pièce"
                  value={piece.pieceId}
                  onChange={(e) => {
                    const newPieces = [...piecesUtilisees];
                    newPieces[index].pieceId = e.target.value;
                    setPiecesUtilisees(newPieces);
                  }}
                  required
                >
                  {pieces.map((p: any) => (
                    <MenuItem key={p._id} value={p._id}>{p.nom} ({p.reference})</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Quantité"
                  type="number"
                  value={piece.quantite}
                  onChange={(e) => {
                    const newPieces = [...piecesUtilisees];
                    newPieces[index].quantite = parseInt(e.target.value) || 1;
                    setPiecesUtilisees(newPieces);
                  }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <Button color="error" onClick={() => {
                  const newPieces = piecesUtilisees.filter((_, i) => i !== index);
                  setPiecesUtilisees(newPieces);
                }}>Supprimer</Button>
              </Grid>
            </Grid>
          ))}
          <Button onClick={() => setPiecesUtilisees([...piecesUtilisees, { pieceId: '', quantite: 1 }])} sx={{ mt: 2 }}>
            + Ajouter une pièce
          </Button>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
            Temps passé
          </Typography>
          <TextField
            fullWidth
            label="Temps passé (minutes)"
            type="number"
            value={tempsPasse}
            onChange={(e) => setTempsPasse(parseInt(e.target.value) || 0)}
            InputProps={{
              startAdornment: <InputAdornment position="start">⏱️</InputAdornment>
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPiecesDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleConfirmTerminer}>Valider</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Interventions;
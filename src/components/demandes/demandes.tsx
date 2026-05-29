// pages/Demandes.tsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
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
    Alert,
    CircularProgress,
    LinearProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    Cancel as CancelIcon,
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon,
    Build as BuildIcon
} from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { RootState } from '../../redux/store';
import axios from 'axios';
import './demandes.css';

interface Machine {
    _id: string;
    nom: string;
}

interface Demande {
    _id: string;
    userId : string;
    titre: string;
    description: string;
    machineId: string;
    machineNom?: string;
    urgence: 'basse' | 'moyenne' | 'haute' | 'critique';
    statut: 'en_attente' | 'validee' | 'refusee' | 'transformee';
    dateSouhaitee?: string;
    motifRefus?: string;
    createdAt: string;
}

const Demandes: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useSelector((state: RootState) => state.user);
    const role = currentUser?.role || 'user';
    const [demandes, setDemandes] = useState<Demande[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedDemande, setSelectedDemande] = useState<Demande | null>(null);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const urlMain = process.env.REACT_APP_URL_GATEWAY_MAIN;
    const isAdmin = role === 'admin';
    const isUser = role === 'user';

    const [formData, setFormData] = useState({
        titre: '',
        description: '',
        machineId: '',
        urgence: 'moyenne',
        dateSouhaitee: ''
    });

    const urgenceList = [
        { value: 'basse', label: 'Basse', color: 'success' },
        { value: 'moyenne', label: 'Moyenne', color: 'info' },
        { value: 'haute', label: 'Haute', color: 'warning' },
        { value: 'critique', label: 'Critique', color: 'error' }
    ];

    const statutConfig: any = {
        en_attente: { label: 'En attente', color: 'warning', icon: <PendingIcon /> },
        validee: { label: 'Validée', color: 'success', icon: <CheckCircleIcon /> },
        refusee: { label: 'Refusée', color: 'error', icon: <CancelIcon /> },
        transformee: { label: 'Transformée', color: 'primary', icon: <BuildIcon /> }
    };

    useEffect(() => {
        fetchDemandes();
        if (isUser || isAdmin) {
            fetchMachines();
        }
    }, []);

    const fetchMachines = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${urlMain}/machines`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMachines(res.data.data || res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDemandes = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${urlMain}/demandes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            let data = res.data.data || res.data || [];

            if (!isAdmin && currentUser?.id) {
                data = data.filter((demande: Demande) => demande.userId === currentUser.id.toString());
            }

            setDemandes(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // const handleCreateDemande = async () => {
    //     if (!formData.titre || !formData.description || !formData.machineId) {
    //         setError('Veuillez remplir tous les champs obligatoires');
    //         return;
    //     }

    //     setSubmitting(true);
    //     setError('');

    //     try {
    //         const token = localStorage.getItem('token');
    //         await axios.post(`${urlMain}/demandes`, formData, {
    //             headers: { Authorization: `Bearer ${token}` }
    //         });

    //         setSuccess('Demande envoyée avec succès');
    //         setOpenCreateDialog(false);
    //         setFormData({
    //             titre: '',
    //             description: '',
    //             machineId: '',
    //             urgence: 'moyenne',
    //             dateSouhaitee: ''
    //         });
    //         fetchDemandes();

    //         setTimeout(() => setSuccess(''), 3000);
    //     } catch (err: any) {
    //         setError(err.response?.data?.message || 'Erreur lors de l\'envoi');
    //     } finally {
    //         setSubmitting(false);
    //     }
    // };

    const handleViewDetail = (demande: Demande) => {
        setSelectedDemande(demande);
        setOpenDialog(true);
    };

    const getMachineNom = (machineId: string) => {
        return machines.find(m => m._id === machineId)?.nom || machineId;
    };

    const filteredDemandes = demandes.filter(d =>
        d.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <Box className="demandes-container">
                <LinearProgress />
                <Typography align="center" sx={{ mt: 2 }} color='text.primary'>Chargement...</Typography>
            </Box>
        );
    }
    
    return (
        <Box className="demandes-container">
            <Container maxWidth="lg">
                {/* En-tête */}
                <Box className="demandes-header">
                    <Box>
                        <Button
                            variant='contained'
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/Home')}
                            sx={{ mb: 2 }}
                        >
                            Retour
                        </Button>
                        <Typography variant="h4" className="page-title" color="text.primary">
                            Demandes d'intervention
                        </Typography>
                        <Typography variant="body2" className="page-subtitle" color="text.secondary">
                            {isAdmin ? 'Gérez les demandes des utilisateurs' : 'Suivez vos demandes d\'intervention'}
                        </Typography>
                    </Box>
                    {isUser && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/maintenance')}
                        >
                            Nouvelle demande
                        </Button>
                    )}
                </Box>

                {/* Barre de recherche */}
                <TextField
                    fullWidth
                    placeholder="Rechercher une demande..."
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

                {/* Tableau des demandes */}
                <TableContainer component={Paper} className="table-container">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Titre</TableCell>
                                <TableCell>Machine</TableCell>
                                <TableCell>Urgence</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Statut</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredDemandes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        Aucune demande trouvée
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDemandes.map((demande) => {
                                    const urgence = urgenceList.find(u => u.value === demande.urgence);
                                    const statut = statutConfig[demande.statut];
                                    return (
                                        <TableRow key={demande._id} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {demande.titre}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{getMachineNom(demande.machineId)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={urgence?.label || demande.urgence}
                                                    color={urgence?.color as any || 'default'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {new Date(demande.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={statut?.label || demande.statut}
                                                    color={statut?.color || 'default'}
                                                    size="small"
                                                    icon={statut?.icon}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={() => handleViewDetail(demande)}>
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>

            {/* Dialogue création demande
            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Nouvelle demande d'intervention
                    <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setOpenCreateDialog(false)}>
                        <CancelIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Titre *"
                                name="titre"
                                value={formData.titre}
                                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                select
                                fullWidth
                                label="Machine *"
                                name="machineId"
                                value={formData.machineId}
                                onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
                                required
                            >
                                {machines.map((m: any) => (
                                    <MenuItem key={m._id} value={m._id}>{m.nom}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                select
                                fullWidth
                                label="Urgence"
                                name="urgence"
                                value={formData.urgence}
                                onChange={(e) => setFormData({ ...formData, urgence: e.target.value })}
                            >
                                {urgenceList.map(u => (
                                    <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Date souhaitée"
                                name="dateSouhaitee"
                                type="date"
                                value={formData.dateSouhaitee}
                                onChange={(e) => setFormData({ ...formData, dateSouhaitee: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Description *"
                                name="description"
                                multiline
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreateDialog(false)}>Annuler</Button>
                    <Button variant="contained" onClick={handleCreateDemande} disabled={submitting}>
                        {submitting ? <CircularProgress size={24} /> : 'Envoyer'}
                    </Button>
                </DialogActions>
            </Dialog> */}

            {/* Dialogue détails demande */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Détail de la demande
                    <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setOpenDialog(false)}>
                        <CancelIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedDemande && (
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" color="text.secondary">Titre</Typography>
                                <Typography variant="body1">{selectedDemande.titre}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" color="text.secondary">Machine</Typography>
                                <Typography variant="body1">{getMachineNom(selectedDemande.machineId)}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" color="text.secondary">Urgence</Typography>
                                <Typography variant="body1">
                                    <Chip
                                        label={urgenceList.find(u => u.value === selectedDemande.urgence)?.label || selectedDemande.urgence}
                                        color={urgenceList.find(u => u.value === selectedDemande.urgence)?.color as any || 'default'}
                                        size="small"
                                    />
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" color="text.secondary">Statut</Typography>
                                <Typography variant="body1">
                                    <Chip
                                        label={statutConfig[selectedDemande.statut]?.label || selectedDemande.statut}
                                        color={statutConfig[selectedDemande.statut]?.color || 'default'}
                                        size="small"
                                        icon={statutConfig[selectedDemande.statut]?.icon}
                                    />
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" color="text.secondary">Date de création</Typography>
                                <Typography variant="body1">{new Date(selectedDemande.createdAt).toLocaleString()}</Typography>
                            </Grid>
                            {selectedDemande.dateSouhaitee && (
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="caption" color="text.secondary">Date souhaitée</Typography>
                                    <Typography variant="body1">{new Date(selectedDemande.dateSouhaitee).toLocaleDateString()}</Typography>
                                </Grid>
                            )}
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="caption" color="text.secondary">Description</Typography>
                                <Typography variant="body1">{selectedDemande.description}</Typography>
                            </Grid>
                            {selectedDemande.motifRefus && (
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="caption" color="error">Motif du refus</Typography>
                                    <Typography variant="body1" color="error">{selectedDemande.motifRefus}</Typography>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Fermer</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Demandes;
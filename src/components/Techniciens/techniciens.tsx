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
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Badge as BadgeIcon,
    Lock as LockIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { RootState } from '../../redux/store';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import './techniciens.css';

const Techniciens: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useSelector((state: RootState) => state.user);
    const role = currentUser?.role || 'user';
    const [techniciens, setTechniciens] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingTechnicien, setEditingTechnicien] = useState<any>(null);
    const [formData, setFormData] = useState({
        userFullname: '',
        username: '',
        email: '',
        password: '',
        role: 'technicien'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const urlAuth = process.env.REACT_APP_URL_GATEWAY_USERS;
    const isAdmin = role === 'admin';

    const fetchTechniciens = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${urlAuth}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const allUsers = res.data.data || res.data || [];
            const techniciensList = allUsers.filter((u: any) => u.role === 'technicien');
            setTechniciens(techniciensList);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTechniciens();
    }, []);

    const handleOpenDialog = (technicien?: any) => {
        if (technicien) {
            setEditingTechnicien(technicien);
            setFormData({
                userFullname: technicien.userFullname || '',
                username: technicien.username || '',
                email: technicien.email || '',
                password: '',
                role: 'technicien'
            });
        } else {
            setEditingTechnicien(null);
            setFormData({
                userFullname: '',
                username: '',
                email: '',
                password: '',
                role: 'technicien'
            });
        }
        setError('');
        setSuccess('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingTechnicien(null);
        setFormData({
            userFullname: '',
            username: '',
            email: '',
            password: '',
            role: 'technicien'
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');

            if (editingTechnicien) {
                // Modification
                const updateData: any = {
                    userFullname: formData.userFullname,
                    username: formData.username,
                    email: formData.email
                };
                if (formData.password) {
                    updateData.password = formData.password;
                }

                await axios.put(`${urlAuth}/${editingTechnicien.id}`, updateData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuccess('Technicien modifié avec succès');
            } else {
                // Création
                await axios.post(`${urlAuth}`, {
                    userFullname: formData.userFullname,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    role: 'technicien'
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuccess('Technicien ajouté avec succès');
            }

            setTimeout(() => {
                fetchTechniciens();
                handleCloseDialog();
            }, 1500);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de l\'opération');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Supprimer ce technicien ?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${urlAuth}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTechniciens();
            setSuccess('Technicien supprimé');
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            console.error(err);
            setError('Erreur lors de la suppression');
        }
    };

    const filteredTechniciens = techniciens.filter(t =>
        t.userFullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box className="techniciens-container">
            <Container maxWidth="lg">
                <Button
                    variant='contained'
                    startIcon={<ArrowBackIcon />}
                    onClick={() => { navigate('/Home') }}
                >
                    retour
                </Button>
                <Box className="techniciens-header">
                    <Box>
                        <Typography variant="h4" className="page-title" color="text.primary">
                            Gestion des techniciens
                        </Typography>
                        <Typography variant="body2" className="page-subtitle" color="text.secondary">
                            {isAdmin ? 'Ajoutez, modifiez ou supprimez les techniciens' : 'Consultez la liste de nos techniciens'}
                        </Typography>
                    </Box>
                    {isAdmin && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                        >
                            Ajouter un technicien
                        </Button>
                    )}
                </Box>

                <TextField
                    fullWidth
                    placeholder="Rechercher un technicien..."
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

                <TableContainer component={Paper} className="table-container">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nom complet</TableCell>
                                <TableCell>Nom d'utilisateur</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Rôle</TableCell>
                                {isAdmin && <TableCell align="right">Actions</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 5 : 4} align="center">
                                        <CircularProgress size={30} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredTechniciens.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 5 : 4} align="center">
                                        Aucun technicien trouvé
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTechniciens.map((technicien) => (
                                    <TableRow key={technicien.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PersonIcon fontSize="small" color="action" />
                                                <Typography variant="body2">{technicien.userFullname}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{technicien.username}</TableCell>
                                        <TableCell>{technicien.email}</TableCell>
                                        <TableCell>
                                            <Chip label="Technicien" color="primary" size="small" />
                                        </TableCell>
                                        {isAdmin && (
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={() => handleOpenDialog(technicien)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDelete(technicien.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>

            {/* Dialog Ajouter/Modifier */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingTechnicien ? 'Modifier le technicien' : 'Ajouter un technicien'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Nom complet"
                                name="userFullname"
                                value={formData.userFullname}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Nom d'utilisateur"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    startAdornment: (
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
                                value={formData.email}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label={editingTechnicien ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required={!editingTechnicien}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>Annuler</Button>
                    <Button onClick={handleSubmit} variant="contained" startIcon={<SaveIcon />} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : (editingTechnicien ? 'Modifier' : 'Ajouter')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Techniciens;
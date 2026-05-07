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
    Cancel as CancelIcon,
    ManageAccounts
} from '@mui/icons-material';
import { RootState } from '../../redux/store';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import './utilisateurs.css';

const Utilisateurs: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useSelector((state: RootState) => state.user);
    const role = currentUser?.role || 'user';
    const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDialogDelete, setOpenDialogDelete] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [editingUtilisateur, setEditingUtilisateur] = useState<any>(null);
    const [formData, setFormData] = useState({
        userFullname: '',
        username: '',
        email: '',
        password: '',
        role: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const urlAuth = process.env.REACT_APP_URL_GATEWAY_USERS;
    const isAdmin = role === 'admin';

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${urlAuth}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const allUsers = res.data.data || res.data || [];
            setUtilisateurs(allUsers);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenDialog = (utilisateur?: any) => {
        if (utilisateur) {
            setEditingUtilisateur(utilisateur);
            setFormData({
                userFullname: utilisateur.userFullname || '',
                username: utilisateur.username || '',
                email: utilisateur.email || '',
                password: '',
                role: utilisateur.role
            });
        } else {
            setEditingUtilisateur(null);
            setFormData({
                userFullname: '',
                username: '',
                email: '',
                password: '',
                role: ''
            });
        }
        setError('');
        setSuccess('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUtilisateur(null);
        setFormData({
            userFullname: '',
            username: '',
            email: '',
            password: '',
            role: ''
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

            if (editingUtilisateur) {
                // Modification
                const updateData: any = {
                    userFullname: formData.userFullname,
                    username: formData.username,
                    email: formData.email
                };
                if (formData.password) {
                    updateData.password = formData.password;
                }

                await axios.put(`${urlAuth}/${editingUtilisateur.id}`, updateData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuccess('Utilisateur modifié avec succès');
            } else {
                // Création
                await axios.post(`${urlAuth}`, {
                    userFullname: formData.userFullname,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuccess('Utilisateur ajouté avec succès');
            }

            setTimeout(() => {
                fetchUsers();
                handleCloseDialog();
            }, 1500);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de l\'opération');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        setDeleteTarget(id);
        setOpenDialogDelete(true);
    };


    const handleConfirmDelete = async () => {
        setOpenDialogDelete(false);
        if (!deleteTarget) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${urlAuth}/${deleteTarget}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
            setSuccess('Utilisateur supprimé');
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            console.error(err);
            setError('Erreur lors de la suppression');
        }
    };

    const filteredUtilisateur = utilisateurs.filter(u =>
        u.userFullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatutChip = (statut: string) => {
        const config: any = {
            admin: { label: 'Admin', color: 'error' },
            user: { label: 'Utilisateur', color: 'default' },
            technicien: { label: 'Technicien', color: 'primary' },
        };
        const { label, color } = config[statut] || { label: statut, color: 'default' };
        return <Chip label={label} color={color} size="small" />;
    };


    return (
        <Box className="utilisateurs-container">
            <Container maxWidth="lg">
                <Button
                    variant='contained'
                    startIcon={<ArrowBackIcon />}
                    onClick={() => { navigate('/Home') }}
                >
                    retour
                </Button>
                <Box className="utilisateurs-header">
                    <Box>
                        <Typography variant="h4" className="page-title" color="text.primary">
                            Gestion des utilisateurs
                        </Typography>
                        <Typography variant="body2" className="page-subtitle" color="text.secondary">
                            {isAdmin ? 'Ajoutez, modifiez ou supprimez les Utilisateur' : 'Consultez la liste de nos utilisateurs'}
                        </Typography>
                    </Box>
                    {isAdmin && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                        >
                            Ajouter un utilisateur
                        </Button>
                    )}
                </Box>

                <TextField
                    fullWidth
                    placeholder="Rechercher un utilisateur..."
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
                            ) : filteredUtilisateur.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 5 : 4} align="center">
                                        Aucun utilisateur trouvé
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUtilisateur.map((utilisateur) => (
                                    <TableRow key={utilisateur.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PersonIcon fontSize="small" color="action" />
                                                <Typography variant="body2">{utilisateur.userFullname}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{utilisateur.username}</TableCell>
                                        <TableCell>{utilisateur.email}</TableCell>
                                        <TableCell>
                                            {getStatutChip(utilisateur.role)}
                                        </TableCell>
                                        {isAdmin && (
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={() => handleOpenDialog(utilisateur)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDelete(utilisateur.id)}>
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
                    {editingUtilisateur ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
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
                        {!editingUtilisateur && <Grid size={{ xs: 12 }}>
                            <TextField
                                select
                                fullWidth
                                label="Role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <ManageAccounts />
                                        </InputAdornment>
                                    )
                                }}
                            >
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="technicien">Technicien</MenuItem>
                                <MenuItem value="user">Utilisateur</MenuItem>
                            </TextField>
                        </Grid>}
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label={editingUtilisateur ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required={!editingUtilisateur}
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
                        {loading ? <CircularProgress size={24} /> : (editingUtilisateur ? 'Modifier' : 'Ajouter')}
                    </Button>
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

export default Utilisateurs;
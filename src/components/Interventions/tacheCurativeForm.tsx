// pages/TacheCurativeForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    MenuItem,
    Alert,
    CircularProgress
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const TacheCurativeForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state: RootState) => state.user);
    const role = currentUser?.role || 'user';
    const isEditMode = !!id;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const urlMainService = process.env.REACT_APP_URL_GATEWAY_MAIN;
    const [machines, setMachines] = useState([]);
    const [techniciens, setTechniciens] = useState([]);
    const [pieces, setPieces] = useState([]);

    const [formData, setFormData] = useState({
        titre: '',
        description: '',
        machineId: '',
        technicienId: '',
        urgence: 'moyenne',
        panne: '',
        tempsPasse: '',
        rapport: '',
        statut: 'ouverte',
        piecesUtilisees: [] as { pieceId: string; quantite: number }[]
    });

    const urgenceList = [
        { value: 'basse', label: 'Basse' },
        { value: 'moyenne', label: 'Moyenne' },
        { value: 'haute', label: 'Haute' },
        { value: 'critique', label: 'Critique' }
    ];

    useEffect(() => {
        fetchMachines();
        fetchTechniciens();
        fetchPieces();
        if (isEditMode) fetchTache();
    }, [id]);

    const fetchMachines = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${urlMainService}/machines`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMachines(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchTechniciens = async () => {
        try {
            const token = localStorage.getItem('token');
            const urlAuth = process.env.REACT_APP_URL_GATEWAY_USERS;
            const res = await axios.get(`${urlAuth}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const techniciensList = res.data.data.filter((u: any) => u.role === 'technicien');
            setTechniciens(techniciensList);
        } catch (err) { console.error(err); }
    };

    const fetchPieces = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${urlMainService}/pieces`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPieces(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchTache = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${urlMainService}/taches/curative/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data.data;
            setFormData({
                titre: data.titre || '',
                description: data.description || '',
                machineId: data.machineId || '',
                technicienId: data.technicienId || '',
                urgence: data.urgence || 'moyenne',
                panne: data.panne || '',
                tempsPasse: data.tempsPasse || '',
                rapport: data.rapport || '',
                statut: data.statut || 'ouverte',
                piecesUtilisees: data.piecesUtilisees || []
            });
        } catch (err) {
            setError('Erreur chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const url = isEditMode ? `${urlMainService}/taches/curative/${id}` : `${urlMainService}/taches/curative`;
            const method = isEditMode ? axios.put : axios.post;

            await method(url, {
                titre: formData.titre,
                description: formData.description,
                machineId: formData.machineId,
                technicienId: formData.technicienId,
                urgence: formData.urgence,
                panne: formData.panne,
                tempsPasse: formData.tempsPasse ? parseInt(formData.tempsPasse) : 0,
                rapport: formData.rapport,
                statut: formData.statut,
                piecesUtilisees: formData.piecesUtilisees
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate('/Interventions');
        } catch (err) {
            setError('Erreur sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPiece = () => {
        setFormData({
            ...formData,
            piecesUtilisees: [...formData.piecesUtilisees, { pieceId: '', quantite: 1 }]
        });
    };

    const handleRemovePiece = (index: number) => {
        const newPieces = formData.piecesUtilisees.filter((_, i) => i !== index);
        setFormData({ ...formData, piecesUtilisees: newPieces });
    };

    const handlePieceChange = (index: number, field: 'pieceId' | 'quantite', value: string | number) => {
        const newPieces = [...formData.piecesUtilisees];
        if (field === 'pieceId') {
            newPieces[index].pieceId = value as string;
        } else {
            newPieces[index].quantite = value as number;
        }
        setFormData({ ...formData, piecesUtilisees: newPieces });
    };

    if (role !== 'admin' && role !== 'technicien') {
        return <Container><Alert severity="error">Accès interdit</Alert></Container>;
    }

    return (
        <Box sx={{ p: 3, mt: 8 }}>
            <Container maxWidth="md">
                <Paper sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/Interventions')}>Retour</Button>
                        <Typography variant="h5" sx={{ ml: 2 }}>{isEditMode ? 'Modifier' : 'Ajouter'} une tâche curative</Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="Titre" name="titre" value={formData.titre} onChange={handleChange} required />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField select fullWidth label="Machine" name="machineId" value={formData.machineId} onChange={handleChange} required>
                                    {machines.map((m: any) => (<MenuItem key={m._id} value={m._id}>{m.nom}</MenuItem>))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField select fullWidth label="Technicien" name="technicienId" value={formData.technicienId} onChange={handleChange} required>
                                    {techniciens.map((t: any) => (<MenuItem key={t.id} value={t.id}>{t.userFullname}</MenuItem>))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField select fullWidth label="Urgence" name="urgence" value={formData.urgence} onChange={handleChange}>
                                    {urgenceList.map(u => (<MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField select fullWidth label="Statut" name="statut" value={formData.statut} onChange={handleChange}>
                                    <MenuItem value="ouverte">Ouverte</MenuItem>
                                    <MenuItem value="en_cours">En cours</MenuItem>
                                    <MenuItem value="terminee">Terminée</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField fullWidth label="Description" name="description" value={formData.description} onChange={handleChange} multiline rows={2} />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField fullWidth label="Panne constatée" name="panne" value={formData.panne} onChange={handleChange} multiline rows={2} required />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="Temps passé (minutes)" name="tempsPasse" type="number" value={formData.tempsPasse} onChange={handleChange} />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField fullWidth label="Rapport d'intervention" name="rapport" value={formData.rapport} onChange={handleChange} multiline rows={3} />
                            </Grid>

                            {/* Pièces utilisées */}
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" gutterBottom>Pièces utilisées</Typography>
                                <Button variant="outlined" size="small" onClick={handleAddPiece} sx={{ mb: 2 }}>
                                    + Ajouter une pièce
                                </Button>

                                {formData.piecesUtilisees.map((piece, index) => (
                                    <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                select
                                                fullWidth
                                                label="Pièce"
                                                value={piece.pieceId}
                                                onChange={(e) => handlePieceChange(index, 'pieceId', e.target.value)}
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
                                                onChange={(e) => handlePieceChange(index, 'quantite', parseInt(e.target.value) || 1)}
                                                required
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 2 }}>
                                            <Button color="error" onClick={() => handleRemovePiece(index)}>
                                                Supprimer
                                            </Button>
                                        </Grid>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                            <Button variant="outlined" onClick={() => navigate('/Interventions')}>Annuler</Button>
                            <Button type="submit" variant="contained" disabled={loading} startIcon={<SaveIcon />}>
                                {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Modifier' : 'Ajouter')}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default TacheCurativeForm;
// pages/TachePreventiveForm.tsx
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

const TachePreventiveForm: React.FC = () => {
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

    const [formData, setFormData] = useState({
        titre: '',
        description: '',
        machineId: '',
        technicienId: '',
        frequence: 'mensuel',
        compteurRequis: '',
        dateProchaine: ''
    });

    const frequences = [
        { value: 'hebdomadaire', label: 'Hebdomadaire' },
        { value: 'mensuel', label: 'Mensuel' },
        { value: 'trimestriel', label: 'Trimestriel' },
        { value: 'annuel', label: 'Annuel' }
    ];

    useEffect(() => {
        fetchMachines();
        fetchTechniciens();
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

    const fetchTache = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${urlMainService}/taches/preventive/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data;
            setFormData({
                titre: data.titre || '',
                description: data.description || '',
                machineId: data.machineId || '',
                technicienId: data.technicienId || '',
                frequence: data.frequence || 'mensuel',
                compteurRequis: data.compteurRequis || '',
                dateProchaine: data.dateProchaine ? data.dateProchaine.split('T')[0] : ''
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
            const url = isEditMode ? `${urlMainService}/taches/preventive/${id}` : `${urlMainService}/taches/preventive`;
            const method = isEditMode ? axios.put : axios.post;

            await method(url, {
                titre: formData.titre,
                description: formData.description,
                machineId: formData.machineId,
                technicienId: formData.technicienId,
                frequence: formData.frequence,
                compteurRequis: formData.compteurRequis ? parseInt(formData.compteurRequis) : undefined,
                dateProchaine: formData.dateProchaine
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

    if (role !== 'admin' && role !== 'technicien') {
        return <Container><Alert severity="error">Accès interdit</Alert></Container>;
    }

    return (
        <Box sx={{ p: 3, mt: 8 }}>
            <Container maxWidth="md">
                <Paper sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/Interventions')}>Retour</Button>
                        <Typography variant="h5" sx={{ ml: 2 }}>{isEditMode ? 'Modifier' : 'Ajouter'} une tâche préventive</Typography>
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
                            <Grid size={{ xs: 12 }}>
                                <TextField fullWidth label="Description" name="description" value={formData.description} onChange={handleChange} multiline rows={3} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField select fullWidth label="Fréquence" name="frequence" value={formData.frequence} onChange={handleChange}>
                                    {frequences.map(f => (<MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="Compteur requis" name="compteurRequis" type="number" value={formData.compteurRequis} onChange={handleChange} />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField fullWidth label="Date prochaine" name="dateProchaine" type="date" value={formData.dateProchaine} onChange={handleChange} InputLabelProps={{ shrink: true }} required />
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

export default TachePreventiveForm;
// pages/Equipements.tsx
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
    Stack
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Inventory as InventoryIcon,
    Build as BuildIcon
} from '@mui/icons-material';
import { RootState } from '../../redux/store';
import './equipements.css';
import axios from 'axios'

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

interface Machines {
    id: string
    nom: string;
    type: string;
    marque: string;
    modele: string;
    numeroSerie: string;
    localisation: string;
    statut: 'actif' | 'en_panne' | 'en_maintenance' | 'hors_service';
    dateAchat: Date;
    fournisseur: string;
    contactFournisseur?: string;
}

interface Pieces {
    id: string
    reference: string;
    nom: string;
    description?: string;
    prixUnitaire: number;
    quantiteStock: number;
    seuilAlerte: number;
    fournisseur: string;
    emplacement?: string;
}

const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;
    return (
        <div hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
};

const Equipements: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useSelector((state: RootState) => state.user);
    const role = currentUser?.role || 'user';
    const [tabValue, setTabValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const urlMainService = process.env.REACT_APP_URL_GATEWAY_MAIN;
    const [machines, setMachines] = useState<Machines[]>([]);
    const [pieces, setPieces] = useState<Pieces[]>([]);

    //   const machines = [
    //     { id: 1, nom: 'Tour CNC', type: 'Machine-outil', statut: 'actif', localisation: 'Atelier A' },
    //     { id: 2, nom: 'Pompe hydraulique', type: 'Hydraulique', statut: 'en_panne', localisation: 'Atelier B' },
    //     { id: 3, nom: 'Compresseur', type: 'Air comprimé', statut: 'maintenance', localisation: 'Local technique' }
    //   ];

    //   const pieces = [
    //     { id: 1, reference: 'ROU-001', nom: 'Roulement à billes', stock: 15, seuil: 5, fournisseur: 'SKF' },
    //     { id: 2, reference: 'COUR-002', nom: 'Courroie de distribution', stock: 3, seuil: 5, fournisseur: 'Bosch' },
    //     { id: 3, reference: 'FIL-003', nom: 'Filtre à huile', stock: 12, seuil: 10, fournisseur: 'Mann' }
    //   ];

    console.log('url main : ', urlMainService);



    const fetchMachines = async () => {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${urlMainService}/machine`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setMachines(res.data);
    }

    const fetchPieces = async () => {
        const res = await axios.get(`${urlMainService}/piece`);
        setPieces(res.data);
    }

    useEffect(() => {
        fetchMachines();
        fetchPieces();
    }, [])

    const filteredMachines = machines.filter(m =>
        m.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPieces = pieces.filter(p =>
        p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.reference.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatutChip = (statut: string) => {
        const config = {
            actif: { label: 'Actif', color: 'success' as const },
            en_panne: { label: 'En panne', color: 'error' as const },
            en_maintenance: { label: 'En maintenance', color: 'warning' as const },
            hors_service: { label: 'Hors service', color: 'default' as const }
        };
        const { label, color } = config[statut as keyof typeof config] || { label: statut, color: 'default' as const };
        return <Chip label={label} color={color} size="small" />;
    };

    const getStockStatus = (stock: number, seuil: number) => {
        if (stock <= 0) return <Chip label="Rupture" color="error" size="small" />;
        if (stock <= seuil) return <Chip label="Stock bas" color="warning" size="small" />;
        return <Chip label="Disponible" color="success" size="small" />;
    };

    const canEdit = role === 'admin';

    return (
        <Box className="equipements-container">
            <Container maxWidth="lg">
                <Box className="equipements-header">
                    <Box>
                        <Typography variant="h4" className="page-title">
                            Gestion des équipements
                        </Typography>
                        <Typography variant="body2" className="page-subtitle">
                            Gérez vos machines et vos pièces détachées
                        </Typography>
                    </Box>
                    {canEdit && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate(tabValue === 0 ? '/machines/ajouter' : '/pieces/ajouter')}
                        >
                            {tabValue === 0 ? 'Ajouter une machine' : 'Ajouter une pièce'}
                        </Button>
                    )}
                </Box>

                <Paper className="tabs-container">
                    <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                        <Tab icon={<InventoryIcon />} label="Machines" />
                        <Tab icon={<BuildIcon />} label="Pièces détachées" />
                    </Tabs>
                </Paper>

                <TextField
                    fullWidth
                    placeholder="Rechercher..."
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

                <TabPanel value={tabValue} index={0}>
                    <TableContainer component={Paper} className="table-container">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nom</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Statut</TableCell>
                                    <TableCell>Localisation</TableCell>
                                    {canEdit && <TableCell align="right">Actions</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredMachines.map((machine) => (
                                    <TableRow key={machine.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={500}>
                                                {machine.nom}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{machine.type}</TableCell>
                                        <TableCell>{getStatutChip(machine.statut)}</TableCell>
                                        <TableCell>{machine.localisation}</TableCell>
                                        {canEdit && (
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={() => navigate(`/machines/${machine.id}`)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error">
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                                {filteredMachines.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={canEdit ? 5 : 4} align="center">
                                            Aucune machine trouvée
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <TableContainer component={Paper} className="table-container">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Référence</TableCell>
                                    <TableCell>Nom</TableCell>
                                    <TableCell>Stock</TableCell>
                                    <TableCell>Statut</TableCell>
                                    <TableCell>Fournisseur</TableCell>
                                    {canEdit && <TableCell align="right">Actions</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredPieces.map((piece) => (
                                    <TableRow key={piece.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontFamily="monospace">
                                                {piece.reference}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{piece.nom}</TableCell>
                                        <TableCell>{piece.quantiteStock}</TableCell>
                                        <TableCell>{getStockStatus(piece.quantiteStock, piece.seuilAlerte)}</TableCell>
                                        <TableCell>{piece.fournisseur}</TableCell>
                                        {canEdit && (
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={() => navigate(`/pieces/${piece.id}`)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error">
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                                {filteredPieces.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={canEdit ? 6 : 5} align="center">
                                            Aucune pièce trouvée
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>
            </Container>
        </Box>
    );
};

export default Equipements;
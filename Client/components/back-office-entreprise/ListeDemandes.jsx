import React, { useEffect, useState } from "react";
import "./DashboardEntreprise.css";
import Sidebar from "./Sidebar";
import { 
    fetchDemandes, 
    createEntreprise, 
    createUser, 
    sendEmail, 
    updateDemandeStatus 
} from "../../src/services/userService";
import { 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Button, 
    CircularProgress, 
    Alert, 
    Snackbar,
    Typography,
    Chip
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import styled from "@emotion/styled";

const StyledContainer = styled.div`
    display: flex;
    min-height: 100vh;
    background-color: #f5f7fa;
`;

const MainContent = styled.div`
    flex: 1;
    padding: 32px;
    margin-left: 280px;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
`;

const StyledTable = styled(Table)`
    min-width: 650px;
    & .MuiTableCell-head {
        font-weight: 600;
        background-color: #f8fafc;
    }
`;

const SuccessButton = styled(Button)`
    background-color: #4caf50;
    color: white;
    text-transform: none;
    &:hover {
        background-color: #3d8b40;
    }
`;

const PremiumChip = styled(Chip)`
    background-color: #ffeb3b;
    font-weight: 500;
`;

const BasicChip = styled(Chip)`
    background-color: #e0e0e0;
    font-weight: 500;
`;

const ListeDemandes = () => {
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const getDemandes = async () => {
            try {
                const data = await fetchDemandes();
                setDemandes(data);
            } catch (err) {
                setError(err.message);
                setDemandes([]);
            } finally {
                setLoading(false);
            }
        };
    
        getDemandes();
    }, []);

    const handleAction = async (demande) => {
        try {
            // 1️⃣ Créer l'entreprise
            const entrepriseData = {
                nomEntreprise: demande.entreprise,
                adresse: demande.adresse,
                informations_abonnement: demande.forfait,
                date_creation: new Date().toISOString(),
            };
    
            // Attendre explicitement la création de l'entreprise
            const entrepriseResponse = await createEntreprise(entrepriseData);
            
            // DEBUG: Afficher la réponse complète pour vérification
            console.log("Réponse création entreprise:", entrepriseResponse);
            
            // Vérification approfondie de l'ID
            const entrepriseId = entrepriseResponse.id || entrepriseResponse.data?.id;
            
            if (!entrepriseId) {
                throw new Error("ID de l'entreprise non reçu dans la réponse: " + JSON.stringify(entrepriseResponse));
            }
    
            // 2️⃣ Créer l'utilisateur admin avec l'ID entreprise
            const userData = {
                name: `${demande.nom} ${demande.prenom}`,
                email: demande.email,
                password: "defaultPassword",
                role: "admin",
                entreprises_id: entrepriseId, // Assignation de l'ID
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
    
            // Attendre explicitement la création de l'utilisateur
            const userResponse = await createUser(userData);
            console.log("Réponse création utilisateur:", userResponse);
    
            // 3️⃣ Envoyer un email
            await sendEmail({
                toEmail: demande.email,
                userEmail: demande.email,
                userPassword: "defaultPassword",
            });
    
            // 4️⃣ Mettre à jour le statut de la demande
            await updateDemandeStatus(demande.id);
    
            // Mise à jour de l'UI
            setDemandes(prevDemandes => prevDemandes.filter(d => d.id !== demande.id));
            
            setSuccessMessage(`Entreprise ${demande.entreprise} et utilisateur créés avec succès !`);
            setSnackbarOpen(true);
        } catch (err) {
            console.error("Erreur détaillée:", err);
            setError(err.message || "Une erreur est survenue lors du traitement");
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    if (loading) {
        return (
            <StyledContainer>
                <Sidebar />
                <MainContent>
                    <CircularProgress />
                </MainContent>
            </StyledContainer>
        );
    }

    return (
        <StyledContainer>
            <Sidebar />
            <MainContent>
                <PageHeader>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Demandes d'Abonnement
                    </Typography>
                </PageHeader>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <TableContainer component={Paper} elevation={3}>
                    <StyledTable>
                        <TableHead>
                            <TableRow>
                                <TableCell>Entreprise</TableCell>
                                <TableCell>Contact</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Statut</TableCell>
                                <TableCell>Forfait</TableCell>
                                <TableCell align="center">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {demandes.length > 0 ? (
                                demandes.map((demande) => (
                                    <TableRow key={demande.id} hover>
                                        <TableCell>{demande.entreprise}</TableCell>
                                        <TableCell>{demande.nom} {demande.prenom}</TableCell>
                                        <TableCell>{demande.email}</TableCell>
                                        <TableCell>{demande.status}</TableCell>
                                        <TableCell>
                                            {demande.forfait.toLowerCase() === 'premium' ? (
                                                <PremiumChip label="Premium" size="small" />
                                            ) : (
                                                <BasicChip label="Basic" size="small" />
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <SuccessButton
                                                variant="contained"
                                                startIcon={<CheckCircleIcon />}
                                                onClick={() => handleAction(demande)}
                                            >
                                                Accepter
                                            </SuccessButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography variant="body1" color="textSecondary">
                                            Aucune demande disponible
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </StyledTable>
                </TableContainer>

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                >
                    <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                        {successMessage}
                    </Alert>
                </Snackbar>
            </MainContent>
        </StyledContainer>
    );
};

export default ListeDemandes;
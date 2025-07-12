import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './Routes/authRoutes.js';
import usersRoutes from './Routes/usersRoutes.js';

import demandeAbonnRoute from './Routes/demandeAbonnRoute.js'
import { verifyUser } from './Controller/authController.js';
import { verifyToken } from './Middlewares/authMiddleware.js';
import { verifyRole } from './Middlewares/authMiddleware.js';
import entrepriceRoute from './Routes/entrepriseRoutes.js'
import emailRoutes from "./Routes/SendEmailRoute.js";
import contactRoutes from "./Routes/contactMessageRoute.js";
import ManagementRoute from "./Routes/CategoriesManagementRoute.js";
import magasinRoutes from './Routes/magasinRoutes.js';
import zoneRoutes from './Routes/zoneRoutes.js';
import sequelize from './Config/database1.js';
import categorieRoutes from './Routes/categorieRoutes.js';
import contactMessage1 from './Model/contactMessage1.js';
import Users from './Model/Users.js';
import Produits from './Model/Produit.js';
import Promotion from './Model/Promotion.js';
import Stock from './Model/Stock.js';
/*import StockMovement from './Model/StockMovement.js';
import Vente from './Model/Ventes.js';*/
import ConversionZone from './Model/ConversionZone.js';
//import Fournisseur from './Model/Fournisseur.js';
import HeatmapData from './Model/HeatmapData.js';
import LegalConstraint from './Model/LegalConstraint.js';
import LocalEvent from './Model/LocalEvent.js';
import SupplierAgreement from './Model/SupplierAgreement.js';
import Planogramme from './Model/Planogramme.js';
import PlanogrammeDetail from './Model/PlanogrammeDetail.js';
import ChatMessage from './Model/ChatMessage.js';

import contactMessageRoutes from './Routes/messageContactRoutes.js';
import demandeAbonnementRoutes from './Routes/demandeAbonnementRoutes.js';
import entreprisesRoutes from './Routes/entreprisesRoutes.js';
import ConversionZoneRoute from './Routes/conversionZoneRoutes.js';
import FournisseurRoutes from './Routes/fournisseurRoutes.js';
import HeatmapsRoutes from './Routes/heatmapRoutes.js';
import LegalConstraintRoutes from './Routes/legalConstraintRoutes.js';
import LocalEventsRoutes from './Routes/localEventRoutes.js';
import ProduitsRoutes from './Routes/produitRoutes.js';
import PromotionRoutes from './Routes/promotionRoutes.js';
import StockRoutes from './Routes/stockRoutes.js';
import StockMovementRoutes from './Routes/stockMovementRoutes.js';
import SupplierAgreementRoutes from './Routes/supplierAgreementRoutes.js';
import VentesRoutes from './Routes/venteRoutes.js';
import PlanogrammeRoutes from './Routes/planogrammeRoutes.js';
import PlanogrammeDetailsRoutes from './Routes/planogrammeDetailRoutes.js';
import TacheRoutes from './Routes/tachesRoutes.js';
import ConfirmationRoutes from './Routes/confirmationsImplantationRoutes.js';
import NotificationRoutes from './Routes/notificationsRoutes.js';
import conversationRoutes  from './Routes/conversationsRoutes.js';
import formationRoutes from './Routes/formationRoutes.js'
import faqRoutes from './Routes/faqRoutes.js'
import historiqueActions from './Routes/historiqueActionRoutes.js'
import PlanogramRoutes from './Routes/planogramRoutes.js'
import FurnitureTypeRoutes from './Routes/furnitureTypeRoutes.js';
import FurnitureRoutes from './Routes/furnitureRoutes.js'
import ProductPositionRoutes from './Routes/productPositionRoutes.js'
import commentaireRoutes from './Routes/commentaireRoutes.js'
import chatMessageRoutes from './Routes/chatMessageRoutes.js'
import ConversationParticipantRoutes from './Routes/conversationParticipantRoutes.js';
import sessionRoutes from './Routes/sessionRoutes.js'
import CommandeAchatRoute from './Routes/commandeAchatRoutes.js'
import LigneCommandeAchatRoutes from './Routes/ligneCommandeAchatRoutes.js';
import {Planogram, Tache, Furniture,Zone1, FurnitureType, User, Fournisseur, Vente, StockMovement, magasin1, Categorie1, Produit, Entreprises, Formation, CommandeAchat, LigneCommandeAchat} from './Model/associations.js';
const app = express();
const PORT = process.env.PORT || 8081;
const router = express.Router(); 
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    methods:["POST","GET","PUT","DELETE","PATCH"],
    credentials: true
}));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/auth1', usersRoutes);
app.use('/api/demande', demandeAbonnementRoutes);
app.use('/api/demande', entreprisesRoutes);
app.use("/api/emails", emailRoutes);
//app.use("/api/message", contactRoutes);
app.use("/api/management", ManagementRoute);
app.use("/api/message", contactMessageRoutes);


// Routes pour les règles 
app.use("/api/conversion", ConversionZoneRoute);
app.use("/api/fournisseur", FournisseurRoutes);
app.use("/api/heatmaps", HeatmapsRoutes);
app.use("/api/legalConstraints", LegalConstraintRoutes);
app.use("/api/localEvents", LocalEventsRoutes);
app.use("/api/produits", ProduitsRoutes);
app.use("/api/promotions", PromotionRoutes);
app.use("/api/stock", StockRoutes);
app.use("/api/stockMouvement", StockMovementRoutes);
app.use("/api/supplierArgument", SupplierAgreementRoutes);
app.use("/api/vente", VentesRoutes);
app.use("/api/planogramme", PlanogrammeRoutes);
app.use("/api/planogramme-detail", PlanogrammeDetailsRoutes);
app.use("/api/taches", TacheRoutes);
app.use("/api/confirmation", ConfirmationRoutes);
app.use("/api/notification", NotificationRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/formations", formationRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/historiqueActions", historiqueActions);
app.use("/api/planogram", PlanogramRoutes);
app.use("/api/furnitureType", FurnitureTypeRoutes);
app.use("/api/furniture", FurnitureRoutes);
app.use("/api/productPosition", ProductPositionRoutes);
app.use("/api/commentaireRoutes", commentaireRoutes);
app.use("/api/chatMessageRoutes", chatMessageRoutes);
app.use("/api/participants", ConversationParticipantRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/commande-achat", CommandeAchatRoute);
app.use("/api/ligne-commande", LigneCommandeAchatRoutes);






app.use('/api/categories', categorieRoutes);
app.use('/api/magasins', magasinRoutes);
app.use('/api/zones', zoneRoutes);
// Synchroniser Sequelize avec la base
sequelize.sync({  force : false }) // force: true -> recrée les tables à chaque démarrage alter: true force : false
    .then(() => {
        console.log('Base synchronisée');
    })
    .catch(err => {
        console.error('Erreur de synchronisation', err);
    });

//const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});


app.get('/',verifyUser,(req,res)=>{
    return res.json({ Status: "Success", name: req.name });
});
router.get('/admin/dashboard', verifyToken, verifyRole('admin'), (req, res) => {
    res.json({ Status: "Success", message: "Bienvenue sur le tableau de bord Admin" });
});
app.get('/api/auth/logout',(req,res)=>{
    res.clearCookie('token');
    return res.json({Status:"Success"})
});
/*app.listen(8081, () => {
    console.log("Serveur démarré sur le port 8081");
});*/


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
import contactMessageRoutes from './Routes/messageContactRoutes.js';
import demandeAbonnementRoutes from './Routes/demandeAbonnementRoutes.js';
import entreprisesRoutes from './Routes/entreprisesRoutes.js';


const app = express();
const PORT = process.env.PORT || 5000;
const router = express.Router(); 
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    methods:["POST","GET","PUT","DELETE"],
    credentials: true
}));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
//app.use('/api/auth', usersRoutes);
app.use('/api/demande', demandeAbonnementRoutes);
app.use('/api/demande', entreprisesRoutes);
app.use("/api/emails", emailRoutes);
//app.use("/api/message", contactRoutes);
app.use("/api/management", ManagementRoute);
app.use("/api/message", contactMessageRoutes);


app.use('/api/categories', categorieRoutes);
app.use('/api/magasins', magasinRoutes);
app.use('/api/zones', zoneRoutes);
// Synchroniser Sequelize avec la base
sequelize.sync({ alter: true }) // force: true -> recrée les tables à chaque démarrage
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
app.listen(8081, () => {
    console.log("Serveur démarré sur le port 8081");
});


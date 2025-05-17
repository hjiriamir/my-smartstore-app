import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './Routes/authRoutes.js';
import demandeAbonnRoute from './Routes/demandeAbonnRoute.js'
import { verifyUser } from './Controller/authController.js';
import { verifyToken } from './Middlewares/authMiddleware.js';
import { verifyRole } from './Middlewares/authMiddleware.js';
import entrepriceRoute from './Routes/entrepriseRoutes.js'
import emailRoutes from "./Routes/SendEmailRoute.js";
import contactRoutes from "./Routes/contactMessageRoute.js";


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
app.use('/api/demande', demandeAbonnRoute);
app.use('/api/demande', entrepriceRoute);
app.use("/api/emails", emailRoutes);
app.use("/api/message", contactRoutes);
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


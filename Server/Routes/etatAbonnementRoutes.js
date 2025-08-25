// routes/etatAbonnementRoutes.js
import express from "express";
import {
  createEtatAbonnement,
  getAllEtats,
  getActifs,
  updateStatut
} from "../Controller/etatAbonnementController.js";

const router = express.Router();

router.post("/createEtatAbonnement", createEtatAbonnement);

router.get("/getAllEtats", getAllEtats);

router.get("/actifs", getActifs);

// Modifier le statut (actif, suspendu, inactif)
router.patch("/updateStatut/:id", updateStatut);

export default router;

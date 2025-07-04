import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  createFurniture,
  getAllFurnitures,
  getFurnitureById,
  updateFurniture,
  deleteFurniture,
  getFurnituresByUser,
  uploadFile
} from '../Controller/furnitureController.js';

const router = express.Router();

router.post('/createFurniture', createFurniture);
router.get('/getAllFurnitures', getAllFurnitures);
router.get('/getFurnitureById/:id', getFurnitureById);
router.get('/getFurnituresByUser/:idUser', getFurnituresByUser);
router.put('/updateFurniture/:id', updateFurniture);
router.delete('/deleteFurniture/:id', deleteFurniture);

// Configuration de Multer (dossier + nom de fichier unique)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Dossier où enregistrer
  },
  filename: (req, file, cb) => {
    // Utilisez directement le nom original du fichier
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });
router.post('/upload', upload.single('file'), uploadFile);

export default router;

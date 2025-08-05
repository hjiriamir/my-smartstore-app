import Furniture from '../Model/Furniture.js';
import Tache from '../Model/Tache.js';
import FurnitureType from '../Model/FurnitureType.js';
import Planogram from '../Model/Planogram.js';
import ProductPosition from '../Model/ProductPosition.js';
import Produit  from '../Model/Produit.js';
import path from 'path';
import fs from 'fs';

export const createFurniture = async (req, res) => {
  try {
    const newFurniture = await Furniture.create(req.body);
    res.status(201).json(newFurniture);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllFurnitures = async (req, res) => {
  try {
    const list = await Furniture.findAll();
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFurnitureById = async (req, res) => {
  try {
    const furniture = await Furniture.findByPk(req.params.id);
    if (!furniture) return res.status(404).json({ message: 'Introuvable' });
    res.status(200).json(furniture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateFurniture = async (req, res) => {
  try {
    const result = await Furniture.update(req.body, {
      where: { furniture_id: req.params.id },
    });
    res.status(200).json({ message: 'Mise à jour réussie', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteFurniture = async (req, res) => {
  try {
    await Furniture.destroy({ where: { furniture_id: req.params.id } });
    res.status(200).json({ message: 'Supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFurnituresByUser = async (req, res) => {
  const { idUser } = req.params;

  try {
    const taches = await Tache.findAll({
      where: { idUser },
      include: {
        model: Planogram,
        as: 'planogram',
        include: {
          model: Furniture,
          as: 'furnitures',
          include: [
            {model: FurnitureType,
              as: 'furnitureType'},
            
            {
              model: ProductPosition,
              as: 'positions', // doit correspondre à l'alias défini dans l'association
              include: {
                model: Produit ,
                as: 'product' // pareil : dépend de ton association
              }
            }
          ]
        }
      }
    });

    // Extraire les meubles enrichis
    const furnitures = taches.flatMap(t => t.planogram?.furnitures || []);

    res.status(200).json(furnitures);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Erreur lors de la récupération des meubles et produits de l\'utilisateur',
      error: error.message
    });
  }
};

export const uploadFile = async (req, res) => {
  console.log("Fichier reçu :", req.file);

  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier téléchargé.' });
  }

  // Créer une URL publique
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.status(200).json({
    message: 'Fichier uploadé avec succès.',
    fileUrl,
  });
};




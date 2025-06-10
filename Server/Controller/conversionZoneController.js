// controllers/conversionZoneController.js
import ConversionZone from '../Model/ConversionZone.js';

// Créer une conversion zone
export const createConversionZone = async (req, res) => {
  try {
    const conversionZone = await ConversionZone.create(req.body);
    res.status(201).json(conversionZone);
  } catch (error) {
    console.error('Erreur création conversion zone :', error);
    res.status(400).json({ error: error.message });
  }
};

// Récupérer toutes les conversion zones
export const getAllConversionZones = async (req, res) => {
  try {
    const conversionZones = await ConversionZone.findAll();
    res.status(200).json(conversionZones);
  } catch (error) {
    console.error('Erreur récupération conversion zones :', error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer une conversion zone par ID
export const getConversionZoneById = async (req, res) => {
  try {
    const { id } = req.params;
    const conversionZone = await ConversionZone.findByPk(id);
    if (!conversionZone) {
      return res.status(404).json({ error: 'Conversion zone non trouvée' });
    }
    res.status(200).json(conversionZone);
  } catch (error) {
    console.error('Erreur récupération conversion zone :', error);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour une conversion zone par ID
export const updateConversionZone = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRows] = await ConversionZone.update(req.body, { where: { id } });
    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Conversion zone non trouvée ou aucune modification' });
    }
    const updatedConversionZone = await ConversionZone.findByPk(id);
    res.status(200).json(updatedConversionZone);
  } catch (error) {
    console.error('Erreur mise à jour conversion zone :', error);
    res.status(400).json({ error: error.message });
  }
};

// Supprimer une conversion zone par ID
export const deleteConversionZone = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await ConversionZone.destroy({ where: { id } });
    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Conversion zone non trouvée' });
    }
    res.status(200).json({ message: 'Conversion zone supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression conversion zone :', error);
    res.status(500).json({ error: error.message });
  }
};


// Controller/zoneController.js
import Zone from '../Model/zone1.js';

// Créer une zone
export const createZone = async (req, res) => {
  try {
    const zone = await Zone.create(req.body);
    res.status(201).json(zone);
  } catch (error) {
    console.error('Erreur création zone :', error);
    res.status(400).json({ error: error.message });
  }
};

// Récupérer toutes les zones
export const getAllZones = async (req, res) => {
  try {
    const zones = await Zone.findAll();
    res.status(200).json(zones);
  } catch (error) {
    console.error('Erreur récupération zones :', error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer une zone par ID (clé primaire technique "id")
export const getZoneById = async (req, res) => {
  try {
    const { id } = req.params;
    const zone = await Zone.findByPk(id);
    if (!zone) {
      return res.status(404).json({ error: 'Zone non trouvée' });
    }
    res.status(200).json(zone);
  } catch (error) {
    console.error('Erreur récupération zone :', error);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour une zone par ID
export const updateZone = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRows] = await Zone.update(req.body, { where: { id } });
    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Zone non trouvée ou aucune modification' });
    }
    const updatedZone = await Zone.findByPk(id);
    res.status(200).json(updatedZone);
  } catch (error) {
    console.error('Erreur mise à jour zone :', error);
    res.status(400).json({ error: error.message });
  }
};

// Supprimer une zone par ID
export const deleteZone = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await Zone.destroy({ where: { id } });
    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Zone non trouvée' });
    }
    res.status(200).json({ message: 'Zone supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression zone :', error);
    res.status(500).json({ error: error.message });
  }
};

// Ajouter une liste de zones
export const createZonesList = async (req, res) => {
    try {
      const zones = req.body; // on attend un tableau d'objets zones
      if (!Array.isArray(zones) || zones.length === 0) {
        return res.status(400).json({ error: 'Le corps de la requête doit être un tableau non vide' });
      }
      const createdZones = await Zone.bulkCreate(zones, { validate: true });
      res.status(201).json(createdZones);
    } catch (error) {
      console.error('Erreur création liste de zones :', error);
      res.status(400).json({ error: error.message });
    }
  };
  

// Controller/magasinController.js
import Magasin from '../Model/magasin1.js';

// Créer un nouveau magasin
export const createMagasin = async (req, res) => {
  try {
    const magasin = await Magasin.create(req.body);
    res.status(201).json(magasin);
  } catch (error) {
    console.error('Erreur lors de la création du magasin :', error);
    res.status(400).json({ error: error.message });
  }
};

// Récupérer tous les magasins
export const getAllMagasins = async (req, res) => {
  try {
    const magasins = await Magasin.findAll();
    res.status(200).json(magasins);
  } catch (error) {
    console.error('Erreur lors de la récupération des magasins :', error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer un magasin par ID (clé primaire)
export const getMagasinById = async (req, res) => {
  try {
    const { id } = req.params;
    const magasin = await Magasin.findByPk(id);
    if (!magasin) {
      return res.status(404).json({ error: 'Magasin non trouvé' });
    }
    res.status(200).json(magasin);
  } catch (error) {
    console.error('Erreur lors de la récupération du magasin :', error);
    res.status(500).json({ error: error.message });
  }
};
export const getMagasinsByEntrepriseId = async (req, res) => {
  try {
    const { id } = req.params;  // id de l'entreprise

    // Trouver tous les magasins avec entreprise_id = id
    const magasins = await Magasin.findAll({
      where: { entreprise_id: id }
    });

    if (magasins.length === 0) {
      return res.status(404).json({ error: 'Aucun magasin trouvé pour cette entreprise' });
    }

    res.status(200).json(magasins);
  } catch (error) {
    console.error('Erreur lors de la récupération des magasins :', error);
    res.status(500).json({ error: error.message });
  }
};


// Mettre à jour un magasin par ID
export const updateMagasin = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRows] = await Magasin.update(req.body, {
      where: { id }
    });
    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Magasin non trouvé ou aucune modification' });
    }
    const updatedMagasin = await Magasin.findByPk(id);
    res.status(200).json(updatedMagasin);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du magasin :', error);
    res.status(400).json({ error: error.message });
  }
};

// Supprimer un magasin par ID
export const deleteMagasin = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await Magasin.destroy({
      where: { id }
    });
    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Magasin non trouvé' });
    }
    res.status(200).json({ message: 'Magasin supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du magasin :', error);
    res.status(500).json({ error: error.message });
  }
};

// Créer une liste de magasins
export const createMagasinsList = async (req, res) => {
    try {
      const magasinsList = req.body; 
      
      if (!Array.isArray(magasinsList) || magasinsList.length === 0) {
        return res.status(400).json({ error: 'Le corps de la requête doit contenir un tableau de magasins.' });
      }
  
      const createdMagasins = await Magasin.bulkCreate(magasinsList, { validate: true });
      res.status(201).json({ message: `${createdMagasins.length} magasins créés avec succès.`, magasins: createdMagasins });
    } catch (error) {
      console.error('Erreur lors de la création de la liste des magasins :', error);
      res.status(400).json({ error: error.message });
    }
  };
  
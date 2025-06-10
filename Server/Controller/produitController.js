import Produit from '../Model/Produit.js';

// Créer un produit
export const createProduit = async (req, res) => {
  try {
    const produit = await Produit.create(req.body);
    res.status(201).json(produit);
  } catch (error) {
    console.error('Erreur création produit :', error);
    res.status(400).json({ error: error.message });
  }
};

// Récupérer tous les produits
export const getAllProduits = async (req, res) => {
  try {
    const produits = await Produit.findAll();
    res.status(200).json(produits);
  } catch (error) {
    console.error('Erreur récupération produits :', error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer un produit par ID
export const getProduitById = async (req, res) => {
  try {
    const { id } = req.params;
    const produit = await Produit.findByPk(id);
    if (!produit) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    res.status(200).json(produit);
  } catch (error) {
    console.error('Erreur récupération produit :', error);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un produit par ID
export const updateProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRows] = await Produit.update(req.body, { where: { id } });
    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Produit non trouvé ou aucune modification' });
    }
    const updatedProduit = await Produit.findByPk(id);
    res.status(200).json(updatedProduit);
  } catch (error) {
    console.error('Erreur mise à jour produit :', error);
    res.status(400).json({ error: error.message });
  }
};

// Supprimer un produit par ID
export const deleteProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await Produit.destroy({ where: { id } });
    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    res.status(200).json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression produit :', error);
    res.status(500).json({ error: error.message });
  }
};

// Ajouter une liste de produits (bulk)
export const createProduitsList = async (req, res) => {
  try {
    const produits = req.body;
    if (!Array.isArray(produits) || produits.length === 0) {
      return res.status(400).json({ error: 'Le corps de la requête doit être un tableau non vide' });
    }
    const createdProduits = await Produit.bulkCreate(produits, { validate: true });
    res.status(201).json(createdProduits);
  } catch (error) {
    console.error('Erreur création liste de produits :', error);
    res.status(400).json({ error: error.message });
  }
};

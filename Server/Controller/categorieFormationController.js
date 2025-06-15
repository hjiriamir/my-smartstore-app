import CategorieFormation from '../Model/CategorieFormation.js';

// Liste toutes les catégories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await CategorieFormation.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Récupérer une catégorie par ID
export const getCategorieById = async (req, res) => {
  try {
    const categorie = await CategorieFormation.findByPk(req.params.id);
    if (!categorie) return res.status(404).json({ error: 'Catégorie non trouvée' });
    res.json(categorie);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Créer une nouvelle catégorie
export const createCategorie = async (req, res) => {
  try {
    const { nom, description } = req.body;
    const newCategorie = await CategorieFormation.create({ nom, description });
    res.status(201).json(newCategorie);
  } catch (error) {
    res.status(400).json({ error: 'Données invalides' });
  }
};

// Mettre à jour une catégorie
export const updateCategorie = async (req, res) => {
  try {
    const categorie = await CategorieFormation.findByPk(req.params.id);
    if (!categorie) return res.status(404).json({ error: 'Catégorie non trouvée' });

    const { nom, description } = req.body;
    await categorie.update({ nom, description });

    res.json(categorie);
  } catch (error) {
    res.status(400).json({ error: 'Erreur mise à jour' });
  }
};

// Supprimer une catégorie
export const deleteCategorie = async (req, res) => {
  try {
    const categorie = await CategorieFormation.findByPk(req.params.id);
    if (!categorie) return res.status(404).json({ error: 'Catégorie non trouvée' });

    await categorie.destroy();
    res.json({ message: 'Catégorie supprimée' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

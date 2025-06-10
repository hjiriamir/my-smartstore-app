import LegalConstraint from '../Model/LegalConstraint.js';

// Créer une contrainte légale
export const createLegalConstraint = async (req, res) => {
  try {
    const constraint = await LegalConstraint.create(req.body);
    res.status(201).json(constraint);
  } catch (error) {
    console.error('Erreur création contrainte légale :', error);
    res.status(400).json({ error: error.message });
  }
};

// Récupérer toutes les contraintes légales
export const getAllLegalConstraints = async (req, res) => {
  try {
    const constraints = await LegalConstraint.findAll();
    res.status(200).json(constraints);
  } catch (error) {
    console.error('Erreur récupération contraintes légales :', error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer une contrainte par ID
export const getLegalConstraintById = async (req, res) => {
  try {
    const { id } = req.params;
    const constraint = await LegalConstraint.findByPk(id);
    if (!constraint) {
      return res.status(404).json({ error: 'Contrainte non trouvée' });
    }
    res.status(200).json(constraint);
  } catch (error) {
    console.error('Erreur récupération contrainte légale :', error);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour une contrainte par ID
export const updateLegalConstraint = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRows] = await LegalConstraint.update(req.body, { where: { id } });
    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Contrainte non trouvée ou aucune modification' });
    }
    const updatedConstraint = await LegalConstraint.findByPk(id);
    res.status(200).json(updatedConstraint);
  } catch (error) {
    console.error('Erreur mise à jour contrainte légale :', error);
    res.status(400).json({ error: error.message });
  }
};

// Supprimer une contrainte par ID
export const deleteLegalConstraint = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await LegalConstraint.destroy({ where: { id } });
    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Contrainte non trouvée' });
    }
    res.status(200).json({ message: 'Contrainte légale supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression contrainte légale :', error);
    res.status(500).json({ error: error.message });
  }
};

// Ajouter une liste de contraintes légales
export const createLegalConstraintsList = async (req, res) => {
  try {
    const constraints = req.body;
    if (!Array.isArray(constraints) || constraints.length === 0) {
      return res.status(400).json({ error: 'Le corps de la requête doit être un tableau non vide' });
    }
    const createdConstraints = await LegalConstraint.bulkCreate(constraints, { validate: true });
    res.status(201).json(createdConstraints);
  } catch (error) {
    console.error('Erreur création liste de contraintes légales :', error);
    res.status(400).json({ error: error.message });
  }
};

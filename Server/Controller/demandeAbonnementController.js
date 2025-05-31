import DemandeAbonnement from '../Model/demandeAbonnement.js';

// Créer une nouvelle demande d'abonnement
export const createDemande = async (req, res) => {
  try {
    const demande = await DemandeAbonnement.create(req.body);
    res.status(201).json(demande);
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer toutes les demandes
export const getAllDemandes = async (req, res) => {
  try {
    const demandes = await DemandeAbonnement.findAll();
    res.json(demandes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer une demande par id
export const getDemandeById = async (req, res) => {
  try {
    const demande = await DemandeAbonnement.findByPk(req.params.id);
    if (!demande) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    res.json(demande);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour une demande par id
export const updateDemande = async (req, res) => {
  try {
    const [updated] = await DemandeAbonnement.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated === 0) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    const updatedDemande = await DemandeAbonnement.findByPk(req.params.id);
    res.json(updatedDemande);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer une demande par id
export const deleteDemande = async (req, res) => {
  try {
    const deleted = await DemandeAbonnement.destroy({
      where: { id: req.params.id }
    });
    if (deleted === 0) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    res.status(204).send();  // Pas de contenu à renvoyer
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

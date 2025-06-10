import SupplierAgreement from '../Model/SupplierAgreement.js';

// Créer un nouvel accord fournisseur
export const createAgreement = async (req, res) => {
  try {
    const agreement = await SupplierAgreement.create(req.body);
    res.status(201).json(agreement);
  } catch (error) {
    console.error('Erreur création accord fournisseur:', error);
    res.status(400).json({ error: error.message });
  }
};

// Récupérer tous les accords
export const getAllAgreements = async (req, res) => {
  try {
    const agreements = await SupplierAgreement.findAll();
    res.status(200).json(agreements);
  } catch (error) {
    console.error('Erreur récupération accords:', error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer un accord par ID
export const getAgreementById = async (req, res) => {
  try {
    const agreement = await SupplierAgreement.findByPk(req.params.id);
    if (!agreement) {
      return res.status(404).json({ message: 'Accord non trouvé' });
    }
    res.status(200).json(agreement);
  } catch (error) {
    console.error('Erreur récupération accord:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un accord
export const updateAgreement = async (req, res) => {
  try {
    const [updated] = await SupplierAgreement.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedAgreement = await SupplierAgreement.findByPk(req.params.id);
      return res.status(200).json(updatedAgreement);
    }
    throw new Error('Accord non trouvé');
  } catch (error) {
    console.error('Erreur mise à jour accord:', error);
    res.status(400).json({ error: error.message });
  }
};

// Supprimer un accord
export const deleteAgreement = async (req, res) => {
  try {
    const deleted = await SupplierAgreement.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      return res.status(204).send();
    }
    throw new Error('Accord non trouvé');
  } catch (error) {
    console.error('Erreur suppression accord:', error);
    res.status(400).json({ error: error.message });
  }
};
import Promotion from '../Model/Promotion.js';

// Créer une promotion
export const createPromotion = async (req, res) => {
  try {
    const promotion = await Promotion.create(req.body);
    res.status(201).json(promotion);
  } catch (error) {
    console.error('Erreur création promotion :', error);
    res.status(400).json({ error: error.message });
  }
};

// Récupérer toutes les promotions
export const getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.findAll();
    res.status(200).json(promotions);
  } catch (error) {
    console.error('Erreur récupération promotions :', error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer une promotion par ID
export const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findByPk(id);
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion non trouvée' });
    }
    res.status(200).json(promotion);
  } catch (error) {
    console.error('Erreur récupération promotion :', error);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour une promotion par ID
export const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRows] = await Promotion.update(req.body, { where: { promotion_id: id } });
    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Promotion non trouvée ou aucune modification' });
    }
    const updatedPromotion = await Promotion.findByPk(id);
    res.status(200).json(updatedPromotion);
  } catch (error) {
    console.error('Erreur mise à jour promotion :', error);
    res.status(400).json({ error: error.message });
  }
};

// Supprimer une promotion par ID
export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await Promotion.destroy({ where: { promotion_id: id } });
    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Promotion non trouvée' });
    }
    res.status(200).json({ message: 'Promotion supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression promotion :', error);
    res.status(500).json({ error: error.message });
  }
};

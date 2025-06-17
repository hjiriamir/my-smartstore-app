import ProductPosition from '../Model/ProductPosition.js';

export const createProductPosition = async (req, res) => {
  try {
    const newPosition = await ProductPosition.create(req.body);
    res.status(201).json(newPosition);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllProductPositions = async (req, res) => {
  try {
    const positions = await ProductPosition.findAll();
    res.status(200).json(positions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProductPositionById = async (req, res) => {
  try {
    const position = await ProductPosition.findByPk(req.params.id);
    if (!position) return res.status(404).json({ message: 'Introuvable' });
    res.status(200).json(position);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProductPosition = async (req, res) => {
  try {
    const updated = await ProductPosition.update(req.body, {
      where: { position_id: req.params.id },
    });
    res.status(200).json({ message: 'Mise à jour réussie', updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteProductPosition = async (req, res) => {
  try {
    await ProductPosition.destroy({ where: { position_id: req.params.id } });
    res.status(200).json({ message: 'Supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

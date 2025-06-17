import Furniture from '../Model/Furniture.js';

export const createFurniture = async (req, res) => {
  try {
    const newFurniture = await Furniture.create(req.body);
    res.status(201).json(newFurniture);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllFurnitures = async (req, res) => {
  try {
    const list = await Furniture.findAll();
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFurnitureById = async (req, res) => {
  try {
    const furniture = await Furniture.findByPk(req.params.id);
    if (!furniture) return res.status(404).json({ message: 'Introuvable' });
    res.status(200).json(furniture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateFurniture = async (req, res) => {
  try {
    const result = await Furniture.update(req.body, {
      where: { furniture_id: req.params.id },
    });
    res.status(200).json({ message: 'Mise à jour réussie', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteFurniture = async (req, res) => {
  try {
    await Furniture.destroy({ where: { furniture_id: req.params.id } });
    res.status(200).json({ message: 'Supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

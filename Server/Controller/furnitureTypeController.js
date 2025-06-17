import FurnitureType from '../Model/FurnitureType.js';

export const createFurnitureType = async (req, res) => {
  try {
    const newType = await FurnitureType.create(req.body);
    res.status(201).json(newType);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllFurnitureTypes = async (req, res) => {
  try {
    const list = await FurnitureType.findAll();
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFurnitureTypeById = async (req, res) => {
  try {
    const type = await FurnitureType.findByPk(req.params.id);
    if (!type) return res.status(404).json({ message: 'Introuvable' });
    res.status(200).json(type);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateFurnitureType = async (req, res) => {
  try {
    const result = await FurnitureType.update(req.body, {
      where: { furniture_type_id: req.params.id },
    });
    res.status(200).json({ message: 'Mise à jour réussie', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteFurnitureType = async (req, res) => {
  try {
    await FurnitureType.destroy({ where: { furniture_type_id: req.params.id } });
    res.status(200).json({ message: 'Supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

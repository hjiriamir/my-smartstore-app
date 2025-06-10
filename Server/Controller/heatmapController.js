import HeatmapData from '../Model/HeatmapData.js';

// Créer un point de données Heatmap
export const createHeatmapData = async (req, res) => {
    try {
        const heatmapData = await HeatmapData.create(req.body);
        res.status(201).json(heatmapData);
    } catch (error) {
        console.error('Erreur création HeatmapData :', error);
        res.status(400).json({ error: error.message });
    }
};

// Récupérer toutes les données Heatmap
export const getAllHeatmapData = async (req, res) => {
    try {
        const data = await HeatmapData.findAll();
        res.status(200).json(data);
    } catch (error) {
        console.error('Erreur récupération HeatmapData :', error);
        res.status(500).json({ error: error.message });
    }
};

// Récupérer un point Heatmap par ID
export const getHeatmapDataById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await HeatmapData.findByPk(id);
        if (!data) {
            return res.status(404).json({ error: 'HeatmapData non trouvé' });
        }
        res.status(200).json(data);
    } catch (error) {
        console.error('Erreur récupération HeatmapData :', error);
        res.status(500).json({ error: error.message });
    }
};

// Mettre à jour un point Heatmap
export const updateHeatmapData = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await HeatmapData.update(req.body, { where: { id } });
        if (updated === 0) {
            return res.status(404).json({ error: 'Aucune donnée mise à jour' });
        }
        const updatedData = await HeatmapData.findByPk(id);
        res.status(200).json(updatedData);
    } catch (error) {
        console.error('Erreur mise à jour HeatmapData :', error);
        res.status(400).json({ error: error.message });
    }
};

// Supprimer un point Heatmap
export const deleteHeatmapData = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await HeatmapData.destroy({ where: { id } });
        if (deleted === 0) {
            return res.status(404).json({ error: 'Donnée non trouvée' });
        }
        res.status(200).json({ message: 'Donnée supprimée avec succès' });
    } catch (error) {
        console.error('Erreur suppression HeatmapData :', error);
        res.status(500).json({ error: error.message });
    }
};

// Créer une liste 
export const createHeatmapDataList = async (req, res) => {
    try {
        const list = req.body; // tableau d'objets
        if (!Array.isArray(list) || list.length === 0) {
            return res.status(400).json({ error: 'Le corps doit être un tableau non vide' });
        }
        const created = await HeatmapData.bulkCreate(list, { validate: true });
        res.status(201).json(created);
    } catch (error) {
        console.error('Erreur création liste HeatmapData :', error);
        res.status(400).json({ error: error.message });
    }
};

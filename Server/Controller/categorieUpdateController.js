import Categorie1 from '../Model/Categorie1.js';
import Categorie from '../Model/Categorie1.js';

export const createCategorie = async (req, res) => {
    try {
        const categorie = await Categorie.create(req.body);
        res.status(201).json(categorie);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getAllCategories = async (req, res) => {
    try {
        const categories = await Categorie.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCategorieById = async (req, res) => {
    try {
        const categorie = await Categorie.findByPk(req.params.id);
        if (categorie) {
            res.json(categorie);
        } else {
            res.status(404).json({ message: 'Categorie not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateCategorie = async (req, res) => {
    try {
        const categorie = await Categorie.findByPk(req.params.id);
        if (categorie) {
            await categorie.update(req.body);
            res.json(categorie);
        } else {
            res.status(404).json({ message: 'Categorie not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteCategorie = async (req, res) => {
    try {
        const categorie = await Categorie.findByPk(req.params.id);
        if (categorie) {
            await categorie.destroy();
            res.json({ message: 'Categorie deleted' });
        } else {
            res.status(404).json({ message: 'Categorie not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Ajouter une liste de catégories
export const createCategorieList = async (req, res) => {
    try {
        const categories = await Categorie.bulkCreate(req.body, { validate: true });
        res.status(201).json(categories);
    } catch (error) {
        console.error('Erreur lors de la création des catégories :', error);
        res.status(400).json({ error: error.message });
    }
};

export const getCategoriesByMagasin = async(req, res) =>{
    try {
        const { idMagasin } = req.params;
        if(!idMagasin){
                console.error("vous devez avoir id magasin");
        }
        const categories = await Categorie1.findAll({
            where: {magasin_id : idMagasin}
        })
        res.status(201).json(categories);
    } catch (error) {
        console.error('Erreur lors de get Categories By Magasin :', error);
        res.status(400).json({ error: error.message });
    }
}
import Categorie1 from '../Model/Categorie1.js';
import Categorie from '../Model/Categorie1.js';
import { Op } from "sequelize";
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

export const getCategoriesByMagasins = async (req, res) => {
    try {
      const { idMagasin } = req.query; // on utilise query, pas params
  
      if (!idMagasin) {
        return res.status(400).json({ error: "idMagasin requis (un ou plusieurs)." });
      }
  
      // Normaliser en tableau
      let listeMagasins = [];
      if (Array.isArray(idMagasin)) {
        listeMagasins = idMagasin;
      } else if (typeof idMagasin === "string") {
        listeMagasins = idMagasin.split(",").map((id) => id.trim());
      } else {
        listeMagasins = [String(idMagasin)];
      }
  
      // Requête Sequelize
      const categories = await Categorie1.findAll({
        where: {
          magasin_id: {
            [Op.in]: listeMagasins,
          },
        },
      });
  
      res.status(200).json(categories);
    } catch (error) {
      console.error("Erreur lors de getCategoriesByMagasins :", error);
      res.status(400).json({ error: error.message });
    }
  };
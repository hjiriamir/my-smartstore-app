import Planogram from '../Model/Planogram.js';
import Furniture from '../Model/Furniture.js';
import ProductPosition from '../Model/ProductPosition.js';
import Tache from '../Model/Tache.js';
import sequelize from '../Config/database1.js';

// Créer
export const createPlanogram = async (req, res) => {
  try {
    const newPlanogram = await Planogram.create(req.body);
    res.status(201).json(newPlanogram);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lire tous
export const getAllPlanograms = async (req, res) => {
  try {
    const list = await Planogram.findAll();
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lire par ID
export const getPlanogramById = async (req, res) => {
  try {
    const planogram = await Planogram.findByPk(req.params.id);
    if (!planogram) return res.status(404).json({ message: 'Introuvable' });
    res.status(200).json(planogram);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mettre à jour
export const updatePlanogram = async (req, res) => {
  try {
    const result = await Planogram.update(req.body, {
      where: { planogram_id: req.params.id },
    });
    res.status(200).json({ message: 'Mise à jour réussie', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Supprimer
export const deletePlanogram = async (req, res) => {
  try {
    await Planogram.destroy({ where: { planogram_id: req.params.id } });
    res.status(200).json({ message: 'Supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




export const createFullPlanogram = async (req, res) => {
  const t = await sequelize.transaction(); 
  try {
    const {
      magasin_id,
      zone_id,
      nom,
      description,
      created_by,
      statut,
      furnitures,
      tache
    } = req.body;

    // 1. Créer le planogramme
    const newPlanogram = await Planogram.create({
      magasin_id,
      zone_id,
      nom,
      description,
      created_by,
      statut,
      date_creation: new Date()
    }, { transaction: t });

    // Attendre que le planogramme soit bien créé
    await newPlanogram.reload({ transaction: t });

    // 2. Créer les meubles et leurs positions produits
    for (const furnitureData of furnitures) {
      const { productPositions, ...furnitureProps } = furnitureData;

      const newFurniture = await Furniture.create({
        ...furnitureProps,
        planogram_id: newPlanogram.planogram_id
      }, { transaction: t });

      // 3. Créer les positions de produits pour ce meuble
      if (productPositions && productPositions.length > 0) {
        for (const pos of productPositions) {
          await ProductPosition.create({
            ...pos,
            furniture_id: newFurniture.furniture_id,
            date_ajout: new Date()
          }, { transaction: t });
        }
      }
    }

    // 4. Créer la tâche si présente
    if (tache) {
      const {
        idUser,
        statut,
        date_debut,
        date_fin_prevue,
        type,
        commentaire
      } = tache;

      await Tache.create({
        planogram_id: newPlanogram.planogram_id,
        magasin_id: newPlanogram.magasin_id,
        idUser: idUser || null,
        statut: statut || 'à faire',
        date_debut: date_debut ? new Date(date_debut) : null,
        date_fin_prevue: date_fin_prevue ? new Date(date_fin_prevue) : null,
        date_fin_reelle: null,
        type: type || 'implémentation',
        commentaire: commentaire || `Tâche liée au planogramme ${newPlanogram.nom}`
      }, { transaction: t });
    }

    // Commit
    await t.commit();

    res.status(201).json({ 
      message: 'Planogramme, meubles, produits et tâche créés avec succès.',
      planogram_id: newPlanogram.planogram_id
    });

  } catch (error) {
    await t.rollback();
    console.error("Erreur lors de la création complète du planogramme :", error);
    res.status(500).json({ error: error.message });
  }
};


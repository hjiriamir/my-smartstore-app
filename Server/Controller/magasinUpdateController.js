// Controller/magasinController.js
import magasin1 from '../Model/magasin1.js';
import Magasin from '../Model/magasin1.js';
import Users from '../Model/Users.js'
import { Op } from 'sequelize';

import {getVenteTotalByMagasin, getTotalMagasinByEntreprises, getTotalZonesByEntreprises, getTotalSurfaceByEntreprises, getMagasinDetails } from '../Services/magasinService.js'
import {getVenteTotalByZone, getZonesByMagasin} from '../Services/zoneService.js'


// Créer un nouveau magasin
export const createMagasin = async (req, res) => {
  try {
    const magasin = await Magasin.create(req.body);
    res.status(201).json(magasin);
  } catch (error) {
    console.error('Erreur lors de la création du magasin :', error);
    res.status(400).json({ error: error.message });
  }
};

// Récupérer tous les magasins
export const getAllMagasins = async (req, res) => {
  try {
    const magasins = await Magasin.findAll();
    res.status(200).json(magasins);
  } catch (error) {
    console.error('Erreur lors de la récupération des magasins :', error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer un magasin par ID (clé primaire)
export const getMagasinById = async (req, res) => {
  try {
    const { id } = req.params;
    const magasin = await Magasin.findByPk(id);
    if (!magasin) {
      return res.status(404).json({ error: 'Magasin non trouvé' });
    }
    res.status(200).json(magasin);
  } catch (error) {
    console.error('Erreur lors de la récupération du magasin :', error);
    res.status(500).json({ error: error.message });
  }
};
export const getMagasinsByEntrepriseId = async (req, res) => {
  try {
    const { id } = req.params;  // id de l'entreprise

    // Trouver tous les magasins avec entreprise_id = id
    const magasins = await Magasin.findAll({
      where: { entreprise_id: id }
    });

    if (magasins.length === 0) {
      return res.status(404).json({ error: 'Aucun magasin trouvé pour cette entreprise' });
    }

    res.status(200).json(magasins);
  } catch (error) {
    console.error('Erreur lors de la récupération des magasins :', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMagasinByUser = async (req, res)=> {
  try {
    const { id } = req.params;  // id de l'utilisateur
    const user = await Users.findByPk(id);
    // Trouver tous la magasin avec user_id = id
    const magasin = await Magasin.findOne({
      where: {magasin_id: user.magasin_id}
    })

    if (magasin.length === 0) {
      return res.status(404).json({ error: 'Aucun magasin trouvé pour cette utilisateur' });
    }

    res.status(200).json(magasin);
  } catch (error) {
    console.error('Erreur lors de la récupération du magasin :', error);
    res.status(500).json({ error: error.message });
  }
}
// Mettre à jour un magasin par ID
export const updateMagasin = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRows] = await Magasin.update(req.body, {
      where: { id }
    });
    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Magasin non trouvé ou aucune modification' });
    }
    const updatedMagasin = await Magasin.findByPk(id);
    res.status(200).json(updatedMagasin);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du magasin :', error);
    res.status(400).json({ error: error.message });
  }
};

// Supprimer un magasin par ID
export const deleteMagasin = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await Magasin.destroy({
      where: { id }
    });
    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Magasin non trouvé' });
    }
    res.status(200).json({ message: 'Magasin supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du magasin :', error);
    res.status(500).json({ error: error.message });
  }
};

// Créer une liste de magasins
export const createMagasinsList = async (req, res) => {
    try {
      const magasinsList = req.body; 
      
      if (!Array.isArray(magasinsList) || magasinsList.length === 0) {
        return res.status(400).json({ error: 'Le corps de la requête doit contenir un tableau de magasins.' });
      }
  
      const createdMagasins = await Magasin.bulkCreate(magasinsList, { validate: true });
      res.status(201).json({ message: `${createdMagasins.length} magasins créés avec succès.`, magasins: createdMagasins });
    } catch (error) {
      console.error('Erreur lors de la création de la liste des magasins :', error);
      res.status(400).json({ error: error.message });
    }
  };
  
  export const getMagasinIdByCode = async(req,res)=>{
    try {
      const { magasin_id } = req.body;
      const magasinId = await magasin1.findOne({
        where : {magasin_id :magasin_id  }
      })
      if (!magasinId) {
        return res.status(404).json({ message: "Magasin non trouvé" });
      }
      
      res.status(200).json(magasinId.id);
    } catch (error) {
      console.error('Erreur lors de la récuperation getCodeMagasin :', error);
      res.status(400).json({ error: error.message });
    }
  }

  export const getPerformanceZones = async (req, res) => {
    try {
      const { idMagasin, date_debut, date_fin } = req.query;
  
      if (!idMagasin) {
        return res.status(400).json({ error: "Le paramètre idMagasin est obligatoire" });
      }
  
      // 1. Récupérer les ventes totales du magasin
      const ventesMagasin = await getVenteTotalByMagasin(idMagasin, date_debut, date_fin);
      const totalVentesMagasin = ventesMagasin.totalVentes;
  
      if (totalVentesMagasin === 0) {
        return res.status(200).json({
          message: "Aucune vente enregistrée pour cette période",
          performances: []
        });
      }
  
      // 2. Récupérer toutes les zones du magasin
      const zones = await getZonesByMagasin(idMagasin);
      
      // 3. Calculer les performances pour chaque zone
      const performances = await Promise.all(
        zones.map(async (zone) => {
          const ventesZone = await getVenteTotalByZone(zone.zone_id, idMagasin, date_debut, date_fin);
          const performance = (ventesZone.totalVentes / totalVentesMagasin) * 100;
          
          return {
            zone_id: zone.zone_id,
            nom_zone: zone.nom_zone,
            ventes_zone: ventesZone.totalVentes,
            performance: performance.toFixed(2) + '%',
            details: ventesZone.details
          };
        })
      );
  
      // 4. Trier par performance décroissante
      performances.sort((a, b) => parseFloat(b.performance) - parseFloat(a.performance));
  
      // 5. Retourner les résultats
      res.json({
        idMagasin,
        date_debut,
        date_fin,
        total_ventes_magasin: totalVentesMagasin,
        performances
      });
  
    } catch (error) {
      console.error("Erreur dans getPerformanceZones:", error);
      res.status(500).json({ 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  };

  export const getEntrepriseStats = async (req, res) => {
    try {
      const { idEntreprise } = req.params;
  
      if (!idEntreprise) {
        return res.status(400).json({ error: "Le paramètre idEntreprise est obligatoire" });
      }
  
      // Appeler les trois fonctions en parallèle
      const [magasinsData, zonesData, surfaceTotal] = await Promise.all([
        getTotalMagasinByEntreprises(idEntreprise),
        getTotalZonesByEntreprises(idEntreprise),
        getTotalSurfaceByEntreprises(idEntreprise)
      ]);
  
      return res.status(200).json({
        totalMagasins: magasinsData.totalMagasins,
        magasins: magasinsData.magasins, // <-- ajout de la liste des magasins
        totalZones: zonesData.totalZones,
        surfaceTotal: surfaceTotal
      });
  
    } catch (error) {
      console.error("Erreur dans getEntrepriseStats:", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  };
  
  export const getMagasinDetailsController = async (req, res) => {
    try {
      const { idMagasin } = req.params;
  
      if (!idMagasin) {
        return res.status(400).json({ error: "Le paramètre idMagasin est obligatoire" });
      }
  
      const magasin = await getMagasinDetails(idMagasin);
  
      return res.status(200).json({
        success: true,
        magasin
      });
  
    } catch (error) {
      console.error("Erreur dans getMagasinDetailsController:", error);
  
      // Gestion des erreurs selon le type
      if (error.message === "Magasin introuvable") {
        return res.status(404).json({ error: error.message });
      }
  
      return res.status(500).json({ error: "Erreur serveur" });
    }
  };
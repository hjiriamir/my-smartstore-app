import { Op } from 'sequelize'
import HeatmapData from '../Model/HeatmapData.js';


export const calculerIntensite = (visiteurs, duree_moyenne, seuilMax = 1000) => {
    if (!visiteurs || !duree_moyenne) return 0;
  
    const valeur = (visiteurs * duree_moyenne) / seuilMax * 100;
  
    // Limiter entre 0 et 100
    return Math.min(100, valeur);
  };
  

  export const getHeatmapStatsByMagasin = async (idMagasin, date_debut, date_fin) => {
    try {
      console.log(`Début getHeatmapStatsByMagasin pour magasin ${idMagasin}`);
  
      // 1. Filtrage
      const where = {
        magasin_id: idMagasin,
      };
  
      if (date_debut || date_fin) {
        where.date = {};
        if (date_debut) where.date[Op.gte] = new Date(date_debut);
        if (date_fin) where.date[Op.lte] = new Date(date_fin);
      }
  
      // 2. Récupérer les données
      const heatmaps = await HeatmapData.findAll({ where });
  
      if (heatmaps.length === 0) {
        return {
          magasin_id: idMagasin,
          total_visiteurs: 0,
          duree_moyenne_globale: 0,
          intensite_moyenne: 0,
        };
      }
  
      // 3. Calculs
      const totalVisiteurs = heatmaps.reduce(
        (sum, h) => sum + (h.visiteurs || 0),
        0
      );
  
      const dureeMoyenneGlobale =
        heatmaps.reduce(
          (sum, h) => sum + (parseFloat(h.duree_moyenne) || 0),
          0
        ) / heatmaps.length;
  
      const intensiteMoyenne =
        heatmaps.reduce(
          (sum, h) => sum + (parseFloat(h.intensite) || 0),
          0
        ) / heatmaps.length;
  
      const result = {
        magasin_id: idMagasin,
        total_visiteurs: totalVisiteurs,
        duree_moyenne_globale: parseFloat(dureeMoyenneGlobale.toFixed(2)),
        intensite_moyenne: parseFloat(intensiteMoyenne.toFixed(2)),
      };
  
      console.log(`Résultats pour magasin ${idMagasin}:`, result);
      return result;
    } catch (error) {
      console.error('Erreur dans getHeatmapStatsByMagasin:', error);
      throw error;
    }
  };
  
  export const getHeatmapStatsByZone = async (idZone, date_debut, date_fin) => {
    try {
      console.log(`Début getHeatmapStatsByZone pour zone ${idZone}`);
  
      // 1. Filtrage
      const where = {
        zone_id: idZone,
      };
  
      if (date_debut || date_fin) {
        where.date = {};
        if (date_debut) where.date[Op.gte] = new Date(date_debut);
        if (date_fin) where.date[Op.lte] = new Date(date_fin);
      }
  
      // 2. Récupérer les données filtrées par zone
      const heatmaps = await HeatmapData.findAll({ where });
  
      if (heatmaps.length === 0) {
        return {
          zone_id: idZone,
          total_visiteurs: 0,
          duree_moyenne_globale: 0,
          intensite_moyenne: 0,
        };
      }
  
      // 3. Calculs
      const totalVisiteurs = heatmaps.reduce(
        (sum, h) => sum + (h.visiteurs || 0),
        0
      );
  
      const dureeMoyenneGlobale =
        heatmaps.reduce(
          (sum, h) => sum + (parseFloat(h.duree_moyenne) || 0),
          0
        ) / heatmaps.length;
  
      const intensiteMoyenne =
        heatmaps.reduce(
          (sum, h) => sum + (parseFloat(h.intensite) || 0),
          0
        ) / heatmaps.length;
  
      const result = {
        zone_id: idZone,
        total_visiteurs: totalVisiteurs,
        duree_moyenne_globale: parseFloat(dureeMoyenneGlobale.toFixed(2)),
        intensite_moyenne: parseFloat(intensiteMoyenne.toFixed(2)),
      };
  
      console.log(`Résultats pour zone ${idZone}:`, result);
      return result;
    } catch (error) {
      console.error('Erreur dans getHeatmapStatsByZone:', error);
      throw error;
    }
  };
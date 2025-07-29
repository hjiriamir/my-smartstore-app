import { Sequelize, Op, where, fn, col, literal  } from 'sequelize';
import sequelize from '../Config/database1.js';

import Planogram from '../Model/Planogram.js';
import Furniture from '../Model/Furniture.js';
import ProductPosition from '../Model/ProductPosition.js';
import Tache from '../Model/Tache.js';
import Users from '../Model/Users.js';
import Notification from '../Model/Notification.js';
import { sendBasicEmail } from '../Services/SendEmail.js';
import Zone1 from '../Model/zone1.js';
import {
  getProductsPerPlanogram,
  getVenteProduitsPerPlanogram,
  getVisiteursParZone
} from '../Services/planogramService.js';

// Créer un planogramme simple
export const createPlanogram = async (req, res) => {
  try {
    const newPlanogram = await Planogram.create(req.body);
    res.status(201).json(newPlanogram);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lire tous les planogrammes
export const getAllPlanograms = async (req, res) => {
  try {
    const list = await Planogram.findAll();
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lire un planogramme par ID
export const getPlanogramById = async (req, res) => {
  try {
    const planogram = await Planogram.findByPk(req.params.id);
    if (!planogram) return res.status(404).json({ message: 'Introuvable' });
    res.status(200).json(planogram);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mettre à jour un planogramme
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

// Supprimer un planogramme
export const deletePlanogram = async (req, res) => {
  try {
    await Planogram.destroy({ where: { planogram_id: req.params.id } });
    res.status(200).json({ message: 'Supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtenir l'e-mail d'un utilisateur
export const getUserEmail = async (idUser) => {
  const user = await Users.findByPk(idUser);
  if (!user) throw new Error(`Utilisateur avec id ${idUser} non trouvé`);
  return user.email;
};

export const createFullPlanogramm = async (req, res) => {
  const t = await sequelize.transaction(); 
  try {
    const {
      planogram_id,  // ✅ nouveau champ
      magasin_id,
      zone_id,
      nom,
      description,
      created_by,
      statut,
      furnitures,
      tache
    } = req.body;

    let targetPlanogram;

    // ✅ 1. Soit utiliser un planogramme existant, soit en créer un nouveau
    if (planogram_id) {
      // Vérifier si le planogramme existe
      targetPlanogram = await Planogram.findByPk(planogram_id);
      if (!targetPlanogram) {
        throw new Error(`Planogramme avec ID ${planogram_id} introuvable`);
      }
    } else {
      targetPlanogram = await Planogram.create({
        magasin_id,
        zone_id,
        nom,
        description,
        created_by,
        statut,
        date_creation: new Date()
      }, { transaction: t });

      await targetPlanogram.reload({ transaction: t });
    }

    // ✅ 2. Créer les meubles + leurs positions produits
    for (const furnitureData of furnitures) {
      const { productPositions, ...furnitureProps } = furnitureData;

      const newFurniture = await Furniture.create({
        ...furnitureProps,
        planogram_id: targetPlanogram.planogram_id
      }, { transaction: t });

      if (productPositions?.length) {
        for (const pos of productPositions) {
          await ProductPosition.create({
            ...pos,
            furniture_id: newFurniture.furniture_id,
            date_ajout: new Date()
          }, { transaction: t });
        }
      }
    }

    // ✅ 3. Créer la tâche si elle est fournie
    if (tache) {
      const {
        idUser,
        statut: tacheStatut,
        date_debut,
        date_fin_prevue,
        type,
        commentaire
      } = tache;

      await Tache.create({
        planogram_id: targetPlanogram.planogram_id,
        magasin_id: targetPlanogram.magasin_id,
        idUser: idUser || null,
        statut: tacheStatut || 'à faire',
        date_debut: date_debut ? new Date(date_debut) : null,
        date_fin_prevue: date_fin_prevue ? new Date(date_fin_prevue) : null,
        date_fin_reelle: null,
        type: type || 'implémentation',
        commentaire: commentaire || `Tâche liée au planogramme ${targetPlanogram.nom}`
      }, { transaction: t });

      // 📧 Email et notification
      const actualUser = await Users.findByPk(idUser);
      if (idUser && actualUser?.NotificationPreference === true) {
        try {
          const senderEmail = await getUserEmail(created_by);
          const receiverEmail = await getUserEmail(idUser);
          await sendBasicEmail(senderEmail, receiverEmail);
          console.log(`Email envoyé de ${senderEmail} à ${receiverEmail}`);
        } catch (emailError) {
          console.error("Erreur email:", emailError);
        }
      }

      await Notification.create({
        Utilisateur_id: idUser,
        type: 'nouveau planogramme',
        contenu: `Un nouveau planogramme intitulé ${targetPlanogram.nom} vient d’être publié pour votre magasin.`,
        date_envoi: new Date(),
        lu: 0
      }, { transaction: t });
    }

    await t.commit();

    res.status(201).json({
      message: planogram_id
        ? 'Meubles et tâche ajoutés au planogramme existant avec succès.'
        : 'Nouveau planogramme, meubles, tâche et notification créés avec succès.',
      planogram_id: targetPlanogram.planogram_id
    });

  } catch (error) {
    await t.rollback();
    console.error("Erreur lors de createFullPlanogram:", error);
    res.status(500).json({ error: error.message });
  }
};


// Création complète de planogramme + meubles + produits + tâche
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

    await newPlanogram.reload({ transaction: t });

    // 2. Créer les meubles et leurs positions produits
    for (const furnitureData of furnitures) {
      const { productPositions, ...furnitureProps } = furnitureData;

      const newFurniture = await Furniture.create({
        ...furnitureProps,
        planogram_id: newPlanogram.planogram_id
      }, { transaction: t });

      if (productPositions?.length) {
        for (const pos of productPositions) {
          await ProductPosition.create({
            ...pos,
            furniture_id: newFurniture.furniture_id,
            date_ajout: new Date()
          }, { transaction: t });
        }
      }
    }

    // 3. Créer la tâche si présente
    if (tache) {
      const {
        idUser,
        statut: tacheStatut,
        date_debut,
        date_fin_prevue,
        type,
        commentaire
      } = tache;

      await Tache.create({
        planogram_id: newPlanogram.planogram_id,
        magasin_id: newPlanogram.magasin_id,
        idUser: idUser || null,
        statut: tacheStatut || 'à faire',
        date_debut: date_debut ? new Date(date_debut) : null,
        date_fin_prevue: date_fin_prevue ? new Date(date_fin_prevue) : null,
        date_fin_reelle: null,
        type: type || 'implémentation',
        commentaire: commentaire || `Tâche liée au planogramme ${newPlanogram.nom}`
      }, { transaction: t });
      const actualUser = await Users.findByPk(idUser)

      // Envoi email notification si idUser
      if (idUser && actualUser.NotificationPreference === true) {
        try {
          const senderEmail = await getUserEmail(created_by);
          const receiverEmail = await getUserEmail(idUser);
          await sendBasicEmail(senderEmail, receiverEmail);
          console.log(`Email de notification envoyé de ${senderEmail} à ${receiverEmail}`);
        } catch (emailError) {
          console.error("Erreur lors de l'envoi de l'email de notification:", emailError);
        }
      }

      // Créer notification dans la base (toujours dans la transaction)
      await Notification.create({
        Utilisateur_id: idUser,
        type: 'nouveau planogramme',
        contenu: `Un nouveau planogramme intitulé ${newPlanogram.nom} vient d’être publié pour votre magasin. Veuillez consulter et préparer sa mise en place.`,
        date_envoi: new Date(),
        lu: 0
      }, { transaction: t });
    }

    // Valider transaction
    await t.commit();

    res.status(201).json({ 
      message: 'Planogramme, meubles, produits, tâche et notification créés avec succès.',
      planogram_id: newPlanogram.planogram_id
    });

  } catch (error) {
    await t.rollback();
    console.error("Erreur lors de la création complète du planogramme :", error);
    res.status(500).json({ error: error.message });
  }
};

/*export const createFullPlanogram = async (req, res) => {
  const t = await sequelize.transaction(); 
  try {
    const {
      magasin_id, zone_id, nom, description,
      created_by, statut, furnitures, tache
    } = req.body;

    const newPlanogram = await Planogram.create({
      magasin_id, zone_id, nom, description,
      created_by, statut,
      date_creation: new Date()
    }, { transaction: t });

    await newPlanogram.reload({ transaction: t });

    for (const furnitureData of furnitures) {
      const { productPositions, ...furnitureProps } = furnitureData;
      const newFurniture = await Furniture.create({
        ...furnitureProps,
        planogram_id: newPlanogram.planogram_id
      }, { transaction: t });

      if (productPositions?.length) {
        for (const pos of productPositions) {
          await ProductPosition.create({
            ...pos,
            furniture_id: newFurniture.furniture_id,
            date_ajout: new Date()
          }, { transaction: t });
        }
      }
    }

    if (tache) {
      const {
        idUser, statut, date_debut,
        date_fin_prevue, type, commentaire
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

      if (idUser) {
        try {
          const senderEmail = await getUserEmail(created_by);
          const receiverEmail = await getUserEmail(idUser);
          await sendBasicEmail(senderEmail, receiverEmail);
          console.log(`Email de notification envoyé de ${senderEmail} à ${receiverEmail}`);
        } catch (emailError) {
          console.error("Erreur lors de l'envoi de l'email de notification:", emailError);
        }
      }
    }

    await t.commit();

    res.status(201).json({ 
      message: 'Planogramme, meubles, produits et tâche créés avec succès.',
      planogram_id: newPlanogram.planogram_id
     
    });
    await Notification.create({
        Utilisateur_id: idUser,
        type:'nouveau planogramme',
        contenu: `Un nouveau planogramme intitulé ${newPlanogram.nom} vient d’être publié pour votre magasin. Veuillez consulter et préparer sa mise en place.`,
        date_envoi: DataTypes.NOW,
        lu:0
      })
  } catch (error) {
    await t.rollback();
    console.error("Erreur lors de la création complète du planogramme :", error);
    res.status(500).json({ error: error.message });
  }
};*/

// Récupérer les planogrammes actifs liés à une tâche par magasin et utilisateur
export const getPlanogramsByMagasin = async (req, res) => {
  const { idMagasin, idUser } = req.params;

  if (!idMagasin || !idUser) {
    return res.status(400).json({ error: "idMagasin ou idUser manquant." });
  }

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const planograms = await Planogram.findAll({
      where: {
        magasin_id: idMagasin,
        statut: 'actif',
        date_creation: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      },
      include: [
        {
          model: Tache,
          as: 'taches',
          where: {
            idUser,
            type: 'mise_en_place'
          },
          required: true,
          include: [
            {
              model: Users,
              as: 'user', // correspond à l'alias de l'association
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
      
    });

    const result = planograms.map(planogram => {
      const taches = planogram.taches || [];

      const totalTaches = taches.length;
      const nbTermine = taches.filter(t => t.statut === 'terminé').length;
      const nbAFaire = taches.filter(t => t.statut === 'à faire').length;
      const nbEnCours = taches.filter(t => t.statut === 'en cours').length;
      const nbEnRetard = taches.filter(t => t.statut === 'en retard').length;

      const progression = totalTaches > 0 ? (nbTermine / totalTaches) * 100 : 0;

      return {
        planogram,
        totalTaches,
        nbTermine,
        nbAFaire,
        nbEnCours,
        nbEnRetard,
        progression: Number(progression.toFixed(2)),
        taches: taches.map(t => ({
          id: t.id,
          statut: t.statut,
          type: t.type,
          date_debut: t.date_debut,
          date_fin_prevue: t.date_fin_prevue,
          date_fin_reelle: t.date_fin_reelle,
          priorite: t.priorite,
          idUser: t.idUser
        }))
      };
    });

    return res.status(200).json(result);

  } catch (error) {
    console.error("Erreur lors de la récupération des planogrammes :", error);
    return res.status(500).json({ error: error.message });
  }
};

// Calculer le taux d'implémentation des planogrammes par magasin
export const tauxImplementation = async (req, res) => {
  try {
    const { idMagasin, idUser } = req.params;

    if (!idMagasin || !idUser) {
      return res.status(400).json({ error: "idMagasin ou idUser manquant." });
    }

    // Nombre total de planogrammes actifs pour ce magasin
    const totalPlanograms = await Planogram.count({
      where: {
        magasin_id: idMagasin,
        statut: 'actif'
      }
    });

    // Nombre de planogrammes mis en place (tâches terminées pour l'utilisateur)
    const planogramsImplementesResult = await Tache.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('planogram_id'))), 'count']
      ],
      where: {
        magasin_id: idMagasin,
        idUser: idUser, // filtrage par utilisateur
        type: 'mise_en_place',
        statut: 'terminé'
      },
      raw: true
    });

    const planogramsImplementes = parseInt(planogramsImplementesResult[0]?.count || 0, 10);

    const taux = totalPlanograms > 0 ? (planogramsImplementes / totalPlanograms) * 100 : 0;

    return res.json({
      magasin_id: idMagasin,
      id_user: idUser,
      total_planograms: totalPlanograms,
      planograms_implementes: planogramsImplementes,
      taux_implementation: taux.toFixed(2)
    });

  } catch (error) {
    console.error('Erreur dans tauxImplementation:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const planogramsRecent = async (req, res) => {
  try {
    const { idMagasin, idUser } = req.params;

    if (!idMagasin || !idUser) {
      return res.status(400).json({ error: "idMagasin ou idUser manquant." });
    }

    // Période : début à fin du mois courant
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const recentTaches = await Tache.findAll({
      where: {
        idUser,
        magasin_id: idMagasin,
        type: 'mise_en_place',
        statut:{
          [Op.in]:['à faire','en cours']
        },
        date_debut: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      },
      include: [
        {
          model: Planogram,
          as: 'planogram',
          required: true
        }
      ],
      order: [['date_debut', 'DESC']]
    });

    // Ne retourner que la tâche avec planogram intégré
    const result = recentTaches.map(tache => ({
      ...tache.toJSON() // Convertir Sequelize instance → objet pur
    }));

    return res.status(200).json(result);

  } catch (error) {
    console.error('Erreur dans planogramsRecent:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};


export const getPlanogramDetails = async (req, res) => {
  try {
    const { idMagasin } = req.params;

    if (!idMagasin) {
      return res.status(400).json({ error: "idMagasin manquant." });
    }

    const planograms = await Planogram.findAll({
      where: { magasin_id: idMagasin },
      include: [
        {
          model: Tache,
          as: 'taches'
        },
        {
          model: Furniture,
          as: 'furnitures'
        },
        { model: Zone1, as: 'zone' }
      ]
    });

    return res.status(200).json(planograms);

  } catch (error) {
    console.error('Erreur dans getPlanogramDetails:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const fetchPlanogramByStore = async(req,res) =>{
  try {
    const { idMagasin } = req.params;

    if (!idMagasin) {
      return res.status(400).json({ error: "idMagasin manquant." });
    }
    
    const planograms = await Planogram.findAndCountAll({
      where:{magasin_id : idMagasin}
    })
    return res.status(200).json(planograms);

  } catch (error) {
    console.error('Erreur dans fetchPlanogramByStore:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

export const calculateConversionRate = async (req, res) => {
  try {
    const { idPlanogram, date_debut, date_fin } = req.query;

    if (!idPlanogram) {
      return res.status(400).json({ error: "idPlanogram est obligatoire" });
    }

    // 1. Récupérer les ventes pour les produits du planogramme
    const ventes = await getVenteProduitsPerPlanogram(idPlanogram, date_debut, date_fin);
    const nombreAchats = ventes.length;

    // 2. Calcul sécurisé de la somme totale
    const sommeTotale = ventes.reduce((total, vente) => {
      // Conversion en nombres et valeurs par défaut
      const quantite = Number(vente.quantite) || 0;
      const prix = Number(vente.prix_unitaire) || 0;
      const montantTotal = Number(vente.montant_total) || null;
      
      const montant = montantTotal !== null 
        ? montantTotal 
        : quantite * prix;
      
      // Vérification finale pour éviter NaN
      return total + (Number.isFinite(montant) ? montant : 0);
    }, 0);

    // 3. Formatage numérique sécurisé
    const formatMontant = (val) => {
      const num = Number(val);
      return Number.isFinite(num) ? num.toFixed(2) : "0.00";
    };

    // 4. Récupérer les produits du planogramme pour trouver leur zone
    const produits = await getProductsPerPlanogram(idPlanogram);
    
    if (produits.length === 0) {
      return res.status(404).json({ error: "Aucun produit trouvé pour ce planogramme" });
    }

    // Supposons que tous les produits du planogramme sont dans la même zone
    const idZone = produits[0].zone_id;
    const myPlanogram = await Planogram.findOne({
      where: { planogram_id: idPlanogram }
    });
    
    if (!myPlanogram) {
      throw new Error(`Planogram with id ${idPlanogram} not found`);
    }
    
    const zone = await Zone1.findOne({
      where: { zone_id: myPlanogram.zone_id },
      attributes: ['nom_zone'],
      raw: true
    });
    
    const zoneName = zone ? zone.nom_zone : null;
    const zoneId = myPlanogram.zone_id;

    // 5. Récupérer le nombre total de visites de la zone
    const nombreVisites = await getVisiteursParZone(zoneId, date_debut, date_fin);

    // 6. Calculer le taux de conversion
    const tauxConversion = nombreVisites > 0 
      ? (nombreAchats / nombreVisites) * 100 
      : 0;

    // 7. Retourner le résultat complet
    res.json({
      idPlanogram,
      zoneName,
      date_debut,
      date_fin,
      nombreAchats,
      nombreVisites,
      tauxConversion: tauxConversion.toFixed(2) + '%',
      sommeTotale: formatMontant(sommeTotale),
      details:  `Calcul: ${nombreAchats} achats / ${nombreVisites} visites = ${tauxConversion.toFixed(2)}%`,
        
    });

  } catch (error) {
    console.error("Erreur dans calculateConversionRate:", error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
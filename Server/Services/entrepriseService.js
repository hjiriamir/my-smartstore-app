import Entreprises from "../Model/Entreprises.js";
import EtatAbonnement from "../Model/EtatAbonnement.js";
import Users from "../Model/Users.js";
import DemandeAbonnement from "../Model/demandeAbonnement.js";
import { Op, Sequelize } from 'sequelize';

export const getTotalEntreprises = async () => {
  try {
    const total = await Entreprises.count();
    return total || 0;
  } catch (error) {
    console.error("Erreur dans getTotalEntreprises:", error);
    return 0;
  }
};

  
export const getTotalEntreprisesActives = async () => {
  try {
    const entreprisesActives = await Entreprises.findAll({
      include: [{
        model: EtatAbonnement,
        as: 'etatAbonnements',
        where: { statut: 'actif' },
        attributes: []
      }],
      attributes: ['id'],
      distinct: true,
    });

    const entreprisesIds = entreprisesActives?.map(e => e.id) || [];
    const total = entreprisesIds.length;

    return { total, entreprisesIds };

  } catch (error) {
    console.error("Erreur dans getTotalEntreprisesActives:", error);
    return { total: 0, entreprisesIds: [] };
  }
};

  
export const getTotalUtilisateurs = async () => {
  try {
    const total = await Users.count();
    return total || 0;
  } catch (error) {
    console.error("Erreur dans getTotalUtilisateurs:", error);
    return 0;
  }
};

  
  export const getChiffreAffaire = async () => {
    try {
      const abonnementsActifs = await EtatAbonnement.findAll({
        where: {
          type_forfait: ['basic', 'advanced', 'gold']
        }
      });
  
      if (!abonnementsActifs || abonnementsActifs.length === 0) {
        return 0;
      }
  
      const tarifs = {
        basic: 2400,
        advanced: 6000,
        gold: 8400
      };
  
      let chiffreAffaire = 0;
      for (const abonnement of abonnementsActifs) {
        const tarif = tarifs[abonnement.type_forfait];
        if (tarif) {
          chiffreAffaire += tarif;
        }
      }
  
      return chiffreAffaire;
  
    } catch (error) {
      console.error("Erreur dans getChiffreAffaire:", error);
      return 0;
    }
  };
  
  
  export const getUtilisateurAdmin = async (idEntreprise) => {
    try {
        if(!idEntreprise){
            throw new Error("Le paramètre idEntreprise est obligatoire");
        }
        const admin = await Users.findOne({
            where: {
              entreprises_id: idEntreprise,
              role: 'admin'
            }
          });          
      return admin; 
    } catch (error) {
      console.error("Erreur dans getUtilisateurAdmin:", error);
      throw error;
    }
  }

  export const getAllEntreprisese = async () => {
    try {
      const entreprises = await Entreprises.findAll({
        include: [
          {
            model: Users,
            as: 'utilisateurs',
            attributes: ['id', 'name', 'email', 'role'],
            required: false
          },
          {
            model: EtatAbonnement,
            as: 'etatAbonnements',
            attributes: ['type_forfait', 'statut'],
            required: false
          }
        ]
      });
  
      if (!entreprises || entreprises.length === 0) {
        return [];
      }
  
      const entreprisesAvecInfos = entreprises.map(entreprise => {
        const data = entreprise.toJSON();
  
        const totalUtilisateurs = data.utilisateurs?.length || 0;
        const admin = data.utilisateurs?.find(u => u.role === 'admin') || null;
        const abonnement = data.etatAbonnements?.[0] || null;
  
        return {
          ...data,
          admin,
          totalUtilisateurs,
          type_forfait: abonnement?.type_forfait || null,
          statut_abonnement: abonnement?.statut || null
        };
      });
  
      return entreprisesAvecInfos;
  
    } catch (error) {
      console.error("Erreur dans getAllEntreprises:", error);
      return [];
    }
  };
  
  
  
  
  export const mettreStatutInactif = async (idEntreprise) => {
    try {
      const etat = await EtatAbonnement.findOne({
        where: {
          entreprise_id: idEntreprise,
          statut: {
            [Op.in]: ['actif', 'suspendu']
          }
        }
      });
  
      if (!etat) {
        throw new Error("Aucun abonnement actif trouvé pour cette entreprise.");
      }
  
      etat.statut = "inactif";
      await etat.save();
    } catch (error) {
      console.error("Erreur dans mettreStatutInactif:", error);
      throw error;
    }
  };
  
  export const mettreStatutSuspendu = async (idEntreprise) => {
    try {
      const etat = await EtatAbonnement.findOne({
        where: {
          entreprise_id: idEntreprise,
          statut: {
            [Op.in]: ['actif', 'inactif']
          }
        }
      });
  
      if (!etat) {
        throw new Error("Aucun abonnement actif trouvé pour cette entreprise.");
      }
  
      etat.statut = "suspendu";
      await etat.save();
    } catch (error) {
      console.error("Erreur dans mettreStatutSuspendu:", error);
      throw error;
    }
  };

  export const mettreStatutActif = async (idEntreprise, forfait) => {
    try {
      const etat = await EtatAbonnement.findOne({
        where: {
          entreprise_id: idEntreprise,
          type_forfait: forfait
        }
      });
  
      if (!etat) {
        throw new Error("Aucun abonnement trouvé pour cette entreprise.");
      }
      if (etat.statut == "actif") {
        throw new Error("l'abonnement est déjà actif");
      }

      etat.statut = "actif";
      await etat.save();
    } catch (error) {
      console.error("Erreur dans mettreStatutActif:", error);
      throw error;
    }
  };
  
  
  

  export const getTotalEntrepriseAvecPourcentage = async () => {
    try {
      const nbreEntreprises = await Entreprises.count();
  
      const now = new Date();
  
      const startCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  
      const startPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const startCurrentMonthCopy = new Date(now.getFullYear(), now.getMonth(), 1);
  
      const nbreCurrentMonth = await Entreprises.count({
        where: {
          date_creation: {
            [Op.gte]: startCurrentMonth,
            [Op.lt]: startNextMonth
          }
        }
      });
  
      const nbrePreviousMonth = await Entreprises.count({
        where: {
          date_creation: {
            [Op.gte]: startPreviousMonth,
            [Op.lt]: startCurrentMonthCopy
          }
        }
      });
  
      let pourcentage = null;
      if (nbrePreviousMonth === 0 && nbreCurrentMonth > 0) {
        pourcentage = 100;
      } else if (nbrePreviousMonth === 0 && nbreCurrentMonth === 0) {
        pourcentage = 0;
      } else {
        pourcentage = ((nbreCurrentMonth - nbrePreviousMonth) / nbrePreviousMonth) * 100;
      }
  
      return {
        totalEntreprises: nbreEntreprises,
        entreprisesMoisPrecedent: nbrePreviousMonth,
        entreprisesMoisActuel: nbreCurrentMonth,
        pourcentageVariation: pourcentage,
      };
  
    } catch (error) {
      console.error("Erreur dans getTotalEntrepriseAvecPourcentage:", error);
      throw error;
    }
  };
  export const getTotalUtilisateursAvecPourcentage = async () => {
    try {
      const nbreUtilisateurs = await Users.count();
  
      const now = new Date();
  
      const startCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  
      const startPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const startCurrentMonthCopy = new Date(now.getFullYear(), now.getMonth(), 1);
  
      const nbreCurrentMonth = await Users.count({
        where: {
          created_at: {
            [Op.gte]: startCurrentMonth,
            [Op.lt]: startNextMonth
          }
        }
      });
  
      const nbrePreviousMonth = await Users.count({
        where: {
          created_at: {
            [Op.gte]: startPreviousMonth,
            [Op.lt]: startCurrentMonthCopy
          }
        }
      });
  
      let pourcentage = null;
      if (nbrePreviousMonth === 0 && nbreCurrentMonth > 0) {
        pourcentage = 100;
      } else if (nbrePreviousMonth === 0 && nbreCurrentMonth === 0) {
        pourcentage = 0;
      } else {
        pourcentage = ((nbreCurrentMonth - nbrePreviousMonth) / nbrePreviousMonth) * 100;
      }
  
      return {
        totalUtilisateurs: nbreUtilisateurs,
        utilisateursMoisPrecedent: nbrePreviousMonth,
        utilisateursMoisActuel: nbreCurrentMonth,
        pourcentageVariation: pourcentage,
      };
  
    } catch (error) {
      console.error("Erreur dans getTotalEntrepriseAvecPourcentage:", error);
      throw error;
    }
  };
  export const getChiffreAffaireAvecPourcentage = async () => {
    try {
      const now = new Date();
  
      const startCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  
      const startPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const startCurrentMonthCopy = new Date(now.getFullYear(), now.getMonth(), 1);
  
      // Tarifs
      const tarifs = {
        basic: 2400,
        advanced: 6000,
        gold: 8400
      };
  
      // === 1. Chiffre d'affaires global ===
      const abonnementsGlobaux = await EtatAbonnement.findAll({
        where: {
          type_forfait: ['basic', 'advanced', 'gold']
        }
      });
  
      let chiffreGlobal = 0;
      for (const ab of abonnementsGlobaux) {
        const tarif = tarifs[ab.type_forfait];
        if (tarif) chiffreGlobal += tarif;
      }
  
      // === 2. Mois actuel ===
      const abonnementsActuels = abonnementsGlobaux.filter(ab => {
        const date = new Date(ab.createdAt);
        return date >= startCurrentMonth && date < startNextMonth;
      });
  
      let chiffreActuel = 0;
      for (const ab of abonnementsActuels) {
        const tarif = tarifs[ab.type_forfait];
        if (tarif) chiffreActuel += tarif;
      }
  
      // === 3. Mois précédent ===
      const abonnementsPrecedents = abonnementsGlobaux.filter(ab => {
        const date = new Date(ab.createdAt);
        return date >= startPreviousMonth && date < startCurrentMonthCopy;
      });
  
      let chiffrePrecedent = 0;
      for (const ab of abonnementsPrecedents) {
        const tarif = tarifs[ab.type_forfait];
        if (tarif) chiffrePrecedent += tarif;
      }
  
      // === 4. Pourcentage de variation ===
      let pourcentage = null;
      if (chiffrePrecedent === 0 && chiffreActuel > 0) {
        pourcentage = 100;
      } else if (chiffrePrecedent === 0 && chiffreActuel === 0) {
        pourcentage = 0;
      } else {
        pourcentage = ((chiffreActuel - chiffrePrecedent) / chiffrePrecedent) * 100;
      }
  
      return {
        chiffreAffaireGlobal: chiffreGlobal,
        chiffreAffaireMoisActuel: chiffreActuel,
        chiffreAffaireMoisPrecedent: chiffrePrecedent,
        pourcentageVariation: pourcentage
      };
  
    } catch (error) {
      console.error("Erreur dans getChiffreAffaireAvecPourcentage:", error);
      throw error;
    }
  };

  export const getRepartitionAbonnementsParType = async () => {
    try {
      // 1. Récupérer tous les abonnements
      const abonnements = await EtatAbonnement.findAll();
  
      // 2. Initialiser les compteurs
      const repartition = {
        gold: 0,
        advanced: 0,
        basic: 0
      };
  
      // 3. Compter les types de forfait
      for (const ab of abonnements) {
        const type = ab.type_forfait?.toLowerCase(); 
        if (repartition.hasOwnProperty(type)) {
          repartition[type]++;
        }
      }
  
      const total = repartition.gold + repartition.advanced + repartition.basic;
  
      // 4. Calculer les pourcentages
      const resultat = {
        total,
        repartition: {
          gold: {
            count: repartition.gold,
            pourcentage: total ? ((repartition.gold / total) * 100).toFixed(2) : 0
          },
          advanced: {
            count: repartition.advanced,
            pourcentage: total ? ((repartition.advanced / total) * 100).toFixed(2) : 0
          },
          basic: {
            count: repartition.basic,
            pourcentage: total ? ((repartition.basic / total) * 100).toFixed(2) : 0
          }
        }
      };
  
      return resultat;
  
    } catch (error) {
      console.error("Erreur dans getRepartitionAbonnementsParType:", error);
      throw error;
    }
  };

  
  export const getEvolutionCA = async () => {
    try {
      const now = new Date();
      const tarifs = {
        basic: 2400,
        advanced: 6000,
        gold: 8400
      };
  
      const result = [];
  
      // Parcourir les 6 derniers mois
      for (let i = 5; i >= 0; i--) {
        const dateStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const dateEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
  
        const abonnements = await EtatAbonnement.findAll({
          where: {
            type_forfait: ['basic', 'advanced', 'gold'],
            date_acceptation: {
              [Op.gte]: dateStart,
              [Op.lt]: dateEnd
            }
          }
        });
  
        // Calcul du chiffre d'affaires pour ce mois
        let chiffreAffaire = 0;
        for (const abonnement of abonnements) {
          const tarif = tarifs[abonnement.type_forfait];
          if (tarif) {
            chiffreAffaire += tarif;
          }
        }
  
        // Format mois/année
        const mois = dateStart.toLocaleString('default', { month: 'short' });
        const annee = dateStart.getFullYear();
  
        result.push({
          mois: `${mois} ${annee}`,
          chiffreAffaire
        });
      }
  
      return result;
  
    } catch (error) {
      console.error("Erreur dans getEvolutionCA:", error);
      throw error;
    }
  }

  export const getEvolutionUsersEntreprises = async () => {
    try {
      const now = new Date();
      const results = [];
  
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
  
        const entreprisesCount = await Entreprises.count({
          where: {
            date_creation: {
              [Op.gte]: start,
              [Op.lt]: end,
            },
          },
        });
  
        const utilisateursCount = await Users.count({
          where: {
            created_at: {
              [Op.gte]: start,
              [Op.lt]: end,
            },
          },
        });
  
        results.push({
          mois: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
          entreprises: entreprisesCount,
          utilisateurs: utilisateursCount,
        });
      }
  
      return results;
    } catch (error) {
      console.error('Erreur dans getEvolutionUsersEntreprises:', error);
      throw error;
    }
  };


  export const getTopEntreprises = async () => {
    try {
      const abonnements = await EtatAbonnement.findAll({
        where: {
          type_forfait: ['basic', 'advanced', 'gold']
        },
        include: [
          {
            model: Entreprises,
            as: 'entreprise',
            include: [
              {
                model: Users,
                as: 'utilisateurs',
                attributes: [] // on ne veut pas ramener toutes les infos des users, juste le count
              }
            ],
            attributes: {
              include: [
                
                [Sequelize.fn('COUNT', Sequelize.col('entreprise.utilisateurs.id')), 'nombre_utilisateurs']
              ]
            },
            group: ['entreprise.id']
          }
        ],
        group: ['EtatAbonnement.id', 'entreprise.id'] // pour le group by des jointures
      });
  
      const tarifs = {
        basic: 2400,
        advanced: 6000,
        gold: 8400
      };
  
      const caParEntreprise = {};
  
      for (const ab of abonnements) {
        const entreprise = ab.entreprise;
        if (!entreprise) continue;
  
        const tarif = tarifs[ab.type_forfait];
        if (!tarif) continue;
  
        const entId = entreprise.id;
  
        if (!caParEntreprise[entId]) {
          caParEntreprise[entId] = {
            entreprise,
            chiffre_affaire: 0,
            nombre_utilisateurs: parseInt(entreprise.dataValues.nombre_utilisateurs) || 0
          };
        }
  
        caParEntreprise[entId].chiffre_affaire += tarif;
      }
  
      const topEntreprises = Object.values(caParEntreprise).sort(
        (a, b) => b.chiffre_affaire - a.chiffre_affaire
      );
  
      return topEntreprises;
    } catch (error) {
      console.error('Erreur dans getTopEntreprises:', error);
      throw error;
    }
  };
  
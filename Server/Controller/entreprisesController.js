// controllers/entreprisesController.js
import Entreprises from '../Model/Entreprises.js';
import {
  getTotalEntreprises,
  getTotalEntreprisesActives,
  getTotalUtilisateurs,
  getChiffreAffaire,
  getAllEntreprisese,
  mettreStatutInactif,
  mettreStatutSuspendu,
  mettreStatutActif,
  getTotalEntrepriseAvecPourcentage,
  getTotalUtilisateursAvecPourcentage,
  getChiffreAffaireAvecPourcentage,
  getRepartitionAbonnementsParType,
  getEvolutionCA,
  getEvolutionUsersEntreprises,
  getTopEntreprises
} from '../Services/entrepriseService.js'; 


// Créer une entreprise
export const createEntreprise = async (req, res) => {
  try {
    const entreprise = await Entreprises.create(req.body);
    res.status(201).json(entreprise);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Récupérer toutes les entreprises
export const getAllEntreprises = async (req, res) => {
  try {
    const entreprises = await Entreprises.findAndCountAll();
    res.json(entreprises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer une entreprise par ID
export const getEntrepriseById = async (req, res) => {
  try {
    const entreprise = await Entreprises.findByPk(req.params.id);
    if (entreprise) {
      res.json(entreprise);
    } else {
      res.status(404).json({ message: 'Entreprise non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour une entreprise
export const updateEntreprise = async (req, res) => {
  try {
    const entreprise = await Entreprises.findByPk(req.params.id);
    if (entreprise) {
      await entreprise.update(req.body);
      res.json(entreprise);
    } else {
      res.status(404).json({ message: 'Entreprise non trouvée' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Supprimer une entreprise
export const deleteEntreprise = async (req, res) => {
  try {
    const entreprise = await Entreprises.findByPk(req.params.id);
    if (entreprise) {
      await entreprise.destroy();
      res.json({ message: 'Entreprise supprimée' });
    } else {
      res.status(404).json({ message: 'Entreprise non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalEntreprises,
      { total: totalEntreprisesActives },
      totalUtilisateurs,
      chiffreAffaire
    ] = await Promise.all([
      getTotalEntreprises(),
      getTotalEntreprisesActives(),
      getTotalUtilisateurs(),
      getChiffreAffaire()
    ]);

    return res.status(200).json({
      totalEntreprises,
      totalEntreprisesActives,
      totalUtilisateurs,
      chiffreAffaire
    });

  } catch (error) {
    console.error('Erreur dans getDashboardStats:', error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const getEntreprisesAvecInfos = async (req, res) => {
  try {
    const entreprises = await getAllEntreprisese();
    return res.status(200).json(entreprises);
  } catch (error) {
    console.error("Erreur dans getEntreprisesAvecInfos:", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const mettreEntrepriseInactif = async (req, res) => {
  try {
    const { idEntreprise } = req.params;

    if (!idEntreprise) {
      return res.status(400).json({ message: "idEntreprise est requis." });
    }

    await mettreStatutInactif(idEntreprise);

    res.status(200).json({ message: "Statut de l'entreprise mis à inactif avec succès." });
  } catch (error) {
    console.error("Erreur dans mettreEntrepriseInactif:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const mettreEntrepriseSuspendu = async (req, res) => {
  try {
    const { idEntreprise } = req.params;

    if (!idEntreprise) {
      return res.status(400).json({ message: "idEntreprise est requis." });
    }

    await mettreStatutSuspendu(idEntreprise);

    res.status(200).json({ message: "Statut de l'entreprise mis à suspendu avec succès." });
  } catch (error) {
    console.error("Erreur dans mettreEntrepriseSuspendu:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const activerAbonnementEntreprise = async (req, res) => {
  const { idEntreprise, forfait } = req.body;

  if (!idEntreprise || !forfait) {
    return res.status(400).json({ message: "idEntreprise et forfait sont requis." });
  }

  try {
    await mettreStatutActif(idEntreprise, forfait);
    res.status(200).json({ message: "Abonnement activé avec succès." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getDashboarEntreprisedStats = async (req, res) => {
  try {
    const [
      entreprisesStats,
      utilisateursStats,
      chiffreAffaireStats
    ] = await Promise.all([
      getTotalEntrepriseAvecPourcentage(),
      getTotalUtilisateursAvecPourcentage(),
      getChiffreAffaireAvecPourcentage()
    ]);

    return res.status(200).json({
      entreprises: entreprisesStats,
      utilisateurs: utilisateursStats,
      chiffreAffaire: chiffreAffaireStats
    });

  } catch (error) {
    console.error('Erreur dans getDashboardStats:', error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

export const getAbonnementRepartition = async (req, res) => {
  try {
    const data = await getRepartitionAbonnementsParType();
    res.status(200).json(data);
  } catch (error) {
    console.error("Erreur dans getAbonnementRepartition:", error);
    res.status(500).json({ message: "Erreur lors de la récupération de la répartition des abonnements" });
  }
};

export const getEvolutionChiffreAffaire = async (req, res) => {
  try {
    const evolution = await getEvolutionCA();
    return res.status(200).json(evolution);
  } catch (error) {
    console.error("Erreur dans le contrôleur getEvolutionChiffreAffaire:", error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

export const getEvolutionUsresEntreprises= async (req, res) => {
  try {
    const evolution = await getEvolutionUsersEntreprises();
    return res.status(200).json(evolution);
  } catch (error) {
    console.error("Erreur dans le contrôleur getEvolutionUsresEntreprises:", error);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

export const getTopEntreprisesController = async (req, res) => {
  try {
    const topEntreprises = await getTopEntreprises();
    res.status(200).json(topEntreprises);
  } catch (error) {
    console.error("Erreur dans getTopEntreprisesController:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des entreprises." });
  }
};
import Client from '../Model/Client.js';
import GamificationChallenge from '../Model/GamificationChallenge.js';
import GamificationParticipation from '../Model/GamificationParticipation.js';
import Leaderboard from '../Model/Leaderboard.js';
import { Sequelize, Op } from "sequelize";
import magasin1 from '../Model/magasin1.js';
import { getClientsTotalByEntreprise, getClientsParticipantsByEntreprise } from "../Services/clientService.js";
// --- CRUD Challenges --- //

export const createChallenge = async (req, res) => {
  try {
    const challenge = await GamificationChallenge.create(req.body);
    res.status(201).json(challenge);
  } catch (error) {
    console.error('Erreur createChallenge:', error);
    res.status(500).json({ error: 'Erreur lors de la création du challenge' });
  }
};

export const getChallenges = async (req, res) => {
  try {
    const challenges = await GamificationChallenge.findAll();
    res.status(200).json(challenges);
  } catch (error) {
    console.error('Erreur getChallenges:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des challenges' });
  }
};

export const getChallengeById = async (req, res) => {
  try {
    const challenge = await GamificationChallenge.findByPk(req.params.id);
    if (!challenge) return res.status(404).json({ error: 'Challenge introuvable' });
    res.status(200).json(challenge);
  } catch (error) {
    console.error('Erreur getChallengeById:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du challenge' });
  }
};

export const updateChallenge = async (req, res) => {
  try {
    const challenge = await GamificationChallenge.findByPk(req.params.id);
    if (!challenge) return res.status(404).json({ error: 'Challenge introuvable' });

    await challenge.update(req.body);
    res.status(200).json(challenge);
  } catch (error) {
    console.error('Erreur updateChallenge:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du challenge' });
  }
};

export const deleteChallenge = async (req, res) => {
  try {
    const challenge = await GamificationChallenge.findByPk(req.params.id);
    if (!challenge) return res.status(404).json({ error: 'Challenge introuvable' });

    await challenge.destroy();
    res.status(200).json({ message: 'Challenge supprimé avec succès' });
  } catch (error) {
    console.error('Erreur deleteChallenge:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du challenge' });
  }
};

// --- Participations --- //

export const addParticipation = async (req, res) => {
  try {
    const { challenge_id, utilisateur_id } = req.body;

    const participation = await GamificationParticipation.create({
      challenge_id,
      utilisateur_id,
      progression: 0,
    });

    res.status(201).json(participation);
  } catch (error) {
    console.error('Erreur addParticipation:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la participation' });
  }
};

export const updateProgress = async (req, res) => {
  try {
    const { id } = req.params; // id de participation
    const { progression, points_gagnes } = req.body;

    const participation = await GamificationParticipation.findByPk(id);
    if (!participation) return res.status(404).json({ error: 'Participation introuvable' });

    await participation.update({ progression, points_gagnes });
    res.status(200).json(participation);
  } catch (error) {
    console.error('Erreur updateProgress:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la participation' });
  }
};

export const getParticipations = async (req, res) => {
  try {
    const participations = await GamificationParticipation.findAll();
    res.status(200).json(participations);
  } catch (error) {
    console.error('Erreur getParticipations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des participations' });
  }
};


export const getChallengeByStore = async(req,res) => {
    try {
        const { idMagasin } = req.params;
        if (!idMagasin) {
            return res.status(400).json({ error: "Le paramètre idMagasin est obligatoire" });
          }
          const challenges = await GamificationChallenge.findAll({
            where: {magasin_id: idMagasin}
          })    
          res.status(200).json(challenges);
    } catch (error) {
        console.error('Erreur getChallengeByStore:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des participations' });
    }
}

export const addMultipleParticipations = async (req, res) => {
  try {
    const { challenge_id, clients } = req.body;

    // Validation de base
    if (!challenge_id || !Array.isArray(clients) || clients.length === 0) {
      return res.status(400).json({
        error: "Vous devez fournir un challenge_id et une liste de clients.",
      });
    }

    // Préparer les données à insérer
    const participationsData = clients.map((client_id) => ({
      challenge_id,
      client_id,
      progression: "0%", // valeur par défaut (modifiable)
      points_gagnes: 0,
    }));

    // Insertion en masse
    const participations = await GamificationParticipation.bulkCreate(
      participationsData
    );

    res.status(201).json({
      message: "Participations ajoutées avec succès",
      participations,
    });
  } catch (error) {
    console.error("Erreur addMultipleParticipations:", error);
    res.status(500).json({
      error: "Erreur lors de l'ajout des participations",
    });
  }
};

export const getClientOrderer = async (req, res) => {
  try {
    const { idEntreprise } = req.params;

    if (!idEntreprise) {
      return res.status(400).json({ error: "Le paramètre idEntreprise est obligatoire" });
    }

    // Récupérer les clients de l'entreprise
    const allClients = await Client.findAll({
      where: { entreprise_id: idEntreprise },
      attributes: ["id"] // On ne récupère que l'ID ici
    });

    const clientIds = allClients.map(c => c.id);

    // Récupérer les classements avec les infos clients
    const joueursClassee = await Leaderboard.findAll({
      where: {
        client_id: {
          [Op.in]: clientIds
        }
      },
      include: [
        {
          model: Client, // Assure-toi que l'association est bien définie
          as: 'client',
          attributes: ["id", "code_client", "nom", "prenom", "email"] // Les champs du client que tu veux inclure
        }
      ],
      order: [["points_total", "DESC"]]
    });

    res.status(200).json(joueursClassee);
  } catch (error) {
    console.error("Erreur getClientOrderer:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des joueurs",
    });
  }
};

export const getJoueursChallenge = async (req, res) => {
  try {
    const { idChallenge } = req.params;

    if (!idChallenge) {
      return res.status(400).json({
        error: "Le paramètre idChallenge est obligatoire",
      });
    }

    // Récupération des participations avec le client associé
    const participants = await GamificationParticipation.findAll({
      where: { challenge_id: idChallenge },
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["id", "nom", "prenom", "email"],
        },
      ],
      // Tri par progression 
      order: [
        [
          // progression est un nombre stocké en STRING
          Sequelize.cast(Sequelize.col("progression"), "FLOAT"),
          "DESC",
        ],
      ],
    });

    res.json(participants);
  } catch (error) {
    console.error("Erreur getJoueursChallenge:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des joueurs",
    });
  }
};


export const getPointsTotaux = async (req, res) => {
  try {
    const { idEntreprise } = req.params;

    if (!idEntreprise) {
      return res.status(400).json({
        error: "Le paramètre idEntreprise est obligatoire",
      });
    }

    // 1. Récupérer les clients de l'entreprise
    const clients = await Client.findAll({
      where: { entreprise_id: idEntreprise },
      attributes: ['id'],
    });

    const clientsIds = clients.map((c) => c.id);

    if (clientsIds.length === 0) {
      return res.status(200).json({
        totalPoints: 0,
        details: [],
      });
    }

    // 2. Récupérer les lignes du leaderboard
    const leaderboardEntries = await Leaderboard.findAll({
      where: {
        client_id: { [Op.in]: clientsIds },
      },
      attributes: ['client_id', 'points_total'],
    });

    // 3. Calculer la somme
    const totalPoints = leaderboardEntries.reduce(
      (sum, entry) => sum + (entry.points_total || 0),
      0
    );

    // 4. Retourner la somme et le détail
    return res.status(200).json({
      totalPoints,
      details: leaderboardEntries,
    });
  } catch (error) {
    console.error('Erreur getPointsTotaux:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des points totaux',
    });
  }
};

export const getChallengeActifs = async (req, res) => {
  try {
    const { idEntreprise } = req.params;

    if (!idEntreprise) {
      return res.status(400).json({
        error: "Le paramètre idEntreprise est obligatoire",
      });
    }

    // 1. Récupérer les magasins de l'entreprise
    const magasins = await magasin1.findAll({
      where: { entreprise_id: idEntreprise },
      attributes: ['id'],
    });

    const magasinsIds = magasins.map((m) => m.id);

    if (magasinsIds.length === 0) {
      return res.status(200).json({
        totalChallenges: 0,
        details: [],
      });
    }

    // 2. Définir la date actuelle
    const now = new Date();

    // 3. Récupérer les challenges actifs
    const challengesActifs = await GamificationChallenge.findAll({
      where: {
        magasin_id: { [Op.in]: magasinsIds },
        date_debut: { [Op.lt]: now },
        date_fin: { [Op.gt]: now },
      },
    });

    // 4. Retourner le nombre total et la liste des challenges
    return res.status(200).json({
      totalChallenges: challengesActifs.length,
      details: challengesActifs,
    });
  } catch (error) {
    console.error('Erreur getChallengeActifs:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des challenges',
    });
  }
};

export const getTauxParticipationClients = async (req, res) => {
  try {
    const { idEntreprise } = req.params;

    if (!idEntreprise) {
      return res.status(400).json({
        error: "Le paramètre idEntreprise est obligatoire",
      });
    }

    // 1. Total clients
    const totalClients = await getClientsTotalByEntreprise(idEntreprise);
    const totalClientsCount = totalClients.length;

    // 2. Total participants
    const participantsData = await getClientsParticipantsByEntreprise(idEntreprise);
    const totalParticipantsCount = participantsData.totalParticipants;

    // 3. Calcul du taux (éviter division par 0)
    const taux =
      totalClientsCount === 0
        ? 0
        : (totalParticipantsCount / totalClientsCount) * 100;

    // 4. Retourner la réponse
    return res.status(200).json({
      totalClients: totalClientsCount,
      totalParticipants: totalParticipantsCount,
      tauxParticipation: taux.toFixed(2), // 2 décimales
    });
  } catch (error) {
    console.error("Erreur getTauxParticipationClients:", error);
    res.status(500).json({
      error: "Erreur lors du calcul du taux de participation",
    });
  }
};
import GamificationChallenge from "../Model/GamificationChallenge.js";
import GamificationParticipation from "../Model/GamificationParticipation.js";
import { Op, fn, col } from "sequelize";
import Leaderboard from "../Model/Leaderboard.js";


export const getTotalPointsClient = async (idClient) => {
    try {
      if (!idClient) {
        throw new Error("Le paramètre idClient est obligatoire");
      }
  
      // Calculer la somme des points_gagnes pour ce client
      const result = await GamificationParticipation.findOne({
        attributes: [
          "client_id",
          [
            GamificationParticipation.sequelize.fn(
              "SUM",
              GamificationParticipation.sequelize.col("points_gagnes")
            ),
            "total_points",
          ],
        ],
        where: { client_id: idClient },
        group: ["client_id"],
        raw: true,
      });
  
      // Si le client n'a pas de participation, retourner total_points = 0
      if (!result) {
        return { client_id: idClient, total_points: 0 };
      }
  
      return {
        client_id: result.client_id,
        total_points: parseInt(result.total_points, 10),
      };
    } catch (error) {
      console.error("Erreur dans getTotalPointsChallenge:", error);
      throw error;
    }
  };


export const updateLeaderBoardPointsTotal = async () => {
    try {
      // Récupérer tous les clients du leaderboard
      const clientsLeaderBoard = await Leaderboard.findAll();
  
      // Parcourir chaque client et mettre à jour ses points_total
      for (const client of clientsLeaderBoard) {
        const { client_id } = client;
  
        // Calculer la somme des points gagnés pour ce client
        const { total_points } = await getTotalPointsClient(client_id);
  
        // Mettre à jour le leaderboard
        await client.update({ points_total: total_points });
      }
  
      return {
        message: "Mise à jour des points_total terminée pour tous les clients",
        updatedCount: clientsLeaderBoard.length,
      };
    } catch (error) {
      console.error("Erreur dans updateLeaderBoardPointsTotal:", error);
      throw error;
    }
};

export const updateLeaderBoardPointsDisponible = async () => {
    try {
      const clientsLeaderBoard = await Leaderboard.findAll();
  
      for (const client of clientsLeaderBoard) {
        const { client_id, points_total: ancien_total_gagnes, points_disponibles: old_points_disponibles } = client;
  
        // Recalculer le total de points gagnés depuis GamificationParticipation
        const { total_points: nouveau_total_gagnes } = await getTotalPointsClient(client_id);
  
        // Calculer la différence
        const difference = nouveau_total_gagnes - ancien_total_gagnes;
  
        // Calculer la nouvelle valeur de points_disponibles
        const new_points_disponibles = old_points_disponibles + difference;
  
        // Mettre à jour uniquement points_disponibles
        await client.update({
          points_disponibles: new_points_disponibles,
        });
      }
  
      return {
        message: "Mise à jour de points_disponibles terminée",
        updatedCount: clientsLeaderBoard.length,
      };
    } catch (error) {
      console.error("Erreur dans updateLeaderBoardPointsDisponible:", error);
      throw error;
    }
  };


  export const syncLeaderboardAfterProgress = async () => {
    try {
      const clientsLeaderBoard = await Leaderboard.findAll();
  
      for (const client of clientsLeaderBoard) {
        const {
          client_id,
          points_total: ancien_total_gagnes,
          points_disponible,
        } = client;
  
        const { total_points: nouveau_total_gagnes } =
          await getTotalPointsClient(client_id);
  
        const difference = nouveau_total_gagnes - ancien_total_gagnes;
  
        console.log(
          `Client ${client_id} | Ancien total=${ancien_total_gagnes} | Nouveau total=${nouveau_total_gagnes} | Diff=${difference}`
        );
  
        if (difference !== 0) {
          await client.update({
            points_total: nouveau_total_gagnes,
            points_disponible: points_disponible + difference,
          });
  
          console.log(
            `Mise à jour leaderboard pour client ${client_id} : points_total=${nouveau_total_gagnes}, points_disponible=${points_disponible + difference}`
          );
        }
      }
  
      return {
        message: "Leaderboard synchronisé avec succès",
        updatedCount: clientsLeaderBoard.length,
      };
    } catch (error) {
      console.error("Erreur dans syncLeaderboardAfterProgress:", error);
      throw error;
    }
  };
  


export const updateLeaderboardRanks = async () => {
  try {
    // Récupérer les entrées triées par points_total décroissant
    const leaderboardEntries = await Leaderboard.findAll({
      order: [['points_total', 'DESC']],
    });

    let rank = 1;
    for (const entry of leaderboardEntries) {
      await entry.update({ rang: rank });
      rank++;
    }

    console.log("Rangs mis à jour avec succès.");
    return { message: "Rangs mis à jour avec succès" };
  } catch (error) {
    console.error("Erreur lors de la mise à jour des rangs :", error);
    throw error;
  }
};

export const deduirePointsDisponibles = async (idClient, pointsUtilises) => {
  try {
    if (!idClient || !pointsUtilises || pointsUtilises <= 0) {
      throw new Error("Les paramètres idClient et pointsUtilises sont obligatoires et valides.");
    }

    // Récupérer le client dans la table Leaderboard
    const leaderboardEntry = await Leaderboard.findOne({
      where: { client_id: idClient },
    });

    if (!leaderboardEntry) {
      throw new Error(`Aucune entrée Leaderboard trouvée pour le client ${idClient}`);
    }

    // Vérifier si le client a assez de points disponibles
    if (leaderboardEntry.points_disponibles < pointsUtilises) {
      throw new Error(`Le client ${idClient} n'a pas assez de points disponibles.`);
    }

    // Déduire les points
    const newPointsDisponibles = leaderboardEntry.points_disponibles - pointsUtilises;

    // Mise à jour en base
    await leaderboardEntry.update({
      points_disponibles: newPointsDisponibles,
    });

    return {
      client_id: idClient,
      old_points_disponibles: leaderboardEntry.points_disponibles,
      new_points_disponibles: newPointsDisponibles,
      points_utilises: pointsUtilises,
    };
  } catch (error) {
    console.error("Erreur dans deduirePointsDisponibles:", error);
    throw error;
  }
};

export const traiterPointsFidelite = async (
  idClient,
  montantTotal,
  pointsUtilises = 0,
  tauxBonus = 0.1 // 10% du montant payé en points bonus
) => {
  try {
    if (!idClient || !montantTotal || montantTotal <= 0) {
      throw new Error("idClient et montantTotal sont obligatoires et valides.");
    }

    // Récupérer l'entrée Leaderboard
    const leaderboardEntry = await Leaderboard.findOne({
      where: { client_id: idClient },
    });

    if (!leaderboardEntry) {
      throw new Error(`Aucune entrée Leaderboard trouvée pour le client ${idClient}`);
    }
    let pointsDisponibles1 = leaderboardEntry.points_disponible;
    let pointsDisponibles = leaderboardEntry.points_disponible;
    let pointsDeduits = 0;

    // 1. Déduire les points utilisés si demandé
    if (pointsUtilises && pointsUtilises > 0) {
      if (pointsDisponibles < pointsUtilises) {
        throw new Error(`Le client ${idClient} n'a pas assez de points disponibles.`);
      }
      pointsDisponibles -= pointsUtilises;
      pointsDeduits = pointsUtilises;
    }
    let pointsAfterDeduit= pointsDisponibles;

    // 2. Calculer le montant réellement payé en argent
    const montantReelPaye = Math.max(montantTotal - pointsDeduits, 0);

    // 3. Calculer les points bonus à partir du montant payé
    const pointsBonus = Math.floor(montantReelPaye * tauxBonus);

    // 4. Ajouter les points bonus
    pointsDisponibles += pointsBonus;

    // 5. Mise à jour en base
    await leaderboardEntry.update({
      points_disponible: pointsDisponibles,
    });

    return {
      client_id: idClient,
      old_points_disponibles: pointsDisponibles1,
      points_utilises: pointsDeduits,
      points_bonus: pointsBonus,
      new_points_disponibles: pointsDisponibles,
      montant_total: montantTotal,
      montant_reel_paye: montantReelPaye,
    };
  } catch (error) {
    console.error("Erreur dans traiterPointsFidelite:", error);
    throw error;
  }
};

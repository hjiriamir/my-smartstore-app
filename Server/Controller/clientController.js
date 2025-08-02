import Client from '../Model/Client.js';
import Leaderboard from '../Model/Leaderboard.js';
import PointsProgram from '../Model/PointsProgram.js';
// Récupérer tous les clients
export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un client par ID
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (client) {
      res.json(client);
    } else {
      res.status(404).json({ message: 'Client non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer un nouveau client
/*export const createClient = async (req, res) => {
  try {
    const newClient = await Client.create(req.body);
    res.status(201).json(newClient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};*/
export const createClient = async (req, res) => {
  const t = await Client.sequelize.transaction(); 

  try {
    // 1. Créer le client
    const newClient = await Client.create(req.body, { transaction: t });

    // 2. Créer la ligne Leaderboard
    await Leaderboard.create({
      client_id: newClient.id,
      points_total: 0,
      rang: 0, // initialisation rang à 0 (ou null si tu préfères)
    }, { transaction: t });

    // 3. Créer la ligne PointsProgram
    await PointsProgram.create({
      client_id: newClient.id,
      points_cumules: 0,
      derniere_mise_a_jour: new Date(),
    }, { transaction: t });

    // 4. Valider la transaction
    await t.commit();

    res.status(201).json(newClient);
  } catch (error) {
    await t.rollback(); // annule si une étape échoue
    res.status(400).json({ message: error.message });
  }
};


// Mettre à jour un client
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (client) {
      await client.update(req.body);
      res.json(client);
    } else {
      res.status(404).json({ message: 'Client non trouvé' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un client
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (client) {
      await client.destroy();
      res.json({ message: 'Client supprimé' });
    } else {
      res.status(404).json({ message: 'Client non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getClientByEntreprise = async(req,res) => {
    try {
        const { idEntreprise } = req.params;
        if (!idEntreprise) {
            return res.status(400).json({ error: "Le paramètre idEntreprise est obligatoire" });
          }
          const clients = await Client.findAll({
            where: {entreprise_id: idEntreprise}
          })    
          res.status(200).json(clients);
    } catch (error) {
        console.error('Erreur getClientByEntreprise:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des participations' });
    }
}
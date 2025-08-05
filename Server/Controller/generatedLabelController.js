import Categorie1 from '../Model/Categorie1.js';
import GeneratedLabel from '../Model/GeneratedLabel.js';
import Produit from '../Model/Produit.js';
import magasin1 from '../Model/magasin1.js';
import { Op } from 'sequelize';


export const createGeneratedLabel = async (req, res) => {
  try {
    const { template_id, produit_id, label_data, quantity } = req.body;

    if (!template_id || !produit_id || !label_data) {
      return res.status(400).json({ error: 'template_id, produit_id et label_data sont requis' });
    }

    const label = await GeneratedLabel.create({
      template_id,
      produit_id,
      label_data,
      quantity: quantity || 1
    });

    res.status(201).json(label);
  } catch (error) {
    console.error('Erreur création GeneratedLabel :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getGeneratedLabels = async (req, res) => {
  try {
    const labels = await GeneratedLabel.findAll();
    res.json(labels);
  } catch (error) {
    console.error('Erreur récupération GeneratedLabels :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateLabelStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const label = await GeneratedLabel.findByPk(id);
    if (!label) return res.status(404).json({ error: 'Étiquette non trouvée' });

    label.status = status || label.status;
    await label.save();

    res.json(label);
  } catch (error) {
    console.error('Erreur mise à jour statut GeneratedLabel :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};


export const getDailyGeneratedTicket = async (req, res) => {
  try {
    const { idEntreprise } = req.params;
    if (!idEntreprise) {
      return res.status(400).json({ error: "Le paramètre idEntreprise est obligatoire" });
    }

    // 1. Récupération des magasins
    const magasins = await magasin1.findAll({
      where: { entreprise_id: idEntreprise },
    });

    if (magasins.length === 0) {
      return res.status(400).json({ error: "Aucun magasin trouvé" });
    }

    const magasinsIds = magasins.map((m) => m.magasin_id);

    // 2. Récupération des catégories
    const categories = await Categorie1.findAll({
      where: {
        magasin_id: {
          [Op.in]: magasinsIds,
        },
      },
    });

    if (categories.length === 0) {
      return res.status(400).json({ error: "Aucune catégorie trouvée" });
    }

    const categoriesIds = categories.map((c) => c.categorie_id);

    // 3. Récupération des produits
    const produits = await Produit.findAll({
      where: {
        categorie_id: {
          [Op.in]: categoriesIds,
        },
      },
    });

    const produitsIds = produits.map((p) => p.produit_id);

    // 4. Définir l'intervalle de la journée
    const maintenant = new Date();
    const debutJournee = new Date(maintenant);
    debutJournee.setHours(0, 0, 0, 0);

    const finJournee = new Date(maintenant);
    finJournee.setHours(23, 59, 59, 999);

    // 5. Compter les tickets générés aujourd'hui
    const tickets = await GeneratedLabel.findAndCountAll({
      where: {
        produit_id: {
          [Op.in]: produitsIds,
        },
        date_creation: {
          [Op.between]: [debutJournee, finJournee],
        },
      },
    });

    res.status(200).json({
      count: tickets.count,
      rows: tickets.rows,
    });

  } catch (error) {
    console.error("Erreur getDailyGeneratedTicket :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};


// creatoin d'une liste des tickets
export const generateTickets = async (req, res) => {
  try {
    const { template_id, produits } = req.body;

    // Validation des champs
    if (!template_id || !produits || !Array.isArray(produits) || produits.length === 0) {
      return res.status(400).json({
        error: "template_id et produits (tableau) sont obligatoires"
      });
    }

    // Préparer les données à insérer
    const ticketsToInsert = produits.map((p) => ({
      template_id: template_id,
      produit_id: p.produit_id,
      label_data: p.label_data,
      quantity: p.quantity || 1,
      status: "en_attente",
      date_creation: new Date(),
    }));

    // Insertion dans la table generated_labels
    const newTickets = await GeneratedLabel.bulkCreate(ticketsToInsert);

    return res.status(201).json({
      message: `${newTickets.length} ticket(s) généré(s) avec succès`,
      tickets: newTickets,
    });
  } catch (error) {
    console.error("Erreur dans generateTickets :", error);
    return res.status(500).json({
      error: "Erreur serveur lors de la génération des tickets",
      details: error.message,
    });
  }
};

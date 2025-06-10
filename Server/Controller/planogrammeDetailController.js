import PlanogrammeDetail from '../Model/PlanogrammeDetail.js';

// Récupérer tous les détails planogrammes
export const getAllPlanogrammeDetails = async (req, res) => {
  try {
    const details = await PlanogrammeDetail.findAll();
    res.json(details);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer un détail par son ID
export const getPlanogrammeDetailById = async (req, res) => {
  try {
    const detail = await PlanogrammeDetail.findByPk(req.params.id);
    if (!detail) {
      return res.status(404).json({ error: 'Détail non trouvé' });
    }
    res.json(detail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Créer un nouveau détail planogramme
export const createPlanogrammeDetail = async (req, res) => {
  try {
    const newDetail = await PlanogrammeDetail.create(req.body);
    res.status(201).json(newDetail);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Mettre à jour un détail existant
export const updatePlanogrammeDetail = async (req, res) => {
  try {
    const detail = await PlanogrammeDetail.findByPk(req.params.id);
    if (!detail) {
      return res.status(404).json({ error: 'Détail non trouvé' });
    }
    await detail.update(req.body);
    res.json(detail);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Supprimer un détail
export const deletePlanogrammeDetail = async (req, res) => {
  try {
    const detail = await PlanogrammeDetail.findByPk(req.params.id);
    if (!detail) {
      return res.status(404).json({ error: 'Détail non trouvé' });
    }
    await detail.destroy();
    res.json({ message: 'Détail supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Créer plusieurs PlanogrammeDetails avec vérification
export const createManyPlanogrammeDetails = async (req, res) => {
  const listeDetails = req.body;  // Liste d'objets { planogram_id, produit_id, position_prod_etagere, position_prod_colonne }
  const resultats = [];  // Pour stocker les résultats (succès/échecs)

  for (const detail of listeDetails) {
    try {
      const { planogram_id, produit_id, position_prod_etagere, position_prod_colonne } = detail;

      // Vérifier si le produit est déjà présent dans ce planogramme
      const produitExistant = await PlanogrammeDetail.findOne({
        where: { planogram_id, produit_id },
      });

      if (produitExistant) {
        resultats.push({
          detail,
          statut: 'ignoré',
          raison: `Produit ${produit_id} déjà présent dans ce planogramme.`,
        });
        continue;  // Passe à l'élément suivant
      }

      // Vérifier si la position est déjà occupée dans ce planogramme
      const positionOccupee = await PlanogrammeDetail.findOne({
        where: {
          planogram_id,
          position_prod_etagere,
          position_prod_colonne,
        },
      });

      if (positionOccupee) {
        resultats.push({
          detail,
          statut: 'ignoré',
          raison: `Position ${position_prod_etagere}/${position_prod_colonne} déjà occupée.`,
        });
        continue;  // Passe à l'élément suivant
      }

      // Créer le PlanogrammeDetail
      const createdDetail = await PlanogrammeDetail.create(detail);
      resultats.push({
        detail: createdDetail,
        statut: 'ajouté',
      });

    } catch (error) {
      console.error(`Erreur insertion pour le produit ${detail.produit_id}:`, error);
      resultats.push({
        detail,
        statut: 'erreur',
        raison: error.message,
      });
    }
  }

  // Retourner un rapport complet
  res.status(200).json({
    message: "Résultats de l'insertion des détails du planogramme",
    totalDemandes: listeDetails.length,
    totalAjoutes: resultats.filter(r => r.statut === 'ajouté').length,
    totalIgnores: resultats.filter(r => r.statut === 'ignoré').length,
    totalErreurs: resultats.filter(r => r.statut === 'erreur').length,
    details: resultats,
  });
};

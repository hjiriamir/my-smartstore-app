import Entreprises from '../Model/Entreprises.js';
import Formation from '../Model/Formation.js';
import { Op } from 'sequelize';

// Liste toutes les formations
export const getAllFormations = async (req, res) => {
  try {
    const formations = await Formation.findAll();
    res.json(formations);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Récupérer une formation par ID
export const getFormationById = async (req, res) => {
  try {
    const formation = await Formation.findByPk(req.params.id);
    if (!formation) return res.status(404).json({ error: 'Formation non trouvée' });
    res.json(formation);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Créer une nouvelle formation
export const createFormation = async (req, res) => {
  try {
    const { titre, description, url_video, url_pdf, entreprise_id } = req.body;
    const newFormation = await Formation.create({
      titre,
      description,
      url_video,
      url_pdf,
      entreprise_id,
      date_creation: new Date(),
    });
    res.status(201).json(newFormation);
  } catch (error) {
    res.status(400).json({ error: 'Données invalides' });
  }
};

// Mettre à jour une formation
export const updateFormation = async (req, res) => {
  try {
    const formation = await Formation.findByPk(req.params.id);
    if (!formation) return res.status(404).json({ error: 'Formation non trouvée' });

    const { titre, description, url_video, url_pdf, categorie_id } = req.body;
    await formation.update({ titre, description, url_video, url_pdf, categorie_id, entreprise_id });

    res.json(formation);
  } catch (error) {
    res.status(400).json({ error: 'Erreur mise à jour' });
  }
};

// Supprimer une formation
export const deleteFormation = async (req, res) => {
  try {
    const formation = await Formation.findByPk(req.params.id);
    if (!formation) return res.status(404).json({ error: 'Formation non trouvée' });

    await formation.destroy();
    res.json({ message: 'Formation supprimée' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getFormationsByEntreprise = async (req,res) => {
  try {
    const { idEntreprie } = req.params;
    if (!idEntreprie) {
      return res.status(404).json({ error: "idEntreprie non valid!" });
    }
    const formations = await Formation.findAndCountAll({
      where: {entreprise_id:idEntreprie}
    })
    res.status(200).json(formations);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export const getFormationsCeMoisParEntreprise = async (req, res) => {
  try {
    const { idEntreprise } = req.params;
    
    // Validation
    if (!idEntreprise || isNaN(idEntreprise)) {
      return res.status(400).json({ 
        success: false,
        message: "ID entreprise invalide" 
      });
    }

    // Dates du mois en cours
    const maintenant = new Date();
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
    const finMois = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0);

    const { count, rows } = await Formation.findAndCountAll({
      where: {
        entreprise_id: idEntreprise,
        date_creation: {
          [Op.between]: [debutMois, finMois]
        }
      },
      order: [['date_creation', 'DESC']],
      attributes: ['titre'],
      include: [{
        model: Entreprises,
        attributes: ['nomEntreprise'],
        where: { id: idEntreprise } 
      }]
    });

    res.status(200).json({
      success: true,
      total: count,
      formations: rows,
      entreprise: rows[0]?.Entreprise?.nom || null,
      periode: `${maintenant.toLocaleString('default', { month: 'long' })} ${maintenant.getFullYear()}`
    });

  } catch (error) {
    console.error("Erreur formations/mois:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
};

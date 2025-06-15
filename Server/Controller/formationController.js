import Formation from '../Model/Formation.js';

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
    const { titre, description, url_video, url_pdf, categorie_id } = req.body;
    const newFormation = await Formation.create({
      titre,
      description,
      url_video,
      url_pdf,
      categorie_id,
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
    await formation.update({ titre, description, url_video, url_pdf, categorie_id });

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

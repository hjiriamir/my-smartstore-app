import Faq from '../Model/Faq.js';

// Obtenir toutes les questions
export const getAllFaqs = async (req, res) => {
  try {
    const faqs = await Faq.findAll();
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Obtenir une FAQ par ID
export const getFaqById = async (req, res) => {
  try {
    const faq = await Faq.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ error: 'FAQ non trouvée' });
    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Créer une nouvelle FAQ
export const createFaq = async (req, res) => {
  try {
    const { question, reponse, categorieFormation_id } = req.body;
    const newFaq = await Faq.create({
      question,
      reponse,
      categorieFormation_id,
      date_creation: new Date(),
    });
    res.status(201).json(newFaq);
  } catch (error) {
    res.status(400).json({ error: 'Données invalides' });
  }
};

// Mettre à jour une FAQ
export const updateFaq = async (req, res) => {
  try {
    const faq = await Faq.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ error: 'FAQ non trouvée' });

    const { question, reponse, categorieFormation_id } = req.body;
    await faq.update({ question, reponse, categorieFormation_id });

    res.json(faq);
  } catch (error) {
    res.status(400).json({ error: 'Erreur mise à jour' });
  }
};

// Supprimer une FAQ
export const deleteFaq = async (req, res) => {
  try {
    const faq = await Faq.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ error: 'FAQ non trouvée' });

    await faq.destroy();
    res.json({ message: 'FAQ supprimée' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

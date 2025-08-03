import GeneratedLabel from '../Model/GeneratedLabel.js';

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

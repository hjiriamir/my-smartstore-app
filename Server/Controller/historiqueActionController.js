import HistoriqueAction from '../Model/HistoriqueAction.js';

// Obtenir tout l'historique
export const getAllActions = async (req, res) => {
  try {
    const actions = await HistoriqueAction.findAll();
    res.json(actions);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Obtenir une action par ID
export const getActionById = async (req, res) => {
  try {
    const action = await HistoriqueAction.findByPk(req.params.id);
    if (!action) return res.status(404).json({ error: 'Action non trouvée' });
    res.json(action);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Créer une nouvelle action
export const createAction = async (req, res) => {
  try {
    const { utilisateur_id, action, details } = req.body;
    const newAction = await HistoriqueAction.create({
      utilisateur_id,
      action,
      details,
      date_action: new Date(),
    });
    res.status(201).json(newAction);
  } catch (error) {
    res.status(400).json({ error: 'Données invalides' });
  }
};

// Supprimer une action
export const deleteAction = async (req, res) => {
  try {
    const action = await HistoriqueAction.findByPk(req.params.id);
    if (!action) return res.status(404).json({ error: 'Action non trouvée' });

    await action.destroy();
    res.json({ message: 'Action supprimée' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

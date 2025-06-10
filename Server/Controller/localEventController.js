import LocalEvent from '../Model/LocalEvent.js';

// Créer un événement local
export const createLocalEvent = async (req, res) => {
  try {
    const event = await LocalEvent.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    console.error('Erreur création événement local :', error);
    res.status(400).json({ error: error.message });
  }
};

// Récupérer tous les événements locaux
export const getAllLocalEvents = async (req, res) => {
  try {
    const events = await LocalEvent.findAll();
    res.status(200).json(events);
  } catch (error) {
    console.error('Erreur récupération événements :', error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer un événement local par ID
export const getLocalEventById = async (req, res) => {
  try {
    const { event_id } = req.params;
    const event = await LocalEvent.findByPk(event_id);
    if (!event) {
      return res.status(404).json({ error: 'Événement local non trouvé' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error('Erreur récupération événement :', error);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un événement local par ID
export const updateLocalEvent = async (req, res) => {
  try {
    const { event_id } = req.params;
    const [updatedRows] = await LocalEvent.update(req.body, { where: { event_id } });
    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Événement non trouvé ou aucune modification' });
    }
    const updatedEvent = await LocalEvent.findByPk(event_id);
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Erreur mise à jour événement :', error);
    res.status(400).json({ error: error.message });
  }
};

// Supprimer un événement local par ID
export const deleteLocalEvent = async (req, res) => {
  try {
    const { event_id } = req.params;
    const deletedRows = await LocalEvent.destroy({ where: { event_id } });
    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }
    res.status(200).json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression événement :', error);
    res.status(500).json({ error: error.message });
  }
};

// Ajouter une liste d'événements locaux
export const createLocalEventsList = async (req, res) => {
  try {
    const events = req.body;
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'Le corps de la requête doit être un tableau non vide' });
    }
    const createdEvents = await LocalEvent.bulkCreate(events, { validate: true });
    res.status(201).json(createdEvents);
  } catch (error) {
    console.error('Erreur création liste d\'événements :', error);
    res.status(400).json({ error: error.message });
  }
};

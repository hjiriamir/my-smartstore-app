import contactMessage1 from '../Model/contactMessage1.js';

// Créer un nouveau message de contact
export const createContactMessage = async (req, res) => {
    try {
        const message = await contactMessage1.create(req.body);
        res.status(201).json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtenir la liste de tous les messages de contact
export const getAllContactMessages = async (req, res) => {
    try {
        const messages = await contactMessage1.findAll();
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtenir un message de contact par son ID
export const getContactMessageById = async (req, res) => {
    try {
        const message = await contactMessage1.findByPk(req.params.id);
        if (message) {
            res.json(message);
        } else {
            res.status(404).json({ message: 'Message non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Supprimer un message de contact par son ID
export const deleteContactMessage = async (req, res) => {
    try {
        const message = await contactMessage1.findByPk(req.params.id);
        if (message) {
            await message.destroy();
            res.json({ message: 'Message supprimé' });
        } else {
            res.status(404).json({ message: 'Message non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

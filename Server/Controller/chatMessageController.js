import { DataTypes } from 'sequelize';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import ChatMessage from '../Model/ChatMessage.js';
import Users from '../Model/Users.js';

// Configuration du répertoire d'upload
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../public/uploads');

// Créer le répertoire s'il n'existe pas
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers images, PDF et documents sont autorisés'));
    }
  }
}).single('file');

export const uploadMiddleware = upload;

// Créer un message avec ou sans fichier joint
export const createMessage = async (req, res) => {
  try {
    const messageData = {
      conversation_id: req.body.conversation_id,
      utilisateur_id: req.body.utilisateur_id,
      message: req.body.message,
      fichier_joint_url: req.body.fichier_joint_url || null
    };

    const message = await ChatMessage.create(messageData);
    
    // Populer les données utilisateur
    const populatedMessage = await ChatMessage.findByPk(message.id, {
      include: [
        {
          model: Users,
          as: 'utilisateur',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Erreur création message :', error);
    res.status(500).json({ error: error.message });
  }
};

// Upload de fichier et création de message
export const uploadFileAndCreateMessage = async (req, res) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Le fichier est trop volumineux (max 10MB)' });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier téléchargé' });
    }

    try {
      const fileUrl = `/uploads/${req.file.filename}`;
      const messageText = req.body.message || `Fichier joint: ${req.file.originalname}`;

      const message = await ChatMessage.create({
        conversation_id: req.body.conversation_id,
        utilisateur_id: req.body.utilisateur_id,
        message: messageText,
        fichier_joint_url: fileUrl
      });

      const populatedMessage = await ChatMessage.findByPk(message.id, {
        include: [
          {
            model: Users,
            as: 'utilisateur',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      res.status(201).json(populatedMessage);
    } catch (error) {
      console.error('Erreur création message avec fichier :', error);
      
      // Supprimer le fichier uploadé si l'enregistrement échoue
      if (req.file) {
        fs.unlink(path.join(uploadDir, req.file.filename), () => {});
      }
      
      res.status(500).json({ error: error.message });
    }
  });
};

// Récupérer les messages d'une conversation
export const getMessagesByConversation = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await ChatMessage.findAll({
      where: { conversation_id: conversationId },
      include: [
        {
          model: Users,
          as: 'utilisateur',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['date_envoi', 'ASC']]
    });

    // Transformer les URLs des fichiers joints si nécessaire
    const transformedMessages = messages.map(message => {
      if (message.fichier_joint_url && !message.fichier_joint_url.startsWith('http')) {
        return {
          ...message.toJSON(),
          fichier_joint_url: `${req.protocol}://${req.get('host')}${message.fichier_joint_url}`
        };
      }
      return message;
    });

    res.status(200).json(transformedMessages);
  } catch (error) {
    console.error('Erreur récupération messages :', error);
    res.status(500).json({ error: error.message });
  }
};

// Marquer un message comme lu
export const markMessageAsRead = async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await ChatMessage.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }

    message.lu = true;
    await message.save();

    res.status(200).json(message);
  } catch (error) {
    console.error('Erreur marquage message comme lu :', error);
    res.status(500).json({ error: error.message });
  }
};
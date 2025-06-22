import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendSMS = async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: 'Numéro de destination et message requis' });
  }

  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });

    res.status(200).json({ message: 'SMS envoyé avec succès', sid: response.sid });
  } catch (error) {
    console.error('Erreur lors de l’envoi du SMS :', error);
    res.status(500).json({ error: 'Échec de l’envoi du SMS', details: error.message });
  }
};

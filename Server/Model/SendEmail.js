import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: "hjiriamir2020@gmail.com", // Utilisation des variables d'environnement pour la sécurité
        pass: "qcbb huao ynln xjcw",
    },
});

const sendMail = async (toEmail, userEmail, userPassword) => {
    const mailOptions = {
        from: {
            name: "Smart Store",
            address: process.env.EMAIL_USER, // Expéditeur
        },
        to: "amirhjiri3@gmail.com", // Destinataire
        subject: "📩 Bienvenue sur Smart Store - Votre compte est prêt !",
        text: `Bonjour et bienvenue sur Smart Store !

Votre demande d'inscription a été acceptée avec succès.

Voici vos identifiants :
- Email : ${userEmail}
- Mot de passe : ${userPassword}

Important : Pour des raisons de sécurité, veuillez modifier votre mot de passe dès que possible.

À bientôt sur Smart Store !`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Bienvenue sur Smart Store</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                    text-align: center;
                }
                .container {
                    background-color: white;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                    max-width: 500px;
                    margin: auto;
                }
                h2 {
                    color: #2c3e50;
                }
                p {
                    font-size: 16px;
                    color: #34495e;
                }
                .highlight {
                    color: #e74c3c;
                    font-weight: bold;
                }
                .btn {
                    display: inline-block;
                    background-color: #28a745;
                    color: white;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 15px;
                    font-size: 16px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Bienvenue sur Smart Store ! 🎉</h2>
                <p>Nous sommes ravis de vous accueillir. Votre demande d'inscription a été acceptée avec succès.</p>
                <h3>📌 Voici vos identifiants :</h3>
                <p><strong>Email :</strong> <span class="highlight">${userEmail}</span></p>
                <p><strong>Mot de passe :</strong> <span class="highlight">${userPassword}</span></p>
                <p>⚠️ <strong>Important :</strong> Pour votre sécurité, veuillez modifier votre mot de passe dès votre première connexion.</p>
                <a href="https://smartstore.com/login" class="btn">Accédez à votre compte</a>
                <p>À très bientôt sur <strong>Smart Store</strong> !</p>
            </div>
        </body>
        </html>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email envoyé avec succès à ${toEmail} !`);
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email :", error);
    }
};
sendMail();
// Exporter la fonction pour l'utiliser ailleurs
export { sendMail };

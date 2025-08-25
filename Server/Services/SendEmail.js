import transporter from "../Config/transporter.js";

export const sendMail = async (toEmail, userEmail, userPassword) => {
    const mailOptions = {
        from: {
            name: "Smart Store",
            address: process.env.EMAIL_USER,
        },
        to: toEmail,
        subject: "📩 Bienvenue sur Smart Store - Votre compte est prêt !",
        html: `
        <html>
        <body>
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                <h2>Bienvenue sur Smart Store ! 🎉</h2>
                <p>Nous sommes ravis de vous accueillir.</p>
                <h3>📌 Identifiants :</h3>
                <p><strong>Email :</strong> ${userEmail}</p>
                <p><strong>Mot de passe :</strong> ${userPassword}</p>
                <p>⚠️ Modifiez votre mot de passe dès votre première connexion.</p>
                <a href="https://smartstore.com/login"
                   style="display: inline-block; background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                   Accédez à votre compte
                </a>
            </div>
        </body>
        </html>`,
    };

    return transporter.sendMail(mailOptions);
};


export const sendBasicEmail = async (senderEmail, receiverEmail) => {
    const mailOptions = {
        from: {
            name: "Smart Store Notification",
            address: senderEmail,
        },
        to: receiverEmail,
        subject: "📢 Nouvelle tâche publiée sur Smart Store",
html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2c3e50;">📌 Nouvelle tâche assignée</h2>
        <p>Bonjour,</p>
        <p>Vous recevez ce message de la part de l’équipe administrative de <strong>Smart Store</strong>.</p>
        <p>Une nouvelle tâche vient d’être publiée et vous a été assignée.</p>
        <p><strong>Expéditeur :</strong> ${senderEmail}</p>
        <p>Veuillez vous connecter à votre compte pour consulter les détails de la tâche.</p>
        <a href="https://smartstore.com/login"
           style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
           Accéder à mon espace
        </a>
        <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
            Ceci est un message automatique. Merci de ne pas y répondre directement.
        </p>
    </div>
`
,
    };

    return transporter.sendMail(mailOptions);
};

export const sendAccountCreatedEmail = async (toEmail, userEmail, userPassword) => {
    const mailOptions = {
      from: {
        name: "Smart Store",
        address: process.env.EMAIL_USER,
      },
      to: toEmail,
      subject: "✅ Compte créé avec succès - Smart Store",
      html: `
      <html>
      <body>
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px; text-align: center;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
            <h2 style="color: #2c3e50;">Votre compte Smart Store a été créé avec succès 🎉</h2>
            <p>Bonjour,</p>
            <p>Nous vous confirmons que votre compte a bien été créé.</p>
            
            <h3 style="color: #34495e;">🧾 Détails de connexion :</h3>
            <p><strong>Email :</strong> ${userEmail}</p>
            <p><strong>Mot de passe temporaire :</strong> ${userPassword}</p>
  
            <p style="color: #e74c3c;"><strong>Nous vous recommandons de changer votre mot de passe immédiatement après votre première connexion.</strong></p>
  
            <a href="https://smartstore.com/login"
               style="display: inline-block; background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
               Se connecter à Smart Store
            </a>
  
            <p style="margin-top: 30px; color: #7f8c8d; font-size: 12px;">
              Si vous n'êtes pas à l'origine de cette création de compte, veuillez nous contacter immédiatement.
            </p>
          </div>
        </div>
      </body>
      </html>
      `,
    };
  
    return transporter.sendMail(mailOptions);
  };
  

  export const sendGenericMail = async (emetteur, recepteur, objet, contenuHtml) => {
    try {
      const mailOptions = {
        from: {
          name: "Smart Store",
          address: emetteur || process.env.EMAIL_USER,
        },
        to: recepteur,
        subject: objet,
        html: contenuHtml,
      };
  
      const info = await transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      console.error("Erreur lors de l'envoi du mail :", error);
      throw error;
    }
  };
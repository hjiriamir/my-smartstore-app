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

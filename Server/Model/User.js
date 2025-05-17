import db from '../Config/database.js';

export const createUser = (user, callback) => {
    const { name, email, password, role,entreprise_id } = user; 
    const sql = "INSERT INTO Utilisateur (name, email, password, role,entreprise_id) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [name, email, password, role,entreprise_id || 'user'], callback); 
};

export const createUserBySystem = (user, callback) => {
    const { name, email, password, role,entreprise_id } = user; 
    const sql = "INSERT INTO Utilisateur (name, email, password, role,entreprise_id) VALUES (?, ?, ?, ?,?)";
    db.query(sql, [name, email, password, role,entreprise_id || 'user'], callback); 
};


export const findUserByEmail = (email, callback) => {
    const sql = "SELECT * FROM Utilisateur WHERE email = ?";
    db.query(sql, [email], (err, data) => {
        if (err) return callback(err);
        console.log(data[0]); 
        callback(null, data);
    });
};
export const getAllUsersExcludingAdmin = (callback) => {
    const sql = "SELECT * FROM Utilisateur WHERE role != 'Admin'";  // Filtre pour exclure les utilisateurs avec le rôle 'Admin'
    
    db.query(sql, (err, data) => {
        if (err) return callback(err);
        console.log(data);  // Affiche les utilisateurs récupérés
        callback(null, data);
    });
};
// Dans le fichier User.js (modèle)
export const getUserById = (idUtilisateur, callback) => {
    const sql = "SELECT * FROM Utilisateur WHERE idUtilisateur = ?";
    db.query(sql, [idUtilisateur], (err, data) => {
        if (err) return callback(err);
        callback(null, data[0]); // Retourne le premier utilisateur trouvé
    });
};


import Conversation from './Conversation.js';
import ConversationParticipant from './ConversationParticipant.js';
import Users from './Users.js';
import Furniture from './Furniture.js';
import Tache from './Tache.js';
import Planogram from './Planogram.js';
import Zone1 from './zone1.js';
import User from './Users.js'
import FurnitureType from './FurnitureType.js';
import ProductPosition from './ProductPosition.js';
import Produit from './Produit.js';
import ChatMessage from './ChatMessage.js'
import Fournisseur from './Fournisseur.js';
import Categorie1 from './Categorie1.js';
import Vente from './Ventes.js';
import StockMovement from './StockMovement.js';
import magasin1 from './magasin1.js';
import Entreprises from './Entreprises.js';
import Formation from './Formation.js';
import CommandeAchat from './CommandeAchat.js';
import LigneCommandeAchat from './LigneCommandeAchat.js';
import EntrepriseFournisseur from './EntrepriseFournisseur.js'
//import Conversation from './Conversation.js';
// === Associations Conversation/Users===
Conversation.belongsToMany(Users, {
  through: ConversationParticipant,
  foreignKey: 'conversation_id',
  otherKey: 'utilisateur_id'
});

Users.belongsToMany(Conversation, {
  through: ConversationParticipant,
  foreignKey: 'utilisateur_id',
  otherKey: 'conversation_id'
});

//association Tache -> Planogram ===
// Une Tache appartient à un Planogram
Tache.belongsTo(Planogram, {
  foreignKey: 'planogram_id',
  as: 'planogram',
});

// Un Planogram a plusieurs Taches
Planogram.hasMany(Tache, {
  foreignKey: 'planogram_id',
  as: 'taches',
});

Planogram.hasMany(Furniture, { foreignKey: 'planogram_id', as: 'furnitures' });
Furniture.belongsTo(Planogram, { foreignKey: 'planogram_id', as: 'planogram' });
Planogram.belongsTo(Zone1, {
  foreignKey: 'zone_id',
  targetKey: 'zone_id', // cible la colonne unique zone_id dans zones
  as: 'zone'
});

Furniture.hasMany(ProductPosition, { foreignKey: 'furniture_id', as: 'positions' });
ProductPosition.belongsTo(Produit, { foreignKey: 'product_id', as: 'product' });

Produit.hasMany(ProductPosition, { foreignKey: 'product_id', as: 'positions' });

Tache.belongsTo(User, { foreignKey: 'idUser', as: 'user' });
Furniture.belongsTo(FurnitureType, { foreignKey: 'furniture_type_id', as:'furnitureType' });

ChatMessage.belongsTo(User, {foreignKey: 'utilisateur_id', as: 'utilisateur'})
ChatMessage.belongsTo(Conversation, {foreignKey: 'conversation_id',as:'conversation'})
ConversationParticipant.belongsTo(Users, { foreignKey: 'utilisateur_id', as: 'utilisateur' });

//ConversationParticipant.hasMany(User, {foreignKey:'utilisateur_id', as:'utilisateur'})
// Association : une Conversation a plusieurs Participants
Conversation.hasMany(ConversationParticipant, {
  foreignKey: 'conversation_id',
  as: 'participants'
});

// Association : un Participant appartient à une Conversation
ConversationParticipant.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  as: 'conversation'
});

Produit.belongsTo(Fournisseur, {foreignKey:'fournisseur_id',as:'fournisseur'})
Produit.belongsTo(Categorie1, {
  foreignKey: 'categorie_id',  // Colonne dans Produit
  targetKey: 'categorie_id',   // Colonne dans Categorie1 (si différente de 'id')
  as: 'categorie'
});ProductPosition.belongsTo(Furniture,{foreignKey:'furniture_id', as:'furniture'})
Vente.belongsTo(Produit, {
  foreignKey: 'produit_id',  // Colonne dans Produit
  targetKey: 'produit_id',   // Colonne dans Categorie1 (si différente de 'id')
  as: 'produit'
});
StockMovement.belongsTo(Produit, {
  foreignKey: 'produit_id',  // Colonne dans Produit
  targetKey: 'produit_id',   // Colonne dans Categorie1 (si différente de 'id')
  as: 'produit'
});



Categorie1.belongsTo(magasin1, {foreignKey:'magasin_id', as: 'magasin'})
Produit.hasMany(Vente, {
  foreignKey: 'produit_id', // Colonne dans Vente qui référence Produit
  sourceKey: 'produit_id',  // Colonne dans Produit à référencer (votre index_unique)
  as: 'ventes'
});
Produit.hasMany(StockMovement, {
  foreignKey: 'produit_id', // Colonne dans StockMovement
  sourceKey: 'produit_id',  // Colonne dans Produit
  as: 'stockmovements'
});
Formation.belongsTo(Entreprises, { foreignKey: 'entreprise_id' });
Entreprises.hasMany(Formation, { foreignKey: 'entreprise_id' });

// === Associations Users/Entreprise ===
Users.belongsTo(Entreprises, {
  foreignKey: 'entreprises_id', // le champ dans la table Users
  as: 'entreprise' // alias pour l'inclusion
});

Entreprises.hasMany(Users, {
  foreignKey: 'entreprises_id',
  as: 'utilisateurs'
});


CommandeAchat.hasMany(LigneCommandeAchat, {
  foreignKey: 'id_commande_achat',
  as: 'lignes',
  onDelete: 'CASCADE'
});

LigneCommandeAchat.belongsTo(CommandeAchat, {
  foreignKey: 'id_commande_achat',
  targetKey: 'id_commande_achat', 
  as: 'commande'
});

CommandeAchat.belongsTo(magasin1, {
  foreignKey: 'id_magasin',
  targetKey: 'id', 
  as: 'magasin'
});

CommandeAchat.belongsTo(Entreprises, {
  foreignKey: 'id_entreprise',  // FK dans CommandeAchat
  targetKey: 'id',              // PK dans Entreprises
  as: 'entreprise'
});

CommandeAchat.belongsTo(Fournisseur, {
  foreignKey: 'id_fournisseur',
  targetKey: 'fournisseur_id', 
  as: 'fournisseur'
});

Produit.hasMany(LigneCommandeAchat, {
  foreignKey: 'id_produit',  // correspond au champ dans LigneCommandeAchat
  sourceKey: 'id',           // correspond à la PK dans Produit
  as: 'lignesCommandeAchat'
});
LigneCommandeAchat.belongsTo(Produit, {
  foreignKey: 'id_produit',  // champ dans LigneCommandeAchat
  targetKey: 'id',           // champ référencé dans Produit
  as: 'produit'
});

// Définir les relations many-to-many
Entreprises.belongsToMany(Fournisseur, {
  through: EntrepriseFournisseur,
  foreignKey: 'entrepriseId',
  otherKey: 'fournisseurId',
});

Fournisseur.belongsToMany(Entreprises, {
  through: EntrepriseFournisseur,
  foreignKey: 'fournisseurId',
  otherKey: 'entrepriseId',
});

export {
  Conversation,
  ConversationParticipant,
  Users,
  Tache,
  Planogram,
  Furniture,
  Zone1,
  FurnitureType,
  User,
  ProductPosition,
  Fournisseur,
  Vente,
  StockMovement,
  magasin1,
  Categorie1,
  Produit,
  Formation,
  Entreprises,
  CommandeAchat,
  LigneCommandeAchat
};
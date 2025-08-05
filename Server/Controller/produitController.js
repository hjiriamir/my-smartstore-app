import { 
  Produit, 
  Fournisseur, 
  Categorie1, 
  ProductPosition, 
  Furniture, 
  FurnitureType,
  Planogram, 
  Zone1, 
  Vente, 
  StockMovement,
  magasin1,
  PriceHistory
} from '../Model/associations.js';
import { Op } from 'sequelize';
import sequelize from "../Config/database1.js";
//import {getPerformanceProduitMoyenByStore } from '../Services/produitService.js'
import { getPerformanceProduitMoyenByStore,getHistoryPriceProduct, verifyAvailableTicketProduct, getZoneProduit, getProductsByEntreprise  } from "../Services/produitService.js";
// Créer un produit
export const createProduit = async (req, res) => {
  try {
    const produit = await Produit.create(req.body);
    res.status(201).json(produit);
  } catch (error) {
    console.error('Erreur création produit :', error);
    res.status(400).json({ error: error.message });
  }
};

// Récupérer tous les produits
export const getAllProduits = async (req, res) => {
  try {
    const produits = await Produit.findAll();
    res.status(200).json(produits);
  } catch (error) {
    console.error('Erreur récupération produits :', error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer un produit par ID
export const getProduitById = async (req, res) => {
  try {
    const { id } = req.params;
    const produit = await Produit.findByPk(id);
    if (!produit) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    res.status(200).json(produit);
  } catch (error) {
    console.error('Erreur récupération produit :', error);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un produit par ID
export const updateProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRows] = await Produit.update(req.body, { where: { id } });
    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Produit non trouvé ou aucune modification' });
    }
    const updatedProduit = await Produit.findByPk(id);
    res.status(200).json(updatedProduit);
  } catch (error) {
    console.error('Erreur mise à jour produit :', error);
    res.status(400).json({ error: error.message });
  }
};

// Supprimer un produit par ID
export const deleteProduit = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await Produit.destroy({ where: { id } });
    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    res.status(200).json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression produit :', error);
    res.status(500).json({ error: error.message });
  }
};

// Ajouter une liste de produits (bulk)
export const createProduitsList = async (req, res) => {
  try {
    const produits = req.body;
    if (!Array.isArray(produits) || produits.length === 0) {
      return res.status(400).json({ error: 'Le corps de la requête doit être un tableau non vide' });
    }

    // Extraire les produit_id envoyés
    const produitIds = produits.map(p => p.produit_id);

    // Trouver les produits existants avec ces produit_id
    const produitsExistants = await Produit.findAll({
      where: {
        produit_id: produitIds
      },
      attributes: ['produit_id']
    });

    // Extraire les ids existants
    const idsExistants = produitsExistants.map(p => p.produit_id);

    // Filtrer les produits à créer (ceux dont produit_id n'existe pas encore)
    const produitsAInserer = produits.filter(p => !idsExistants.includes(p.produit_id));

    if (produitsAInserer.length === 0) {
      return res.status(200).json({ message: 'Tous les produits existent déjà. Aucun ajout effectué.' });
    }

    // Créer les nouveaux produits
    const createdProduits = await Produit.bulkCreate(produitsAInserer, { validate: true });

    res.status(201).json({
      message: `${createdProduits.length} produit(s) créé(s) avec succès.`,
      produits: createdProduits
    });

  } catch (error) {
    console.error('Erreur création liste de produits :', error);
    res.status(400).json({ error: error.message });
  }
};



export const getProduitDetails = async (req, res) => {
  try {
    const { idMagasin } = req.params;

    if (!idMagasin) {
      return res.status(400).json({ error: "idMagasin manquant." });
    }

    const produits = await Produit.findAll({
      include: [
        {
          model: Fournisseur,
          as: 'fournisseur',
          attributes: ['fournisseur_id', 'nom']
        },
        {
          model: Categorie1,
          as: 'categorie',
         // where: { magasin_id: idMagasin },
          required: false,
          attributes: ['categorie_id', 'nom']
        },
        {
          model: ProductPosition,
          as: 'positions',
          required: false,
          include: [
            {
              model: Furniture,
              as: 'furniture',
              required: false,
              attributes: ['furniture_id', 'planogram_id', 'furniture_type_id'],
              include: [
                {
                  model: FurnitureType,
                  as: 'furnitureType',
                  required: false,
                  attributes: ['nomType', 'nombreFaces']
                },
                {
                  model: Planogram,
                  as: 'planogram',
                  required: false,
                  where: { magasin_id: idMagasin },
                  attributes: ['planogram_id', 'zone_id', 'magasin_id', 'nom'],
                  include: [
                    {
                      model: Zone1,
                      as: 'zone',
                      required: false,
                      attributes: ['zone_id', 'nom_zone']
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          model: Vente,
          as: 'ventes',
          where: { magasin_id: idMagasin },
          required: false,
          attributes: ['vente_id', 'quantite', 'prix_unitaire']
        },
        {
          model: StockMovement,
          as: 'stockmovements',
          where: { magasin_id: idMagasin },
          required: false,
          attributes: ['mouvement_id', 'type_mouvement', 'quantite', 'cout_unitaire', 'valeur_mouvement']
        }
      ]
    });

    return res.json(produits);
  } catch (error) {
    console.error('Erreur dans getProduitDetails:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getProductIdsByCodes= async(req,res) => {
  try {
    const { productCode } = req.params;

    if (!productCode) {
      return res.status(400).json({ error: "productCode manquant." });
    }
    const produit = await Produit.findOne({
      where: {produit_id:productCode}
    })
    return res.json(produit.id);
  } catch (error) {
    console.error('Erreur dans getProductIdsByCodes:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
export const getProductIdsFromCodes = async (req, res) => {
  try {
    // Récupérer les codes depuis les query parameters
    const productCodes = req.query.productCodes;
    
    if (!productCodes) {
      return res.status(400).json({ error: "Paramètre productCodes manquant." });
    }

    // Convertir en tableau si ce n'est pas déjà le cas
    const codesArray = Array.isArray(productCodes) 
      ? productCodes 
      : productCodes.split(',');

    const produits = await Produit.findAll({
      where: {
        produit_id: codesArray
      },
      attributes: ['produit_id', 'id']
    });

    return res.json(produits);
  } catch (error) {
    console.error("Erreur dans getProductIdsFromCodes:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getProductsByMagasin = async(req,res)=>{
try {
  const { idMagasin } = req.params;

  // Récuperation des Catégories
  const categories = await Categorie1.findAll({
    where: {magasin_id: idMagasin}
  })

  if (!categories) {
    return res.status(400).json({ error: "Problème au niveau de la récuperation des catégories" });
  }
  const categorieIds = categories.map(cat => cat.categorie_id);
  // Récupération des Produits
  const products = await Produit.findAll({
    where: {
      categorie_id: {
        [Op.in]: categorieIds
      }
    }
  });
  return res.json(products);
  
} catch (error) {
  console.error("Erreur dans get Products By Magasin:", error);
    return res.status(500).json({ error: "Erreur serveur" });
}
}

export const getProduitsByCategorie = async (req,res) =>{
  try {
    const { idCategorie } = req.params;
    const produits = await Produit.findAll({
      where: {categorie_id: idCategorie}
    })

    return res.json(produits);
  } catch (error) {
    console.error("Erreur dans get Produits By Categorie:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}


export const getPerformanceProduitsController = async (req, res) => {
  try {
    const { idMagasin, date_debut, date_fin } = req.query;

    if (!idMagasin || !date_debut || !date_fin) {
      return res.status(400).json({
        message: "Les paramètres idMagasin, date_debut et date_fin sont obligatoires"
      });
    }

    const data = await getPerformanceProduitMoyenByStore(
      idMagasin,
      date_debut,
      date_fin
    );

    return res.status(200).json(data);
  } catch (error) {
    console.error("Erreur dans getPerformanceProduitsController :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la récupération de la performance des produits",
      error: error.message
    });
  }
};


export const getEntrepriseProduitsDetails = async (req, res) => {
  try {
    const { idEntreprise } = req.params;

    // Utilisation directe de la méthode
    const produits = await getProductsByEntreprise(idEntreprise);

    if (!produits || produits.length === 0) {
      return res.status(404).json({ error: "Aucun produit trouvé pour cette entreprise" });
    }

    const result = [];
    for (const produit of produits) {
      const historyPrice = await getHistoryPriceProduct(produit.produit_id);
      const tickets = await verifyAvailableTicketProduct(produit.produit_id);
      const zone = await getZoneProduit(produit.produit_id);

      // Statut du stock
      let stockStatus = "En stock";
      if (produit.stock === 0) {
        stockStatus = "Rupture";
      } else if (produit.stock <= 10) {
        stockStatus = "Stock faible";
      }

      result.push({
        id: produit.produit_id,
        imageUrl: produit.imageUrl,
        nom: produit.nom,
        prix: produit.prix,
        ancienPrix: produit.prix || null,
        stockStatus,
        ticketStatus: tickets.length > 0 ? "Disponible" : "Aucun",
        zone: zone?.nom_zone || "",
        historyPrice,
        tickets,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur dans getEntrepriseProduitsDetails:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};


export const updateProductPrice = async (req, res) => {
  try {
    const { produit_id, new_price, change_type, reason, changed_by } = req.body;

    if (!produit_id || !new_price || !change_type || !changed_by) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    // 1. Récupérer le produit
    const produit = await Produit.findOne({ where: { produit_id } });

    if (!produit) {
      return res.status(404).json({ error: "Produit introuvable" });
    }

    const old_price = produit.prix;
    const change_value = new_price - old_price;

    // 2. Mettre à jour le prix dans la table Produit
    produit.prix = new_price;
    await produit.save();

    // 3. Créer une nouvelle entrée dans PriceHistory
    await PriceHistory.create({
      product_id: produit_id,
      old_price,
      new_price,
      change_type,
      change_value,
      reason,
      changed_by,
    });

    res.status(200).json({
      message: "Prix mis à jour et historique enregistré avec succès",
      produit,
    });
  } catch (error) {
    console.error("Erreur dans updateProductPrice:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
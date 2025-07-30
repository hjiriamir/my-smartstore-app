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
  StockMovement 
} from '../Model/associations.js';
import { Op } from 'sequelize';

import {getPerformanceProduitMoyenByStore } from '../Services/produitService.js'

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
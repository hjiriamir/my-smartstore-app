import StockMovement from '../Model/StockMovement.js';
import Stock from '../Model/Stock.js';

// Mise a jour du stock 
async function updateStock(produit_id, magasin_id, quantite, type) {
  try {
    // Chercher le stock en fonction de produit_id et magasin_id (clé primaire composée)
    const stockProduit = await Stock.findOne({
      where: { produit_id, magasin_id }
    });

    if (!stockProduit) {
      // Si pas de stock existant et c'est une entrée, créer un nouveau stock
      if (type === "entrée") {
        const newStock = await Stock.create({
          produit_id,
          magasin_id,
          quantite,
          date_maj: new Date(),
        });
        return newStock;
      } else {
        throw new Error("Stock inexistant pour ce produit et magasin, impossible de faire une sortie");
      }
    }

    // Mettre à jour la quantité selon le type de mouvement
    if (type === "entrée") {
      stockProduit.quantite += quantite;
    } else if (type === "sortie") {
      if (stockProduit.quantite < quantite) {
        throw new Error("Quantité en stock insuffisante pour la sortie demandée");
      }
      stockProduit.quantite -= quantite;
    } else {
      throw new Error("Type de mouvement inconnu");
    }

    // Mettre à jour la date de modification
    stockProduit.date_maj = new Date();

    // Sauvegarder en base
    await stockProduit.save();

    return stockProduit;
  } catch (error) {
    console.error("Erreur updateStock:", error);
    throw error;
  }
}


// Créer un mouvement de stock
export const createStockMovement = async (req, res) => {
    try {
      const stockMovement = await StockMovement.create(req.body);
      
      // On attend la mise à jour du stock AVANT d'envoyer la réponse
      await updateStock(
        stockMovement.produit_id, 
        stockMovement.magasin_id, 
        stockMovement.quantite, 
        stockMovement.type_mouvement
      );
      
      res.status(201).json(stockMovement);
    } catch (error) {
      console.error('Erreur création mouvement stock :', error);
      res.status(400).json({ error: error.message });
    }
  };

// Récupérer tous les mouvements de stock
export const getAllStockMovements = async (req, res) => {
  try {
    const stockMovements = await StockMovement.findAll();
    res.status(200).json(stockMovements);
  } catch (error) {
    console.error('Erreur récupération mouvements stock :', error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer un mouvement de stock par ID
export const getStockMovementById = async (req, res) => {
  try {
    const { id } = req.params;
    const stockMovement = await StockMovement.findByPk(id);
    if (!stockMovement) {
      return res.status(404).json({ error: 'Mouvement de stock non trouvé' });
    }
    res.status(200).json(stockMovement);
  } catch (error) {
    console.error('Erreur récupération mouvement stock :', error);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un mouvement de stock par ID
export const updateStockMovement = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRows] = await StockMovement.update(req.body, { where: { mouvement_id: id } });
    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Mouvement de stock non trouvé ou aucune modification' });
    }
    const updatedStockMovement = await StockMovement.findByPk(id);
    res.status(200).json(updatedStockMovement);
  } catch (error) {
    console.error('Erreur mise à jour mouvement stock :', error);
    res.status(400).json({ error: error.message });
  }
};

// Supprimer un mouvement de stock par ID
export const deleteStockMovement = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await StockMovement.destroy({ where: { mouvement_id: id } });
    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Mouvement de stock non trouvé' });
    }
    res.status(200).json({ message: 'Mouvement de stock supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression mouvement stock :', error);
    res.status(500).json({ error: error.message });
  }
};

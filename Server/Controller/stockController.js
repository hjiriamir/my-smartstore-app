import Stock from '../Model/Stock.js';

// Créer ou mettre à jour un stock (upsert)
export const upsertStock = async (req, res) => {
  try {
    const { produit_id, magasin_id, quantite } = req.body;
    if (!produit_id || !magasin_id || quantite == null) {
      return res.status(400).json({ error: 'produit_id, magasin_id et quantite sont obligatoires' });
    }

    // Chercher si la clé primaire existe déjà (produit_id + magasin_id)
    const existingStock = await Stock.findOne({ where: { produit_id, magasin_id } });

    if (existingStock) {
      // Mise à jour
      existingStock.quantite = quantite;
      existingStock.date_maj = new Date();
      await existingStock.save();
      return res.status(200).json(existingStock);
    } else {
      // Création
      const newStock = await Stock.create({
        produit_id,
        magasin_id,
        quantite,
        date_maj: new Date(),
      });
      return res.status(201).json(newStock);
    }
  } catch (error) {
    console.error('Erreur création/mise à jour stock :', error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer tous les stocks
export const getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.findAll();
    res.status(200).json(stocks);
  } catch (error) {
    console.error('Erreur récupération stocks :', error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer un stock par produit_id et magasin_id (clé composite)
export const getStock = async (req, res) => {
  try {
    const { produit_id, magasin_id } = req.params;
    const stock = await Stock.findOne({ where: { produit_id, magasin_id } });
    if (!stock) {
      return res.status(404).json({ error: 'Stock non trouvé' });
    }
    res.status(200).json(stock);
  } catch (error) {
    console.error('Erreur récupération stock :', error);
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un stock par produit_id et magasin_id
export const deleteStock = async (req, res) => {
  try {
    const { produit_id, magasin_id } = req.params;
    const deleted = await Stock.destroy({ where: { produit_id, magasin_id } });
    if (deleted === 0) {
      return res.status(404).json({ error: 'Stock non trouvé' });
    }
    res.status(200).json({ message: 'Stock supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression stock :', error);
    res.status(500).json({ error: error.message });
  }
};

import PriceHistory from "../Model/PriceHistory.js";

export const getPriceHistoryByProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const history = await PriceHistory.findAll({
      where: { product_id },
      order: [["changed_at", "DESC"]],
    });
    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération de l'historique des prix." });
  }
};

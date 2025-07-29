import ZoneVisites from '../Model/ZoneVisites.js';

export const createZoneVisite = async (req, res) => {
  try {
    const { zone_id, date_visite, nb_visiteurs } = req.body;
    const visite = await ZoneVisites.create({ zone_id, date_visite, nb_visiteurs });
    res.status(201).json(visite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la création de la visite.' });
  }
};

export const getZoneVisites = async (req, res) => {
  try {
    const { zoneId } = req.params;
    const visites = await ZoneVisites.findAll({ where: { zone_id: zoneId } });
    res.status(200).json(visites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des visites.' });
  }
};

export const getZoneStats = async (req, res) => {
  try {
    const stats = await ZoneVisites.findAll({
      attributes: [
        'zone_id',
        [ZoneVisites.sequelize.fn('SUM', ZoneVisites.sequelize.col('nb_visiteurs')), 'total_visiteurs'],
      ],
      group: ['zone_id'],
    });
    res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des stats.' });
  }
};

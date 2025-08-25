import contactMessage1 from "../Model/contactMessage1.js";
import { Op } from "sequelize";

export const mettreStatusRead = async (idMessage) => {
    try {
      const message = await contactMessage1.findOne({
        where: {
          id: idMessage,
          status: "unread"
        }
      });
  
      if (!message) {
        throw new Error("Aucun message unread trouvé ");
      }
  
      message.status = "read";
      await message.save();
    } catch (error) {
      console.error("Erreur dans mettreStatusRead:", error);
      throw error;
    }
  };
  
  export const mettreStatusRepondus  = async (idMessage) => {
    try {
      const message = await contactMessage1.findOne({
        where: {
            id: idMessage,
            status: {
              [Op.in]: ['read', 'unread']
            }
          }
      });
  
      if (!message) {
        throw new Error("Aucun message unread/read trouvé ");
      }
  
      message.status = "replied";
      await message.save();
    } catch (error) {
      console.error("Erreur dans mettreStatusRepndus:", error);
      throw error;
    }
  };
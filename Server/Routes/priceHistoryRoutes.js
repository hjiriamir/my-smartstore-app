import express from "express";
import { getPriceHistoryByProduct, 
    getPricesChangement,
    getLastPrice 
} from "../Controller/priceHistoryController.js";

const router = express.Router();

router.get("/getPriceHistoryByProduct/:product_id", getPriceHistoryByProduct);
router.get("/getPricesChangement/:idEntreprise", getPricesChangement);
router.get("/getLastPrice/:product_id", getLastPrice);


export default router;

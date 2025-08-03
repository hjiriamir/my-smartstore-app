import express from "express";
import { getPriceHistoryByProduct } from "../Controller/priceHistoryController.js";

const router = express.Router();

router.get("/getPriceHistoryByProduct/:product_id", getPriceHistoryByProduct);

export default router;

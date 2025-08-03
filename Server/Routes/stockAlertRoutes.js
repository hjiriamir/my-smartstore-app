import express from "express";
import {
  getAllStockAlerts,
  createStockAlert,
  updateStockAlert,
  deleteStockAlert,
} from "../Controller/stockAlertController.js";

const router = express.Router();

router.get("/", getAllStockAlerts);
router.post("/", createStockAlert);
router.put("/:id", updateStockAlert);
router.delete("/:id", deleteStockAlert);

export default router;

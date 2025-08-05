import express from "express";
import {
  getAllLabelTemplates,
  createLabelTemplate,
  updateLabelTemplate,
  deleteLabelTemplate,
} from "../Controller/labelTemplateController.js";

const router = express.Router();

router.get("/getAllLabelTemplates", getAllLabelTemplates);
router.post("/createLabelTemplate", createLabelTemplate);
router.put("/updateLabelTemplate/:id", updateLabelTemplate);
router.delete("/deleteLabelTemplate/:id", deleteLabelTemplate);

export default router;

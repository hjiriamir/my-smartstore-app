import express from "express";
import {
  getAllLabelTemplates,
  createLabelTemplate,
  updateLabelTemplate,
  deleteLabelTemplate,
} from "../Controller/labelTemplateController.js";

const router = express.Router();

router.get("/", getAllLabelTemplates);
router.post("/", createLabelTemplate);
router.put("/:id", updateLabelTemplate);
router.delete("/:id", deleteLabelTemplate);

export default router;

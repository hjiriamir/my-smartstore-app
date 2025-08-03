import express from "express";
import {
  getFieldsByTemplate,
  createTemplateField,
  updateTemplateField,
  deleteTemplateField,
} from "../Controller/templateFieldController.js";

const router = express.Router();

router.get("/:template_id", getFieldsByTemplate);
router.post("/", createTemplateField);
router.put("/:id", updateTemplateField);
router.delete("/:id", deleteTemplateField);

export default router;

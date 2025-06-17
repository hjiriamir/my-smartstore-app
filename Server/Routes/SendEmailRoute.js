import express from "express";
import { sendEmailController, sendBasicEmailController } from "../Controller/sendEmailController.js";

const router = express.Router();

router.post("/send-email", sendEmailController);
router.post("/sendBasicEmail", sendBasicEmailController);

export default router;

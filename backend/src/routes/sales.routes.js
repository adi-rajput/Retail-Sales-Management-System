import { Router } from "express";
import { getSales,getSaleById } from "../controllers/sales.controller.js";

const router = Router();

router.get("/", getSales);
router.get("/:id", getSaleById);
export default router;

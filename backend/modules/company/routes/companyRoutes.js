import express from "express";
import { createCompany, updateCompany, getCompany } from "../controllers/companyController.js";

const router = express.Router();

router.post('/create', createCompany);
router.put('/edit', updateCompany);
router.get('/', getCompany);

export default router;
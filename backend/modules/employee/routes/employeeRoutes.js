import express from "express";
import { createEmployee, getAllEmployees, getSingleEmployee, deleteEmployee } from "../controllers/employeeController.js";

const router = express.Router();

router.post('/create', createEmployee);
router.get('/all', getAllEmployees);
router.get('/single/:id', getSingleEmployee);
router.delete('/delete/:id', deleteEmployee);

export default router;
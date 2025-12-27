import express from "express";
import { createEmployee, getAllEmployees, getSingleEmployee, deleteEmployee, updateEmployee, createFromFile, exportEmployeesFile } from "../controllers/employeeController.js";
import upload from "../../../middleware/fileUpload.js";

const router = express.Router();

router.post('/create', createEmployee);

// Create employee from file
router.post('/create-from-file', upload.single("file"), createFromFile)

router.get('/all', getAllEmployees);
router.get('/all-export', exportEmployeesFile)

router.get('/single/:id', getSingleEmployee);
router.delete('/delete/:id', deleteEmployee);
router.patch('/update/:id', updateEmployee);

export default router;
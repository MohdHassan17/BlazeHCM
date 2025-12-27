import express from 'express';
import { runPayroll } from '../controllers/payrollController.js';

const router = express.Router();


router.post('/run-payroll', runPayroll);

export default router;
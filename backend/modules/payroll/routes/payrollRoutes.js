import express from 'express';
import { placeholder } from '../controllers/payrollController.js';

const router = express.Router();
router.get('/ping', placeholder);

export default router;
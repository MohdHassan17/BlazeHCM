import express from 'express';
import { createLeave, getAllLeaves, getLeaves, manageLeaves } from '../controllers/leaveController.js';

const router = express.Router();

router.post('/create/:id', createLeave);
router.get('/get/:id', getLeaves);
router.post('/manage', manageLeaves);
router.get('/getLeaves', getAllLeaves);

export default router;
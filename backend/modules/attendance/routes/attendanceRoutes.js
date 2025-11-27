import express from 'express';
import { markAttendance, getAttendanceByEmployee, getAttendanceTime, amendAttendance, manageAttendanceRequest } from '../controllers/attendanceController.js';

const router = express.Router();

router.post('/mark/:id', markAttendance);
router.post('/time/:id', getAttendanceTime);
router.get('/employee/:id', getAttendanceByEmployee);
router.post('/amend/:id', amendAttendance);
router.post('/manage/:id', manageAttendanceRequest);

export default router;
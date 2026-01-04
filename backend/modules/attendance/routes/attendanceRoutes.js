import express from 'express';
import { markAttendance, getAttendanceByEmployee, getAttendanceTime, amendAttendance, manageAttendanceRequest, attendanceFromFile } from '../controllers/attendanceController.js';
import upload from '../../../middleware/fileUpload.js';

const router = express.Router();

router.post('/mark/:employeeId', markAttendance);
router.post('/mark-from-file', upload.single("file"), attendanceFromFile)
router.post('/time/:id', getAttendanceTime);
router.get('/employee/:id', getAttendanceByEmployee);
router.post('/amend/:id', amendAttendance);
router.post('/manage/:id', manageAttendanceRequest);

export default router;
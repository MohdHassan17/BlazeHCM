import express from "express";
import {
  assignShift,
  createShift,
  createShiftException,
  deleteShift,
  getAllShifts,
  getSingleShift,
  updateShift,
} from "../controllers/shiftController.js";

const router = express.Router();


// Shift CRUD Routes
router.post("/create", createShift);
router.get("/all-shifts", getAllShifts);
router.delete("/delete-shift", deleteShift);
router.get("/single-shift/:id", getSingleShift);
router.patch("/update-shift/:id", updateShift)

// Shift Exception Routes
router.post("/create-exception", createShiftException);

// Shift Assignment Routes
router.patch("/assign-shift", assignShift)
export default router;

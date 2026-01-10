import { createNewRole, getRoles} from "../controller/authController.js";
import express from "express"

const router = express.Router()

//Sign-in Routes


// Role Routes 
router.post("/create-role", createNewRole)
router.get("/all-roles", getRoles)

export default router
import { createNewRole, getRoles, loginUserController} from "../controller/authController.js";
import { createNewUser } from "../controller/authController.js";
import express from "express"

const router = express.Router()


// Create User Routes (might only be used for testing purposes)
router.post("/create-user", createNewUser)

//Sign-in Routes
router.post('/login', loginUserController)


// Role Routes 
router.post("/create-role", createNewRole)
router.get("/all-roles", getRoles)

export default router
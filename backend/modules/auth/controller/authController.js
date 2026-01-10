import { createRole, getAllRoles } from "../../../services/auth/auth.service.js";
import UserRole from "../models/userRole.js";

// Role Controllers
export const createNewRole = async (req, res) => {
  const { name, permissions } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Name is required to create new role",
    });
  }

  try {
    const newRole = await createRole(name, permissions);

    return res.status(201).json({
      newRole,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRoles = async (req, res) => {
  try {

    const roles = await getAllRoles()

    return res.status(200).json({
        success: true,
        data: roles
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

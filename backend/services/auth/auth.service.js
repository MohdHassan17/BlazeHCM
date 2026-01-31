import bcrypt from "bcryptjs";
import User from "../../modules/auth/models/user.js";
import UserRole from "../../modules/auth/models/userRole.js";
import Employee from "../../modules/employee/models/employeeSchema.js";
import { signToken } from "../../utils/jwt.js";



// User Services



export const createUser = async ({ employee, role, email, password }) => {
  try {
    const newUser = new User({
      employee: employee,
      role: role,
      email: email,
      password: password,
    });

    await newUser.save();

    console.log(newUser)

    return { success: true, message: "User Created Successfully" };
  } catch (error) {
    return { sucess: false, message: error.message };
  }
};



export const getUserByEmployeeId = async (employeeId) => {
  try {
    const user = await User.findOne({ employee: employeeId }).populate("role").select("-password").lean();
    return user;
  } catch (error) {
    return { success: false, message: error.message };
  }
};


export const loginUser = async(email, password) => {
  try{

    const user = await User.findOne({ email: email }).populate(['role', 'employee']);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Compare password (assuming password is hashed)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, message: "Invalid password" };
    }

    const accessToken = signToken({ userId: user._id, employeeID: user.employee?.employeeId, email: user.email, permissions: user.role?.permissions });

    return { success: true, user, accessToken };  

  }catch(error){
    return { success: false, message: error.message };
  }
}

// Roles Services
export const createRole = async (name, permissions) => {
  try {
    const newRole = new UserRole({
      name: name,
      permissions: permissions,
    });

    await newRole.save();

    return {
      success: true,
      message: "Role Created Successfully",
      data: newRole,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getAllRoles = async () => {
  try {
    const roles = await UserRole.find();

    return roles
  } catch (error) {
    return { success: false, message: error.message };
  }
};

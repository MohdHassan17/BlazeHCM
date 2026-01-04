import User from "../../modules/auth/models/user";
import UserRole from "../../modules/auth/models/userRole";
import Employee from "../../modules/employee/models/employeeSchema";

export const createUser = async ({ employee, role, email, password }) => {
  try {
    const newUser = new User({
      employee: employee,
      role: role,
      email: email,
      password: password
    });

    await newUser.save()
    

    return {success :true, message: "User Created Successfully"}
  } catch (error) {
    return { sucess: false, message: error.message };
  }
};

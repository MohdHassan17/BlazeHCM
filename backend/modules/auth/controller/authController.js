import { createRole, createUser, getAllRoles, loginUser } from "../../../services/auth/auth.service.js";
import Employee from "../../employee/models/employeeSchema.js";


//* User Controllers 


//* Create User Controller (might only be used for testing purposes)
export const createNewUser = async (req,res) => {
  const {employeeID, role} = req.body;

  try{
    const employeeUser = await Employee.findById(employeeID)
    
    if(!employeeUser){
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const newEmployeeUser = await createUser({
      employee: employeeUser,
      role: role,
      email: employeeUser.email,
      password: req.body.password || "defaultPassword123"
    })

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newEmployeeUser
    })
  }
  catch(error){
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// * Login Controller 

export const loginUserController = async (req,res) => {
  const { email, password} = req.body

  try{

    const userLogin = await loginUser(email, password)

    // res.cookie('accessToken', userLogin.accessToken, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'lax',
    //   maxAge: 7 * 24 * 60 * 60 * 1000
    // })

    console.log(userLogin.accessToken)


    res.status(200).json({
      success: true,
      message: "User Logged In",
      accessToken: userLogin.accessToken,
      user: userLogin.user

    })

  }catch(error){
    res.status(500).json()
  }
}



//* Role Controllers
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

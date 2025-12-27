import Shift from "../models/shiftSchema.js";
import ShiftException from "../models/shiftException.js";
import Employee from "../../employee/models/employeeSchema.js";

//Shift Related Code

export const createShift = async (req, res) => {
  try {
    const newShift = new Shift({ ...req.body });
    await newShift.save();
    return res.status(201).json({
      success: true,
      message: "Shift created successfully",
      data: newShift,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating shift",
      error: error.message,
    });
  }
};

export const getAllShifts = async (req, res) => {
  try {
    const allShifts = await Shift.find();

    return res.status(200).json({
      success: true,
      message: "Shifts retrieved successfully",
      data: allShifts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching shifts",
      error: error.message,
    });
  }
};

export const getSingleShift = async (req, res) => {
  const { id } = req.params;

  const singleShift = await Shift.findById(id);

  if (!singleShift) {
    return res.status(404).json({
      success: false,
      message: "Selected shift has either been deleted or does not exist",
    });
  }

  try {
    return res.status(200).json({
      success: true,
      message: "Shift fetched successfully",
      data: singleShift,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Shift couldn't be fetched  ",
    });
  }
};

export const updateShift = async (req, res) => {
  const { id } = req.params;

  const shiftExists = await Shift.findById(id);

  if (!shiftExists) {
    return res.status(404).json({
      success: false,
      message:
        "Operation could not be performed because the shift does not exist",
    });
  }

  try {
    const updatedShift = await Shift.findByIdAndUpdate(id, { ...req.body }, {new: true});

    return res.status(200).json({
      success: true,
      message: "Shift was updated successfully",
      data: updatedShift,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "there was an error in processing your request",
    });
  }
};

export const deleteShift = async (req, res) => {
  const { id } = req.body;

  const shiftExists = await Shift.findById(id);

  if (!shiftExists) {
    return res.status(404).json({
      success: false,
      message: "Shift does not exist",
    });
  }

  try {
    const deleteShift = await Shift.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Shift Deleted",
      data: deleteShift,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "There was an error in processing your request",
    });
  }
};

// Shift Exception Related Logic
export const createShiftException = async (req, res) => {
  const { employee, date, shift } = req.body;

  if (!employee || !date || !shift) {
    return res.status(400).json({
      success: false,
      message: "Please provide all the details",
    });
  }

  const employeeExists = await Employee.findById(employee);
  const shiftExists = await Shift.findById(shift);

  if (!employeeExists || !shiftExists) {
    return res.status(400).json({
      success: false,
      message: "Employee or Shift does not exist",
    });
  }

  try {
    const newException = new ShiftException({
      employee: employee,
      date: new Date(date),
      shift: shift,
    });
    await newException.save();

    return res.status(201).json({
      success: true,
      message: "Shift exception created for the selected date",
      data: newException,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`

    });
  }
};


export const getShiftExceptionByQuery = async (req,res) => {

  const { employee, date} = req.body

  const employeeExists = await Employee.findById(employee)

  if(!employeeExists){
    return res.status(404).json({ 
      success: false,
      message: "Employee not found"
    })
  }

  try{
    const shiftException = await ShiftException.find({employee: employee})

    if(!shiftException) {
       return res.status(404).json({
      success: false,
      message: "Employee not found"
    })
    }

    return res.status(200).json({
      success: true,
      message: "Shift found",
      data: shiftException
    })
  
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`

    });
  }  
}

// Employee Shift Assignment Related Logic

export const assignShift = async (req, res) => {
  const { employeeId, shiftId } = req.body;

  const shiftExist = await Shift.findById(shiftId);

  if (!shiftExist) {
    return res.status(404).json({
      success: false,
      message: "Employee or Shift Does not Exist",
    });
  }

  //Normalizing the request

  let employeeList = Array.isArray(employeeId) ? employeeId : [employeeId];

  const assigner = async (employee) => {
    const employeeExist = await Employee.findById(employee);

    if (!employeeExist) {
      return {
        success: false,
        message: `Employee with id ${employee} not found`,
      };
    }

    if(employeeExist.shift && employeeExist.shift.toString() === shiftId){
      return {
        success: true,
        message: "Employee shift is already assigned to the selected shift",
        assignedEmployee: employeeExist,
      };
    }

    try {
      const assignedEmployee = await Employee.findByIdAndUpdate(employee, {
        shift: shiftId,
      } ,{new: true})

      return {
        success: true,
        message: "Employee shift was updated successfully",
        assignedEmployee,
      };
    } catch (error) {
      return {
        success: false,
        message: "Couldn't update the employee shift",
        employee,
      };
    }
  };
  try {
    const results = await Promise.allSettled(
      employeeList.map((employee) => assigner(employee))
    );

    const succeeded = results
      .filter((result) => result.status === "fulfilled" && result.value.success)
      .map((r) => r.value);
    const failed = results
      .filter(
        (result) => result.status === "fulfilled" && !result.value.success
      )
      .map((r) => r.value);

    return res.status(200).json({
      success: true,
      message: "Shift was assigned to the selected employees successfully",
      data: [succeeded, failed],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "There was an error in processing your request",
    });
  }
};

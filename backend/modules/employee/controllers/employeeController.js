import Employee from "../models/employeeSchema.js";
import Company from "../../company/models/companySchema.js";
import XLSX from "xlsx";
import employeeService from "../../../services/employee/employee.service.js";

export const createEmployee = async (req, res) => {
  try {
    const company = await Company.findOne({ companyID: 1 });
    if (!company)
      return res
        .status(404)
        .json({ success: false, message: "Company settings not found" });

    const leaveBalances = {
      casual: company.leaves.casual || 1,
      sick: company.leaves.sick || 1,
      annual: company.leaves.annual || 1,
    };

    const newEmployee = new Employee({ ...req.body, leaveBalances });
    await newEmployee.save();

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: newEmployee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating employee",
      error: error.message,
    });
  }
};

// ! Create Employees From File (CSV/Excel)

export const createFromFile = async (req, res) => {
  try {
    //* 1. Check if the file has even been uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    //* 2. Get result from the employee service
    const result = await employeeService.bulkImportEmployee(req.file.buffer);

    res.status(201).json({
      success: true,
      message: "Employees created sucessfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating employees from file",
      error: error.message,
    });
  }
};

export const getAllEmployees = async (req, res) => {
  try {
    const allEmployees = await Employee.find();
    // const allEmployees = await Employee.find().select("firstname lastname email designation dateOfJoining status");
    return res.status(200).json({
      success: true,
      message: "Employees retrieved successfully",
      data: allEmployees,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching employees",
      error: error.message,
    });
  }
};

// ! Export File in Excel

export const exportEmployeesFile = async (req, res) => {
  try {
    // * Using the employee service directly
    const excelBuffer = await employeeService.bulkExportEmployee();

    res.setHeader("Content-Disposition", "attachment; filename=employees.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(excelBuffer);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSingleEmployee = async (req, res) => {
  const id = req.params.id;
  try {
    const employee = await Employee.findById(id);
    if (!employee)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    return res.status(200).json({
      success: true,
      message: "Employee retrieved successfully",
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching employee",
      error: error.message,
    });
  }
};

export const deleteEmployee = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(id);
    if (!deletedEmployee)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
      data: deletedEmployee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting employee",
      error: error.message,
    });
  }
};

export const updateEmployee = async (req, res) => {
  const id = req.params.id;
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedEmployee)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating employee",
      error: error.message,
    });
  }
};

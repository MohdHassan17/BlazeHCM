
import payrollService from "../../../services/payroll/payroll.service.js"
import employeeService from "../../../services/employee/employee.service.js";

export const runPayroll = async (req, res) => {
  const { payrollMonth, payrollYear = 2025 } = req.body;

  try {
    const period = {
      startDate: new Date(Date.UTC(payrollYear, payrollMonth - 1, 1, 0, 0, 0)), // Nov 1, 00:00 UTC
      endDate: new Date(Date.UTC(payrollYear, payrollMonth, 0, 23, 59, 59)),
    };

    const eligibleEmployees = await  employeeService.eligibleEmployees(period) 

    for(let employee of eligibleEmployees){
     
      await payrollService.createPayroll(period, employee._id);
      

    }

    return res.status(200).json({
      success: true,
      message: "Payroll processed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error processing payroll",
      error: error.message
    });
  }
};
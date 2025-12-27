import Employee from "../../modules/employee/models/employeeSchema.js";
import Payroll from "../../modules/payroll/models/PayrollSchema.js";
import attendanceService from "../attendance/attendance.service.js";

const PAY_FACTORS = {
  Present: 1,
  Late: 1,
  Leave: 1,
  HalfDay: 0.5,
  ShortHours: 0.5,
  Absent: 0,
};

const getPayableDays = (workingDays, attendanceSummary) => {
  try {
    let payableDays = 0;


    for (let key in attendanceSummary) {
      let { count, status } = attendanceSummary[key];
      

      if (PAY_FACTORS[status] !== undefined) {
        payableDays += PAY_FACTORS[status] * count;
      }
    }


    // Do not exceed working days
    payableDays = Math.min(payableDays, workingDays);

    return payableDays;
  } catch (error) {
    throw new Error("Error in getting payable days: " + error.message);
  }
};

// TODO: This function should return grossEarnings, totalDeductions, netPay
const calculateSalary = async (
  employee,
  payableDays,
  workingDays,
  attendanceSummary
) => {

  try {
    //* 1. Build the Basic Earnings Structure

    const emp = await Employee.findById(employee._id);

    const earningComponents = [
      {
        name: "Basic Salary",
        code: "BASIC",
        type: "earning",
        amountType: "fixed",
        value: emp.salary.basic,
      },
      {
        name: "Home Allowance",
        code: "ALLOWANCE",
        type: "earning",
        amountType: "fixed",
        value: emp.salary.homeAllowance,
      },
      {
        name: "Medical Allowance",
        code: "ALLOWANCE",
        type: "earning",
        amountType: "fixed",
        value: emp.salary.medicalAllowance,
      },
      {
        name: "Utility Allowance",
        code: "ALLOWANCE",
        type: "earning",
        amountType: "fixed",
        value: emp.salary.utilityAllowance,
      },
    ];

    //* 2. Calculate the Gross Earnings from Earnings Structure Created

    const grossEarnings = earningComponents.reduce((acc, curr) => {
      acc = acc + curr.value
      return acc 
    },0);


    //* 3. Daily wage by dividing grossEarnings by the workingDays
    const dailyWage = grossEarnings / workingDays;

    //* 4. Build the Deduction Components using the daily wage calculated earlier
    const deductionComponents = [
      {
        name: "Absent Deduction",
        code: "DEDUCTION",
        type: "deduction",
        amountType: "fixed",
        value: (attendanceSummary.Absent || 0) * PAY_FACTORS.Absent * dailyWage,
      },
      {
        name: "Half Deduction",
        code: "DEDUCTION",
        type: "deduction",
        amountType: "fixed",
        value: (attendanceSummary.HalfDay || 0) * PAY_FACTORS.HalfDay * dailyWage,
      },
    ];

    //* 5. Derive Total Deductions

    const totalDeductions = deductionComponents.reduce((acc, curr) => {
      acc = acc + curr.value
      return acc;
    }, 0);

    
    //* 6. Combine both the salary components
    const salaryComponents = [...earningComponents, ...deductionComponents];

    //* 7. Net Pay subtracting earnings from the deductions
    const netPay = dailyWage * payableDays;

    
    return {
      salaryComponents,
      grossEarnings,
      totalDeductions,
      netPay,
    };
  } catch (error) {
    throw new Error("Error in calculating salary: " + error.message);
  }
};

const createPayroll = async (period, employee) => {
  try {
    //* 1. Getting the working days of the employee to pass it into the functions ahead
    const workingDays = await attendanceService.getWorkingDays(
      period,
      employee
    ); // Getting all the working days of the employee which will be passed to getPayableDays() and stored in the Payroll Document
    //* 2. Getting the attendance summary of the employee for calculating payable days as well as deriving the payroll components structure
    const attendanceSummary = await attendanceService.getAttendanceSummary(
      period,
      employee
    );

    //* 3. Get Payable Days
    const payableDays = getPayableDays(workingDays, attendanceSummary);

    //* 4. Calculate Salary

    const {salaryComponents, grossEarnings, totalDeductions, netPay} = await calculateSalary(
      employee,
      payableDays,
      workingDays,
      attendanceSummary
    );
    console.log("Salary Components in Payroll Service: ", salaryComponents);

    //* 5. Create Payroll Document
    const payroll = await Payroll.create({
      employeeId: employee._id,
      salaryMonth: period.startDate.getMonth() + 1,
      salaryYear: period.startDate.getFullYear(),
      components: salaryComponents,
      attendanceSummary: {
        totalWorkingDays: workingDays,
        daysPresent: attendanceSummary.Present || 0,
        daysAbsent: attendanceSummary.Absent || 0,
        leavesTaken: attendanceSummary.Leave || 0,
      },
      totals: { grossEarnings, totalDeductions, netPay },
      status: "processed",
    });
    return payroll;
  } catch (error) {
    throw new Error("There was an error in processing your request" + error.message);
  }
};

export default { getPayableDays, createPayroll };

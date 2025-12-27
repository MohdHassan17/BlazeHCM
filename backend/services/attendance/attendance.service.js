import Attendance from "../../modules/attendance/models/attendanceSchema.js";
import Employee from "../../modules/employee/models/employeeSchema.js";


//TODO: Attendance Import Service (Later to be used with a custom sync-app with ZKT Systems)

const createAttendance = async (buffer) => {

}

//? Payroll Service functions related to Attendance

const getWorkingDays = async (period, employeeId) => {
  try {
    const { startDate } = period;

    // Fetch employee and their shift (async)
    const employee = await Employee.findById(employeeId).populate("shift");
    const offDays = employee.shift?.offDays || [];

    const year = startDate.getUTCFullYear();
    const month = startDate.getUTCMonth();

    // Get last day of month
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    let workingDays = 0;

    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(Date.UTC(year, month, day));
      const dayOfWeek = date.getUTCDay();
      if (!offDays.includes(dayOfWeek)) {
        workingDays++;
      }
    }

    console.log("Working Days: ", workingDays);
    return workingDays;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getAttendanceSummary = async (period, employee) => {
  try { 
    const {startDate, endDate} = period; 


    const attendanceSummary = await Attendance.aggregate([
      {$match: {
        employee : employee,
        createdAt : {$gte: startDate, $lte: endDate}
      }},
      {
        $group: {
          _id: "$status",
          count: {$sum: 1}
        }
      },
      { $project : {
        _id: 0,
        status: "$_id",
        count: 1
      }}
    ])


    console.log("Attendance Summary: ", attendanceSummary);

    
    return attendanceSummary
  }
  catch (error){
    throw new Error("Error processing attendance summary : " + error.message)
  }
};

export default { getWorkingDays, getAttendanceSummary };

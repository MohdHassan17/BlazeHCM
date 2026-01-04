import Attendance from "../../modules/attendance/models/attendanceSchema.js";
import Employee from "../../modules/employee/models/employeeSchema.js";
import ShiftException from "../../modules/shift/models/shiftException.js";
import XLSX from 'xlsx'

//TODO: Attendance Import Service (Later to be used with a custom sync-app with ZKT Systems)

const createAttendance = async (employeeId, punchTime) => {
  const employee = await Employee.findOne({employeeId: employeeId}).populate("shift");

  console.log(employeeId, punchTime)

  if (!employee) {
    return {
      success: false,
      statusCode: 404,
      message: "Employee not found",
    };
  }

  if (!punchTime) {
    return {
      success: false,
      statusCode: 400,
      message: "Punch time is required",
    };
  }

  const punchDate = new Date(punchTime);

  console.log(punchDate)

  console.log(punchDate)
  if (isNaN(punchDate.getTime())) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid punch time format",
    };
  }

  try {
    //?Helper: convert a time string "HH:mm" or "HH:mm:ss" into a Date on the same day as `baseDate`
    const timeStringToDateOnDay = (baseDate, timeString) => {
      const parts = (timeString || "").split(":").map(Number);
      const hours = parts[0] || 0;
      const minutes = parts[1] || 0;
      const d = new Date(baseDate);
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    //* 1.  Getting the Shift Start Time, End Time, and Work Hours For validating the final status of the attendance

    const shiftStartDate = timeStringToDateOnDay(
      punchDate,
      employee.shift?.startTime || "00:00"
    );
    const shiftEndDate = timeStringToDateOnDay(
      punchDate,
      employee.shift?.endTime || "23:59"
    );
    const workingHours = employee.shift?.workingHours;
    const graceMinutes =
      typeof employee.shift?.graceMinutes === "number"
        ? employee.shift.graceMinutes
        : 0;

    //* 2. Evaluating the work hours: shiftStartTime + graceMinutes
    const allowedStart = new Date(shiftStartDate);
    if (graceMinutes > 0)
      allowedStart.setMinutes(allowedStart.getMinutes() + graceMinutes);

    // console.log(
    //   shiftStartDate.toTimeString(),
    //   shiftEndDate.toTimeString(),
    //   "allowedStart:",
    //   allowedStart.toTimeString()
    // );
    //* 3. Setting the start and end of day (UTC) to evaluate attendance creation in later stages
    const startOfDay = new Date(punchDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(punchDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // console.log("Start and end ", startOfDay, endOfDay);

    //* 4. Checking if any shift exception is assigned to any employee
    const startOfExceptionDay = new Date(punchDate);
    startOfExceptionDay.setUTCHours(0, 0, 0, 0);

    const endOfExceptionDay = new Date(punchDate);
    endOfExceptionDay.setUTCHours(23, 59, 59, 999);

    //* 5. Deriving Shift Exception Start Time, Late Time etc. (similar to a normal shift)

    const shiftException = await ShiftException.findOne({
      employee: employee._id,
      date: startOfExceptionDay,
    }).populate("shift");

    // Safely derive exception shift values (may be null if no exception)
    const exceptionLateAfter = shiftException?.shift?.lateAfter
      ? timeStringToDateOnDay(punchDate, shiftException.shift.startTime)
      : null;

    const exceptionWorkingHours =
      typeof shiftException?.shift?.workingHours === "number"
        ? shiftException?.shift?.workingHours
        : null;

    const exceptionGraceMinutes =
      typeof shiftException?.shift?.graceMinutes === "number"
        ? shiftException?.shift?.graceMinutes
        : 0;

    // exceptionAllowedStart = exception start + exception grace (if any)
    const exceptionAllowedStart = exceptionLateAfter
      ? new Date(exceptionLateAfter)
      : null;
    if (exceptionAllowedStart && exceptionGraceMinutes > 0) {
      exceptionAllowedStart.setMinutes(
        exceptionAllowedStart.getMinutes() + exceptionGraceMinutes
      );
    }

    console.log(
      exceptionLateAfter,
      exceptionAllowedStart,
      shiftException?.shift?.lateAfter
    );

    // debug
    // console.log("shiftException present:" , shiftException);
    // console.log(
    //   "shiftAllowedStart:",
    //   allowedStart.toTimeString(),
    //   "exceptionAllowedStart:",
    //   exceptionAllowedStart ? exceptionAllowedStart.toTimeString() : "N/A"
    // );
    //! Start of Marking Attendance
    let attendance = await Attendance.findOne({
      employee: employee._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });


    console.log(attendance)

    //*6. If check-in exists, check if checkout exists and if not mark checkout, otherwise, return that attendance already exists
    if (attendance) {
      if (attendance.checkInTime && !attendance.checkOutTime) {
        if (punchDate <= attendance.checkInTime) {
          return {
            success: false,
            statusCode: 400,
            message: "Checkout time must be after check-in time",
          };
        }

        const workedHours =
          (punchDate - attendance.checkInTime) / (1000 * 60 * 60);

        // If the Shift Exception exists, then use the exception shift timings to validate the attendance status
        let status; // Initializing a common status to be used based on Shift Exception existence

        if (shiftException) {
          if (typeof exceptionWorkingHours === "number") {
            if (workedHours < exceptionWorkingHours) {
              status = "Short Hours";
              console.log("Short Hours marked based on Exception");
            }
          }
        } else {
          if (typeof workingHours === "number") {
            if (workedHours < workingHours) {
              status = "Short Hours";
              console.log("Calculated based on default shift hours");
            }
          }
        }

        if (status) attendance.status = status;
        attendance.checkOutTime = punchDate;
        // persist total hours for later reporting
        attendance.totalHours = workedHours;
        await attendance.save();

        return {
          success: true,
          statusCode: 200,
          message: `Checkout marked successfully ${attendance.totalHours.toFixed(
            2
          )} hours worked today`,
          data: attendance,
        };
      }

      if (attendance.checkInTime && attendance.checkOutTime) {
        return {
          success: false,
          statusCode: 400,
          message: "Attendance already marked for today",
        };
      }
    } else {
      //* 7. In case of fresh-attendance Determine status based on shift timings and grace period and mark check-in
      let status;

      // Compare punchTime with allowedStart (shift start + grace)
      const compareAllowedStart = exceptionAllowedStart || allowedStart;
      status = punchDate > compareAllowedStart ? "Late" : "Present";
      console.log(exceptionAllowedStart);
      console.log(status);
      const newAttendance = new Attendance({
        employee: employee._id,
        status: status,
        checkInTime: punchDate,
        date: endOfDay,
      });
      await newAttendance.save();
      return {
        success: true,
        statusCode: 201,
        message: "Check-in marked successfully",
        data: newAttendance,
      };
    }
  } catch (error) {
    return { success: false, message: `${error.message}` };
  }
};

const bulkAttendance = async (buffer) => {

  try{

    // * 1. Reading XLSX File 
    const workbook = XLSX.read(buffer, {type: "buffer"})
    const sheetName = workbook.SheetNames[0]
    const workSheet = workbook.Sheets[sheetName]


    // *2. Converting the sheet to JSON
    const rows = XLSX.utils.sheet_to_json(workSheet)


    //* 3. Mapping the data to our format

    const attendanceEntries = rows.map((entry) => ({
      employee: entry["Punch Code"], 
      punchTime: entry["Punch Time"]
      
    }))

    //* 4. Processing all attendance entries

    let succeeded = [];
    let failed = [];
    
    for(let entry of attendanceEntries){
      if(!entry.employee || !entry.punchTime){
        failed.push({
          message: " Employee Code or Time is not defined"
        })
      }

      try{
        const result = await createAttendance(entry.employee, entry.punchTime)
         
        
        if(result.success){
          succeeded.push({ punchCode: entry.employee, ...result})
        }else{
          failed.push({punchCode: entry.employee, message: result.message})
        }




      }catch (error){

        failed.push({
          ...entry,
          message: error.message
        })

      }
    }
    
    // const result = await Promise.allSettled(attendanceEntries.map((entry) => createAttendance(entry.employee, entry.punchTime)))

    //* 5. Separating succeeded and failed results
    // const succeeded = result
    //   .map((item, index) => {
    //     if (item.status === "fulfilled" && item.value.success) {
    //       return {
    //         punchCode: attendanceEntries[index].employee,
    //         ...item.value,
    //       };
    //     }
    //     return null;
    //   })
    //   .filter((item) => item !== null);

    // const failed = result
    //   .map((item, index) => {
    //     if (item.status === "rejected") {
    //       return {
    //         punchCode: attendanceEntries[index].employee,
    //         error: item.reason?.message || "Unknown error",
    //       };
    //     }
    //     if (item.status === "fulfilled" && !item.value.success) {
    //       return {
    //         punchCode: attendanceEntries[index].employee,
    //         attendanceEntry: attendanceEntries[index],
    //         error: item.value.message,
    //       };
    //     }
    //     return null;
    //   })
    //   .filter((item) => item !== null);

    return {
      success: failed.length === 0 ,
      statusCode: 200,
      message: `Processed ${succeeded.length} successful, ${failed.length} failed out of ${attendanceEntries.length} entries`,
      data: {
        total: attendanceEntries.length,
        succeededCount: succeeded.length,
        failedCount: failed.length,
        details: {
          succeeded,
          failed,
        },
      },
    }

  }catch(error){
    return {
      success: false,
      message: `${error.message}`
    }
  }
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
    const { startDate, endDate } = period;

    const attendanceSummary = await Attendance.aggregate([
      {
        $match: {
          employee: employee,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);

    console.log("Attendance Summary: ", attendanceSummary);

    return attendanceSummary;
  } catch (error) {
    throw new Error("Error processing attendance summary : " + error.message);
  }
};

export default { createAttendance, getWorkingDays, getAttendanceSummary, bulkAttendance };

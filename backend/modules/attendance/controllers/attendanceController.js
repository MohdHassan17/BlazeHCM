import Attendance from "../models/attendanceSchema.js";
import Employee from "../../employee/models/employeeSchema.js";
import AttendanceRequest from "../models/attendanceRequestSchema.js";

// Marks attendance (check-in/check-out) for an employee
export const markAttendance = async (req, res) => {
  const id = req.params.id;
  const { punchTime } = req.body;

  const employee = await Employee.findById(id).populate("shift");

  if (!employee) {
    return res
      .status(404)
      .json({ success: false, message: "Employee not found" });
  }

  if (!punchTime) {
    return res
      .status(400)
      .json({ success: false, message: "Punch time is required" });
  }

  const punchDate = new Date(punchTime);
  if (isNaN(punchDate.getTime())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid punch time format" });
  }

  try {
    // Helper: convert a time string "HH:mm" or "HH:mm:ss" into a Date on the same day as `baseDate`
    const timeStringToDateOnDay = (baseDate, timeString) => {
      const parts = (timeString || "").split(":").map(Number);
      const hours = parts[0] || 0;
      const minutes = parts[1] || 0;
      const d = new Date(baseDate);
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    // Getting the Shift Start Time, End Time, and Work Hours For validating the final status of the attendance
    const shiftStartDate = timeStringToDateOnDay(punchDate, employee.shift?.startTime || "00:00");
    const shiftEndDate = timeStringToDateOnDay(punchDate, employee.shift?.endTime || "23:59");
    const workingHours = employee.shift?.workingHours;
    const graceMinutes = typeof employee.shift?.graceMinutes === 'number' ? employee.shift.graceMinutes : 0;

    // allowedStart = shift start + grace (if any)
    const allowedStart = new Date(shiftStartDate);
    if (graceMinutes > 0) allowedStart.setMinutes(allowedStart.getMinutes() + graceMinutes);

    console.log(shiftStartDate.toTimeString(), shiftEndDate.toTimeString(), 'allowedStart:', allowedStart.toTimeString());



    const startOfDay = new Date(punchDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(punchDate);
    endOfDay.setHours(23, 59, 59, 999);

    let attendance = await Attendance.findOne({
      employee: id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (attendance) {
      if (attendance.checkInTime && !attendance.checkOutTime) {
        if (punchDate <= attendance.checkInTime) {
          return res.status(400).json({
            success: false,
            message: "Checkout time must be after check-in time",
          });
        }

        const workedHours = (punchDate - attendance.checkInTime) / (1000 * 60 * 60);

        if (workedHours < workingHours) {
          attendance.status = "Short Hours";
        }

        attendance.checkOutTime = punchDate;
        // persist total hours for later reporting
        attendance.totalHours = workedHours;
        await attendance.save();

        return res.status(200).json({
          success: true,
          message: `Checkout marked successfully ${attendance.totalHours.toFixed(2)} hours worked today`,
          data: attendance,
        });
      }

      if (attendance.checkInTime && attendance.checkOutTime) {
        return res.status(400).json({
          success: false,
          message: "Attendance already marked for today",
        });
      }
    } else {

      let status;

      // Compare punchTime with allowedStart (shift start + grace)
      if (punchDate > allowedStart) {
        status = "Late";
      } else {
        status = "Present";
      }
      console.log(status)
      const newAttendance = new Attendance({
        employee: id,
        status: status,
        checkInTime: punchDate,
        date: new Date(punchDate),
      });
      await newAttendance.save();
      return res.status(201).json({
        success: true,
        message: "Check-in marked successfully",
        data: newAttendance,
      });
    }
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "There was an error in marking attendance",
      error: e.message,
    });
  }
};

export const getAttendanceTime = async (req, res) => {
  const id = req.params.id;
  const { date } = req.body;
  try {
    const employee = await Employee.findById(id);
    if (!employee)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const attendanceRecord = await Attendance.findOne({
      employee: id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!attendanceRecord)
      return res
        .status(404)
        .json({ success: false, message: ["Attendance Not Found"] });

    return res.status(200).json({ success: true, data: attendanceRecord });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const amendAttendance = async (req, res) => {
  const id = req.params.id;
  const { date, checkInTime, checkOutTime, message } = req.body;

  if (!date || !checkInTime || !checkOutTime) {
    return res.status(400).json({
      success: false,
      message: "Date, check-in time, and check-out time are required",
    });
  }

  const checkIn = new Date(checkInTime);
  const checkOut = new Date(checkOutTime);
  const requestDate = new Date(date);

  if (
    isNaN(checkIn.getTime()) ||
    isNaN(checkOut.getTime()) ||
    isNaN(requestDate.getTime())
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid date format provided" });
  }

  if (checkIn >= checkOut) {
    return res.status(400).json({
      success: false,
      message: "Check-in time must be before check-out time",
    });
  } 

  try {
    const employee = await Employee.findById(id);
    if (!employee)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingRequest = await AttendanceRequest.findOne({
      date: { $gte: startOfDay, $lte: endOfDay },
      employee: id,
    });
    if (existingRequest)
      return res
        .status(400)
        .json({ success: false, message: "Request Already Exists" });

    const newAttendanceRequest = new AttendanceRequest({
      employee: id,
      date: date,
      checkInTime: checkInTime,
      checkOutTime: checkOutTime,
      status: "pending",
      message: message,
    });
    await newAttendanceRequest.save();

    return res.status(201).json({
      success: true,
      message: "New Request Created Successfully",
      data: newAttendanceRequest,
    });
  } catch (error) {
    return res.status(500).json({ success: "false", message: error.message });
  }
};

export const manageAttendanceRequest = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Request ID is required" });

  const requestIDs = Array.isArray(id) ? id : [id];

  const processAttendanceRequest = async (requestID) => {
    try {
      const attendanceRequest = await AttendanceRequest.findById(requestID);
      if (!attendanceRequest)
        return {
          status: "failed",
          message: "The request does not exist in system",
        };

      const startOfDay = new Date(attendanceRequest.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(attendanceRequest.date);
      endOfDay.setHours(23, 59, 59, 999);

      switch (action) {
        case "approve":
          let attendance = await Attendance.findOne({
            employee: attendanceRequest.employee,
            date: { $gte: startOfDay, $lte: endOfDay },
          });
          if (!attendance) {
            attendance = new Attendance({
              employee: attendanceRequest.employee,
              date: attendanceRequest.date,
              status: "Present",
            });
          }

          attendance.checkInTime = attendanceRequest.checkInTime;
          attendance.checkOutTime = attendanceRequest.checkOutTime;
          attendance.totalHours =
            (new Date(attendanceRequest.checkOutTime) -
              new Date(attendanceRequest.checkInTime)) /
            (1000 * 60 * 60);

          await attendance.save();
          attendanceRequest.status = "approved";
          await attendanceRequest.save();
          return {
            status: "success",
            message: "Attendance request approved",
            data: attendance,
          };

        case "reject":
          attendanceRequest.status = "rejected";
          await attendanceRequest.save();
          return {
            status: "success",
            message: "Attendance request rejected",
            data: attendanceRequest,
          };

        default:
          return {
            status: "failed",
            message: "Invalid action. Use 'approve' or 'reject'",
          };
      }
    } catch (error) {
      return { status: "failed", message: error.message };
    }
  };

  try {
    const results = await Promise.allSettled(
      requestIDs.map((requestID) => processAttendanceRequest(requestID))
    );

    if (!Array.isArray(id)) {
      const result = results[0];
      if (result.status === "fulfilled" && result.value.status === "success") {
        return res
          .status(200)
          .json({ success: true, message: result.value.message });
      } else {
        return res
          .status(400)
          .json({ success: false, message: result.value.message });
      }
    }

    const succeeded = results.filter(
      (r) => r.status === "fulfilled" && r.value.status === "success"
    );
    const failed = results.filter(
      (r) => r.status === "fulfilled" && r.value.status === "failed"
    );

    return res.status(succeeded.length > 0 ? 200 : 400).json({
      success: succeeded.length > 0,
      message: `Processed ${succeeded.length} out of ${results.length} requests successfully`,
      results: {
        succeeded: succeeded.map((r) => r.value),
        failed: failed.map((r) => r.value),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "There was an error in processing your request",
    });
  }
};

export const getAttendanceByEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await Employee.findById(id);
    if (!employee)
      return res
        .status(404)
        .json({ success: false, message: "Employee Not found" });

    const attendanceRecords = await Attendance.find({ employee: employee });
    if (!attendanceRecords)
      return res.status(404).json({
        success: false,
        message: "There was an error in fetching the attendance",
      });

    return res.status(200).json({
      success: true,
      message: "Attendance Fetched",
      data: attendanceRecords,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "There was an error in processing your request",
    });
  }
};

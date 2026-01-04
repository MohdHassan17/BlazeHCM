import Attendance from "../models/attendanceSchema.js";
import Employee from "../../employee/models/employeeSchema.js";
import AttendanceRequest from "../models/attendanceRequestSchema.js";
import attendanceService from "../../../services/attendance/attendance.service.js";


//Marks attendance (check-in/check-out) for an employee
export const markAttendance = async (req, res) => {
  const employeeId = req.params.employeeId;
  const { punchTime } = req.body;



  try {
    const result = await attendanceService.createAttendance(employeeId, punchTime);
    if (!result.success) {
      return res.status(result.statusCode).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "There was an error in marking attendance",
      error: e.message,
    });
  }
};

// Mark Attendance From File (Bulk Upload)
export const attendanceFromFile = async (req, res) => {


  try{


    //* 1. Check if the file even exists 

    if(!req.file){
      return res.status(400).json({
        success: false,
        message: "File has not been uploaded"
      })
    }

    //* 2. Pass the file to service

    const result = await attendanceService.bulkAttendance(req.file.buffer)

    // Return the service result to the client
    if (!result.success) {
      return res.status(result.statusCode || 400).json({
        success: false,
        message: result.message,
        data: result.data,
      });
    }

    return res.status(result.statusCode || 200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  }catch (error){
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


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
    const employee = await Employee.findOne({employeeId: id});
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

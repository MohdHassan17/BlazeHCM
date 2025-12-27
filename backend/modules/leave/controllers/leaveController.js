import Employee from "../../employee/models/employeeSchema.js";
import Leave from "../models/leaveSchema.js";

export const createLeave = async (req, res) => {
  const employeeId = req.params.id;
  const { startDate, endDate, leaveType, message } = req.body;

  try {
    if (!startDate || !endDate || !leaveType)
      return res
        .status(400)
        .json({
          success: false,
          message: "Start date, end date, and leave type are required",
        });

    const validLeaveTypes = ["sick", "casual", "annual"];
    if (!validLeaveTypes.includes(leaveType))
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid leave type. Must be sick, casual, or annual",
        });

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()))
      return res
        .status(400)
        .json({ success: false, message: "Invalid date format" });
    if (start > end)
      return res
        .status(400)
        .json({
          success: false,
          message: "Start date cannot be after end date",
        });

    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });

    const diff = end - start;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;

    if (
      employee.leaveBalances[leaveType] <= 0 ||
      days > employee.leaveBalances[leaveType]
    )
      return res
        .status(400)
        .json({
          success: false,
          message: `Insufficient ${leaveType} leave balance. Required: ${days}, Available: ${employee.leaveBalances[leaveType]}`,
        });

    const newLeave = new Leave({
      employee: employeeId,
      startDate,
      endDate,
      leaveType,
      message,
      approvalStatus: "pending",
    });
    await newLeave.save();

    const leaveBalances = {
      ...employee.leaveBalances,
      [leaveType]: employee.leaveBalances[leaveType] - days,
    };
    await Employee.findByIdAndUpdate(
      employeeId,
      { $set: { leaveBalances } },
      { new: true }
    );

    return res
      .status(201)
      .json({
        success: true,
        message: "Leave request created successfully",
        data: { leave: newLeave, updatedBalance: leaveBalances },
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error creating leave request",
        error: error.message,
      });
  }
};

export const getAllLeaves = async (req, res) => {
  const { status, type } = req.query;
  let filter = {};
  if (status) filter.approvalStatus = status;
  if (type) filter.leaveType = type;

  try {
    const leaves = await Leave.find(filter).populate(
      "employee",
      "firstname lastname email designation"
    );
    return res
      .status(200)
      .json({
        success: true,
        message: "Leaves retrieved successfully",
        data: leaves,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error fetching leaves",
        error: error.message,
      });
  }
};

export const getLeaves = async (req, res) => {
  const employeeId = req.params.id;
  try {
    const leaves = await Leave.find({ employee: employeeId });
    if (!leaves)
      return res
        .status(404)
        .json({ message: "No leaves found for the selected employee" });
    return res.status(200).json(leaves);
  } catch (e) {
    return res
      .status(500)
      .json({ error: e, message: "There was an error in fetching leaves" });
  }
};

export const manageLeaves = async (req, res) => {
  const leaveId = req.body.id;
  const action = req.body.action;

  if (!leaveId)
    return res
      .status(400)
      .json({ success: false, message: "Leave ID is required" });
  if (!action)
    return res
      .status(400)
      .json({ success: false, message: "Action is required" });

  const leaveIds = Array.isArray(leaveId) ? leaveId : [leaveId];

  const processLeave = async (id) => {
    try {
      const leave = await Leave.findById(id);
      if (!leave) return { status: "failed", message: "Leave not found" };

      const leaveRefunder = async () => {
        const employee = await Employee.findById(leave.employee);
        const diff = new Date(leave.endDate) - new Date(leave.startDate);
        const days = diff / (1000 * 60 * 60 * 24) + 1;
        const leaveBalances = {
          ...employee.leaveBalances,
          [leave.leaveType]: employee.leaveBalances[leave.leaveType] + days,
        };
        return await Employee.findByIdAndUpdate(
          leave.employee,
          { $set: { leaveBalances } },
          { new: true }
        );
      };

      switch (action) {
        case "manager_approve":
          if (leave.approvalStatus !== "pending")
            return {
              status: "failed",
              message: "Leave can only be manager approved when pending",
            };
          leave.approvalStatus = "manager_approved";
          await leave.save();
          return {
            status: "success",
            message: "Leave approved by manager",
            leave,
          };

        case "hr_approve":
          if (leave.approvalStatus !== "manager_approved")
            return {
              status: "failed",
              message: "Leave can only be HR approved after manager approval",
            };
          leave.approvalStatus = "hr_approved";
          await leave.save();
          return { status: "success", message: "Leave approved by HR", leave };

        case "reject":
          if (!["pending", "manager_approved"].includes(leave.approvalStatus))
            return {
              status: "failed",
              message:
                "Leave can only be rejected when pending or manager approved",
            };
          const updatedEmployeeReject = await leaveRefunder();
          leave.approvalStatus = "rejected";
          await leave.save();
          return {
            status: "success",
            message: "Leave rejected and balance refunded",
            leave,
            updatedBalance: updatedEmployeeReject.leaveBalances,
          };

        case "cancel":
          if (leave.approvalStatus !== "pending")
            return {
              status: "failed",
              message: "Leave can only be cancelled when in pending state",
            };
          const updatedEmployeeCancel = await leaveRefunder();
          leave.approvalStatus = "cancelled";
          await leave.save();
          return {
            status: "success",
            message: "Leave cancelled and balance refunded",
            leave,
            updatedBalance: updatedEmployeeCancel.leaveBalances,
          };

        default:
          return { status: "failed", message: "Invalid action" };
      }
    } catch (error) {
      return {
        status: "error",
        message: "Error processing leave",
        error: error.message,
        leaveId: id,
      };
    }
  };

  try {
    const results = await Promise.allSettled(leaveIds.map(processLeave));
    if (!Array.isArray(leaveId)) {
      const result = results[0];
      if (result.status === "fulfilled" && result.value.status === "success")
        return res
          .status(200)
          .json({ success: true, message: result.value.message });
      else
        return res
          .status(400)
          .json({ success: false, message: result.value.message });
    }

    const succeeded = results.filter(
      (r) => r.status === "fulfilled" && r.value.status === "success"
    ).length;
    return res
      .status(200)
      .json({
        success: true,
        message: `Successfully p rocessed ${succeeded} out of ${results.length} leaves`,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "There was an error processing leaves",
        error: error.message,
      });
  }
};

import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  leaveType: { type: String, enum: ["casual", "sick", "annual"], required: true },
  message: { type: String },
  approvalStatus: { type: String, enum: ["pending", "manager_approved", "hr_approved", "rejected", "cancel"], default: "pending" }
}, { timestamps: true });

const Leave = mongoose.model("Leave", leaveSchema);
export default Leave;
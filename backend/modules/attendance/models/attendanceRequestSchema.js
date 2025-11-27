import mongoose from "mongoose";

const attendanceRequestSchema = mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: { type: Date, required: true },
    checkInTime: { type: Date, required: true },
    checkOutTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "hr_approved", "rejected", "approved"],
      required: true,
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const AttendanceRequest = mongoose.model("AttendanceRequest", attendanceRequestSchema);

export default AttendanceRequest;
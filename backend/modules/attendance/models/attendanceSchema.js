import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "HalfDay", "ShortHours"],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.virtual("totalHours").get(function () {
  if (this.checkInTime && this.checkOutTime) {
    const diffMs = this.checkOutTime - this.checkInTime;
    const diffHrs = diffMs / (1000 * 60 * 60);
    return Math.round(diffHrs * 100) / 100;
  }
  return 0;
});

attendanceSchema.set("toJSON", { virtuals: true });
attendanceSchema.set("toObject", { virtuals: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
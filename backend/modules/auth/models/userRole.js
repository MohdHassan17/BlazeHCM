import mongoose from "mongoose";

const userRole = new mongoose.Schema(
  {
    name: { type: String, required: true },
    permissions: {
      manageSelf: { type: Boolean, default: true },
      manageEmployee: { type: Boolean, default: false },
      manageAttendance: { type: Boolean, default: false },
      managePayroll: { type: Boolean, default: false },
      manageLeaves: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const UserRole = mongoose.model("UserRole", userRole);

export default UserRole;

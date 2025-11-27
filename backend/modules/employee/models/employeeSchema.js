import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    date_of_birth: { type: Date, required: true },
    gender: { type: String, required: true },

    employeeId: { type: String, required: true, unique: true },
    designation: { type: String },
    dateOfJoining: { type: Date, default: Date.now },


    shift: { type: mongoose.Schema.Types.ObjectId, ref: "Shift" },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Resigned", "Terminated"],
      default: "Active",
    },
    employmentType: { type: String, enum: ["Probation", "Permanent", "Contract"], default: "Probation" },

    documents: { cnic: { type: String }, contract: { type: String }, offerLetter: { type: String } },

    role: { type: String, enum: ["Employee", "Manager", "HR", "Admin"], default: "Employee" },

    leaveBalances: { casual: { type: Number, default: 0 }, sick: { type: Number, default: 0 }, annual: { type: Number, default: 0 } },
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
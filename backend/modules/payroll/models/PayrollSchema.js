import mongoose from "mongoose";


const SalaryComponentSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Basic, HRA, Fuel
  code: { type: String },                 // BASIC, HRA, FUEL
  type: { type: String, enum: ['earning', 'deduction'], required: true },
  amountType: { type: String, enum: ['fixed', 'percentage'], required: true },
  value: { type: Number, required: true }, // 50000 or 10 (%)
  basedOn: { type: String, enum: ['basic', 'gross'], default: null },
  taxable: { type: Boolean, default: true }
});


const PayrollSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "employee",
        required: true
    },
    salaryMonth: {
        type: String,
        required: true
    },
    salaryYear: {
        type: String,
        required: true
    },
    components: [SalaryComponentSchema],
    status: {
        type: String,
        enum: ['pending', 'processed', 'paid'],
        default: 'pending'
    },
    attendanceSummary: {
        totalworkingDays: { type: Number, default: 0 },
        daysPresent: { type: Number, default: 0 },
        daysAbsent: { type: Number, default: 0 },
        leavesTaken: { type: Number, default: 0 }
    },
    totals: {
        grossEarnings: {type: Number, required: true},
        totalDeductions: {type: Number, required: true},
        netPay: {type: Number, required: true},
    },
    currency: {type: String, default: "PKR"}
}, {timestamps: true})

const Payroll = mongoose.model("Payroll", PayrollSchema)

export default Payroll
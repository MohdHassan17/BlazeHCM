import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  workingHours: { type: Number },
  isOvernight: { type: Boolean, default: false },
  breakMinutes: { type: Number, default: 0 },
  lateAfter: { type: String },
  halfDayAfter: String
});

const Shift = mongoose.model("Shift", shiftSchema);
export default Shift;
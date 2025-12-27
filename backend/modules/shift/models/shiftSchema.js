import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  workingHours: { type: Number },
  isOvernight: { type: Boolean, default: false },
  breakMinutes: { type: Number, default: 0 },
  lateAfter: { type: String },
  graceMinutes: { type: Number, default: 0 },
  halfDayAfter: String,
  offDays: {type: [Number], 
    enum: [0,1,2,3,4,5,6],
    default: [6,0]
  }

});

const Shift = mongoose.model("Shift", shiftSchema);
export default Shift;
import mongoose from "mongoose";

const shiftExceptionSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required:true },
  date: {type: Date, required: true},
  shift: {type: mongoose.Schema.Types.ObjectId, ref:'Shift', required: true}
});



const ShiftException  = mongoose.model("shiftException", shiftExceptionSchema)

export default ShiftException
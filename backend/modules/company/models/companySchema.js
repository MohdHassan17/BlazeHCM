import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  companyID: { type: String, required: true, unique: true, default: 1 },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  website: { type: String },
  leaves: { casual: { type: Number, default: 6 }, sick: { type: Number, default: 6 }, annual: { type: Number, default: 8 } },
});

const Company = mongoose.model("Company", companySchema);
export default Company;
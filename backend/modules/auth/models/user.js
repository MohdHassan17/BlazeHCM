import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "UserRole" },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

//! Hashing password before save
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next(); // only hash if changed
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


const User = mongoose.model("User", userSchema);

export default User;

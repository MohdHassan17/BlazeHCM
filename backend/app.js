// app.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";

// Route Imports (module-based)
import employeeRoutes from "./modules/employee/routes/employeeRoutes.js";
import companyRoutes from "./modules/company/routes/companyRoutes.js";
import leaveRoutes from "./modules/leave/routes/leaveRoutes.js";
import attendanceRoutes from "./modules/attendance/routes/attendanceRoutes.js";
import shiftRoutes from './modules/shift/routes/shiftRoutes.js'
import payrollRoutes from './modules/payroll/routes/payrollRoutes.js'

dotenv.config();

const app = express();

// Connect to MongoDB 
connectDB();

// Middleware
app.use(cors()); // ✅ Enables cross-origin requests
app.use(express.json()); // ✅ Parses JSON request bodies
app.use(morgan("dev")); // ✅ Logs requests

// Health check route
app.get('/', (req, res) => {
  res.send('Hello World!');
});




// API Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/company', companyRoutes)
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes)
app.use('/api/shift', shiftRoutes)
app.use('/api/payroll', payrollRoutes)



 


// 404 handler (should be AFTER routes)
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Central error handler (always at the bottom)
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

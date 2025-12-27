import Employee from "../../modules/employee/models/employeeSchema.js";
import XLSX from "xlsx";

const bulkImportEmployee = async (buffer) => {
  try {
    //* 1. Excel reading logic using XLSX
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const workSheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(workSheet);

    //* 2. Mapping entries to match DB Fields and preparing bulks insert

    const bulkOps = rows.map((row) => ({
      updateOne: {
        filter: { employeeId: row["Employee ID"] },
        update: {
          $set: {
            // This part updates existing records, set only updates specific fields
            firstname: row["First Name"],
            lastname: row["Last Name"],
            email: row["Email"],
            phone: row["Phone"],
            address: row["Address"],
            gender: row["Gender"],
            designation: row["Designation"],
            salary: {
              basic: row["Basic Salary"] || 0,
              homeAllowance: row["Home Allowance"] || 0,
              medicalAllowance: row["Medical Allowance"] || 0,
              utilityAllowance: row["Utility Allowance"] || 0,
            },
            shift: row["Shift"],
          },
          $setOnInsert: {
            // $setOnInsert only sets these fields if it's a new document
            dateOfJoining: new Date(row["Date of Joining"] || Date.now()),
            employmentType: row["Employment Type"] || "Probation",
            status: "Active",
            role: "Employee",
            leaveBalances: { casual: 0, sick: 0, annual: 0 },
          },
        },
        upsert: true,
      },
    }));

    // * 3. Bulk Writing into the Database, ordered ensures that we proceed even if some operations fail

    const result = await Employee.bulkWrite(bulkOps, { ordered: false });

    return result;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const bulkExportEmployee = async () => {
  try {

    //* 1. Getting employees using lean which makes it more efficient
    const employees = await Employee.find().lean();


    // * 2. Map the received data to excel rows
    const rows = employees.map((emp) => ({
      "Employee ID": emp.employeeId,
      "First Name": emp.firstname,
      "Last Name": emp.lastname,
      Email: emp.email,
      Phone: emp.phone,
      Address: emp.address,
      "Date of Birth": emp.date_of_birth
        ? emp.date_of_birth.toISOString().split("T")[0]
        : "",
      Gender: emp.gender,
      Designation: emp.designation || "",
      "Date of Joining": emp.dateOfJoining
        ? emp.dateOfJoining.toISOString().split("T")[0]
        : "",
      "Date of Exit": emp.dateOfExit
        ? emp.dateOfExit.toISOString().split("T")[0]
        : "",
      "Shift ID": emp.shift || "",
      Status: emp.status,
      "Employment Type": emp.employmentType,
      Role: emp.role,
      "Basic Salary": emp.salary?.basic || 0,
      "Home Allowance": emp.salary?.homeAllowance || 0,
      "Medical Allowance": emp.salary?.medicalAllowance || 0,
      "Utility Allowance": emp.salary?.utilityAllowance || 0,
      CNIC: emp.documents?.cnic || "",
      Contract: emp.documents?.contract || "",
      "Offer Letter": emp.documents?.offerLetter || "",
      "Casual Leave": emp.leaveBalances?.casual || 0,
      "Sick Leave": emp.leaveBalances?.sick || 0,
      "Annual Leave": emp.leaveBalances?.annual || 0,
    }));

    console.log(rows)


    // * 3. Converting the data from the row to excel
    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook,worksheet,"Employees")
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
 //? Buffer is binary data as far as I know, this functions creates the buffer from the workbook object

    return excelBuffer
  } catch (error) {
    return {
      success: false,
      message: `Error in processing ${error.message}`,
    };
  }
};
// ? For Payroll, i think

const eligibleEmployees = async (period) => {
  try {
    const { startDate, endDate } = period;
    const employees = await Employee.find({
      status: "Active",
      dateOfJoining: { $lte: endDate },
      $or: [
        { dateOfExit: { $exists: false } },
        { dateOfExit: { $gte: startDate } },
        { dateOfExit: null },
      ],
    });

    console.log("Eligible Employees: ", employees);
    return employees;
  } catch (error) {
    return {
      success: false,
      data: error,
    };
  }
};

export default { eligibleEmployees, bulkImportEmployee, bulkExportEmployee };

import Company from "../models/companySchema.js";

export const createCompany = async (req, res) => {
  try {
    const newCompany = new Company({ ...req.body, companyID: 1 });
    const savedCompany = await newCompany.save();
    return res.status(201).json({ success: true, message: "Company settings created successfully", data: savedCompany });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error creating company settings", error: error.message });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const updatedCompany = await Company.findOneAndUpdate({ companyID: 1 }, req.body, { new: true, runValidators: true });
    if (!updatedCompany) return res.status(404).json({ success: false, message: "Company settings not found" });
    return res.status(200).json({ success: true, message: "Company settings updated successfully", data: updatedCompany });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating company settings", error: error.message });
  }
};

export const getCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ companyID: 1 });
    if (!company) return res.status(404).json({ success: false, message: "Company settings not found" });
    return res.status(200).json({ success: true, message: "Company settings retrieved successfully", data: company });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching company settings", error: error.message });
  }
};
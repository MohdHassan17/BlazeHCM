import multer from "multer";

// Set up multer storage configuration

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB or less
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if(!allowedTypes.includes(file.mimetype)){
        return cb( new Error("Only Excel or CSV files are allowed"))
    }

    cb(null, true)
  },
});


export default upload
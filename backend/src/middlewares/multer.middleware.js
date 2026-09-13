import multer from "multer";
import path from "path";

// CSV / Excel Upload (Memory Storage)
export const uploadCsv = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter(req, file, cb) {
    const allowedMimeTypes = [
      "text/csv",

      "application/vnd.ms-excel",

      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const extension = file.originalname.split(".").pop().toLowerCase();

    const allowedExtensions = ["csv", "xls", "xlsx"];

    if (allowedExtensions.includes(extension) && allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV, XLS and XLSX files are allowed"));
    }
  },
});

// Image Upload (Disk Storage)
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },

  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

export const uploadImage = multer({
  storage: imageStorage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|webp/;

    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
      return cb(null, true);
    }

    cb(new Error("Only image files are allowed"));
  },
});

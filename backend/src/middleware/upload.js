import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cvUploadDir = path.resolve(__dirname, "../../uploads/cv");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(cvUploadDir, { recursive: true });
    cb(null, cvUploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `cv-${timestamp}${ext}`);
  },
});

const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Only PDF/DOC/DOCX files are allowed"));
  }
  cb(null, true);
};

export const uploadCv = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

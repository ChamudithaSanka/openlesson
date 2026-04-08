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

// Profile pictures
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const profileUploadDir = path.resolve(__dirname, "../../uploads/profiles");
    fs.mkdirSync(profileUploadDir, { recursive: true });
    cb(null, profileUploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `profile-${timestamp}${ext}`);
  },
});

const imageFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only images are allowed"));
  }
  cb(null, true);
};

export const uploadProfilePicture = multer({
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

import fs from "fs";
import path from "path";
import multer from "multer";
import { getEnvVar } from "../src/getEnvVar.js";

class ImageFormatError extends Error {}

const uploadDir = path.resolve(getEnvVar("IMAGE_UPLOAD_DIR") || "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        let fileExtension;
        if (file.mimetype === "image/png") {
            fileExtension = "png";
        } else if (file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
            fileExtension = "jpg";
        } else {
            cb(new ImageFormatError("Unsupported image type"), "");
            return;
        }

        const fileName = Date.now() + "-" + Math.round(Math.random() * 1E9) + "." + fileExtension;
        cb(null, fileName);
    }
});

export const imageMiddlewareFactory = multer({
    storage: storageEngine,
    limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
});

export function handleImageFileErrors(err, req, res, next) {
    if (err instanceof multer.MulterError || err instanceof ImageFormatError) {
        res.status(400).send({
            error: "Bad Request",
            message: err.message
        });
        return;
    }
    next(err);
}

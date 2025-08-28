// multer.middleware.js
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {log} from 'console'; // Importing log for better console output

const uploadDir = "public/temp"; // Relative path to the upload directory

log(`[Multer midware] Initializing...`);
log(`[Multer midware] Configured absolute upload directory: ${uploadDir}`);

// Check if the upload directory exists and create it if not
if (!fs.existsSync(uploadDir)) {
    log(`[Multer midware] Upload directory '${uploadDir}' does not exist. Attempting to create...`);
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
        log(`[Multer midware] Successfully created upload directory: ${uploadDir}`);
    } catch (error) {
        console.error(`[Multer midware] ERROR: Failed to create upload directory '${uploadDir}':`, error);
        console.error(`[Multer midware] Please check file system permissions for the parent directories.`);
        // Re-throw or handle this error appropriately if the app cannot proceed without the directory
    }
} else {
    log(`[Multer midware] Upload directory '${uploadDir}' already exists.`);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        log(`[Multer midware] In destination function for file: ${file.originalname}`);
        log(`[Multer midware] Multer will attempt to save to: ${uploadDir}`);

        // IMPORTANT: Verify that 'uploadDir' is accessible/writable at this point.
        // The 'cb' function is Multer's way of passing control.
        // The first argument is an error (if any), the second is the destination path.
        // If an error is passed here, Multer will stop processing the file.
        fs.access(uploadDir, fs.constants.W_OK, (err) => {
            if (err) {
                console.error(`[Multer midware] Permission ERROR: Cannot write to directory '${uploadDir}' for file '${file.originalname}':`, err.message);
                console.error(`[Multer midware] Full error details:`, err);
                cb(new Error(`Permission denied: Cannot write to upload directory. Please check folder permissions for ${uploadDir}.`), null);
            } else {
                log(`[Multer midware] Write access confirmed for ${uploadDir}.`);
                cb(null, uploadDir); // All good, proceed with this destination
            }
        });
    },
    filename: function (req, file, cb) {
        // This function determines the filename.
        // At this point, the file has NOT yet been written to disk by Multer,
        // so file.path will still be undefined here.
        log(`[Multer midware] In filename function for file: ${file.originalname}`);
        // Consider generating a unique filename to prevent overwrites or naming conflicts in production:
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // const newFilename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        // log(`[Multer midware] Filename being set to: ${newFilename}`);
        // cb(null, newFilename);

        log(`[Multer midware] Filename being set to: ${file.originalname}`);
        cb(null, file.originalname); // Using original name as you specified
    }
});

export const upload = multer({ storage });
log('[Multer midware] Multer instance initialized with disk storage.');


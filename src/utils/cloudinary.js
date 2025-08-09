import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'; // Required for file system operations
import {log} from 'console'; // Importing log for better console output

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            log("[Cloudinary] No local file path provided.");
            return null;
        }

        log(`[Cloudinary] Attempting to upload file from local path: ${localFilePath}`);

        const response = await cloudinary.uploader.upload(localFilePath,
            {
                resource_type: 'auto', // Corrected: changed auto to 'auto' (string)
            }
        );

        log("[Cloudinary] File Uploaded Successfully !!!", response.url);

        fs.unlinkSync(localFilePath); // Delete the local file after successful upload
        log(`[Cloudinary] Local file deleted after successful upload: ${localFilePath}`);

        return response; // Return the Cloudinary response object
    } catch (error) {
        console.error(`[Cloudinary] ERROR: Cloudinary upload failed for ${localFilePath}:`, error.message);
        // Important: Log the full error to understand why Cloudinary upload failed
        console.error(`[Cloudinary] Full error details:`, error);

        // This line deletes the local file even if the Cloudinary upload fails.
        // During debugging, you might want to temporarily comment this out
        // to verify if Multer is indeed saving files to public/temp.
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            log(`[Cloudinary] Local file deleted after failed upload: ${localFilePath}`);
        } else {
            log(`[Cloudinary] Local file ${localFilePath} did not exist to delete after failed upload.`);
        }
        
        return null; // Return null on failure
    }
}

export { uploadOnCloudinary };

import { v2 as cloudinary } from "cloudinary"
import fs from "fs"


// console.log("=== Cloudinary Config Check ===");
// console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "present" : "MISSING");
// console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "present" : "MISSING");
// console.log("===================  ======== =");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath, req = null) => {
    try {
        if (!localFilePath) return null
        console.log("Uploading to Cloudinary:", localFilePath);

        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        // file has been uploaded successfull
        console.log("File uploaded to Cloudinary:", response.url);

        // Track the successfully uploaded Cloudinary file for potential cleanup on failure
        if (req && req.uploadedFiles && req.uploadedFiles.cloudinary) {
            req.uploadedFiles.cloudinary.push(response.secure_url || response.url);
        }

        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        console.log("=== Cloudinary Upload Error ===");
        console.log(error);

        console.log("Error message:", error.message);
        console.log("Full error:", JSON.stringify(error, null, 2));
        console.log("================================");

        // Check if file exists before trying to delete
        try {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
                console.log("Deleted local file:", localFilePath);
            }
        } catch (deleteError) {
            console.log("Could not delete local file:", deleteError.message);
        }

        return null;
    }
}


const deleteFromCloudinary = async (cloudinaryUrl) => {
    // Function to delete ANY asset -> image or video Link
    try {
        if (!cloudinaryUrl) return null;

        //Extract Public ID: Handles folders and subfolders
        //Example URL = "https://res.cloudinary.com/jay-cloud/image/upload/v1772652364/te01vcjcnks30gazulxq.png",
        const publicId = getPublicIdFromUrl(cloudinaryUrl)

        //Determine Resource Type: Checks if "video" is in the URL
        const resourceType = cloudinaryUrl.includes("/video/") ? "video" : "image";

        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
            invalidate: true
        });

        return response;
    } catch (error) {
        console.error("Cloudinary deletion failed:", error);
        return null;
    }
};


const getPublicIdFromUrl = (url) => {
    //Split by "/" to get an array of segments
    const parts = url.split("/");

    //The public_id is the last part (te01vcjcnks30gazulxq.png)
    const lastPart = parts.pop();

    //Remove the extension (.png, .jpg, etc.)
    const publicId = lastPart.split(".")[0];

    return publicId;
};

// Example usage:
// const url = "https://res.cloudinary.com/jay-cloud/image/upload/v1772652364/te01vcjcnks30gazulxq.png";
// console.log(getPublicIdFromUrl(url)); // Output: "te01vcjcnks30gazulxq"

const cleanupFiles = async (req) => {
    if (!req) return;

    // 1. Clean up local files from Multer
    try {
        const localPaths = [];
        if (req.file && req.file.path) {
            localPaths.push(req.file.path);
        }
        if (req.files) {
            if (Array.isArray(req.files)) {
                req.files.forEach(file => {
                    if (file.path) localPaths.push(file.path);
                });
            } else if (typeof req.files === 'object') {
                Object.values(req.files).forEach(fileGroup => {
                    if (Array.isArray(fileGroup)) {
                        fileGroup.forEach(file => {
                            if (file.path) localPaths.push(file.path);
                        });
                    } else if (fileGroup && fileGroup.path) {
                        localPaths.push(fileGroup.path);
                    }
                });
            }
        }

        for (const filePath of localPaths) {
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                    console.log(`[Cleanup] Deleted local file: ${filePath}`);
                } catch (err) {
                    console.error(`[Cleanup] Failed to delete local file: ${filePath}`, err.message);
                }
            }
        }
    } catch (error) {
        console.error("[Cleanup] Error during local file cleanup:", error.message);
    }

    // 2. Clean up Cloudinary uploads
    if (req.uploadedFiles && req.uploadedFiles.cloudinary && req.uploadedFiles.cloudinary.length > 0) {
        console.log(`[Cleanup] Cleaning up ${req.uploadedFiles.cloudinary.length} orphaned Cloudinary files...`);
        for (const url of req.uploadedFiles.cloudinary) {
            try {
                await deleteFromCloudinary(url);
                console.log(`[Cleanup] Deleted orphaned Cloudinary asset: ${url}`);
            } catch (err) {
                console.error(`[Cleanup] Failed to delete Cloudinary asset: ${url}`, err.message);
            }
        }
        req.uploadedFiles.cloudinary = []; // reset after cleanup
    }
};

export { uploadOnCloudinary, deleteFromCloudinary, getPublicIdFromUrl, cleanupFiles };
import { v2 as cloudinary } from "cloudinary"
import fs from "fs"


// console.log("=== Cloudinary Config Check ===");
// console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "present" : "MISSING");
// console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "present" : "MISSING");
// console.log("===============================");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        console.log("Uploading to Cloudinary:", localFilePath);

        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        // file has been uploaded successfull
        console.log("File uploaded to Cloudinary:", response.url);
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

        // 1. Extract Public ID: Handles folders and subfolders
        // Example URL: "https://res.cloudinary.com/jay-cloud/image/upload/v1772652364/te01vcjcnks30gazulxq.png",
        const publicId = getPublicIdFromUrl(cloudinaryUrl)

        // 2. Determine Resource Type: Checks if "video" is in the URL
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
    // 1. Split by "/" to get an array of segments
    const parts = url.split("/");

    // 2. The public_id is the last part (te01vcjcnks30gazulxq.png)
    const lastPart = parts.pop();

    // 3. Remove the extension (.png, .jpg, etc.)
    const publicId = lastPart.split(".")[0];

    return publicId;
};

// Example usage:
// const url = "https://res.cloudinary.com/jay-cloud/image/upload/v1772652364/te01vcjcnks30gazulxq.png";
// console.log(getPublicIdFromUrl(url)); // Output: "te01vcjcnks30gazulxq"




export { uploadOnCloudinary, deleteFromCloudinary, getPublicIdFromUrl };
import { ApiError } from "../utils/ApiError.js";
import { cleanupFiles } from "../utils/cloudinary.js";

export const errorHandler = async (err, req, res, next) => {
    //Clean up on failed request
    try {
        await cleanupFiles(req);
    } catch (cleanupError) {
        console.error("Error during file cleanup inside error handler:", cleanupError.message);
    }

    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, error.errors || [], err.stack);
    }

    //Log the error internally
    console.error(`[API Error] ${error.statusCode} - ${error.message}`);
    if (error.stack) {
        console.error(error.stack);
    }

    const response = {
        success: false,
        message: error.message,
        errors: error.errors
    };

    return res.status(error.statusCode).json(response);
};

import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const registerUser = asyncHandler(async (req, res) => {

    // Steps to create a register controller
    //-----------------------------------------------------------
    // Get user details from frontend
    // Validate user details ( if any field empty or missing )
    // Check if user already exists : via userName or mostly Email
    // Check for Images : Avatar exists in User data
    // Upload them to cloudinary
    // Create a new user object in database
    // remove password and refresh token from user object
    // return if user successfully created or not


    const { fullName, userName, email, password } = req.body;
    console.log(`Registering user: ${email}`);
    console.log(`Registering user: fullName: ${fullName}, userName: ${userName},. email: ${email}, password: ${password}`);

    // Validate user details
    if (
        [fullName, userName, email, password].some((field) => !field || field.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required !!!");
    }

    // Check if user already exists
    const userExist = await User.findOne({
        $or: [{ userName }, { email }]
    });

    if (userExist) {
        throw new ApiError(409, "User already exists with this userName or email !!!");
    }

    // Check for avatar and upload it
    const avatarLocalPath = req?.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req?.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required !!!");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        // If avatar upload fails, it's a server-side issue or Cloudinary problem
        throw new ApiError(500, "Failed to upload avatar image to Cloudinary.");
    }

    // Upload cover image if provided
    let coverImage = null;
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
        if (!coverImage) {
            // Log a warning if cover image upload fails, but don't stop registration
            // as it's an optional field. Consider whether you need to delete the uploaded avatar here
            // if you want strict atomicity.
            console.warn("Failed to upload cover image to Cloudinary. Proceeding without it.");
        }
    }

    // Create a new user object in the database
    const user = await User.create({
        fullName,
        userName: userName.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        // Use optional chaining for coverImage.url, and default to empty string if not available
        coverImage: coverImage?.url || ""
    });

    // Retrieve the created user and exclude sensitive fields
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        // This scenario is rare if User.create succeeded, but good for robustness
        throw new ApiError(500, "Something went wrong while fetching the created user details.");
    }

    // Return success response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully !!!")
    );
});

export { registerUser };
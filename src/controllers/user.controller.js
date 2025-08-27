import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


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


    let { fullName, userName, email, password } = req.body;
    console.log(`Registering user:  ${email}`);

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


const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // userName or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const { email, userName, password } = req.body
    console.log(email);

    if (!userName && !email) {
        throw new ApiError(400, "userName or email is required")
    }

    // Here is an alternative of above code based on logic discussed in video:
    // if (!(userName || email)) {
    //     throw new ApiError(400, "userName or email is required")
    // }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    } 

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken.userId)
    
        if(!user){
            throw new ApiError(401, "Invalid Refresh Token | Unauthorized request.")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Expired Refresh Token | Refresh Token Used.")
        }
        
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken: newRefreshToken },
                "Access Token refreshed successfully"
            )
        )
    
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token ")
    }
})          



export {
    registerUser,
    loginUser,
    logoutUser
}


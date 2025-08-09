import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        
        return {accessToken , refreshToken}

    } catch (error) {
        throw new ApiError(500, "Error generating access and refresh token !!!")
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

    if (
        [fullName, userName, email, password].some((element) => element?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required !!!")
    }
    // .some :   The .some() method in JavaScript is used on arrays to check if at least one element in the array passes a test (returns true from the callback function).                                                           
    let userExist = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (userExist) {
        throw new ApiError(409, "User already exists having similar username or email !!!")
    }
    console.log(req.files.avatar[0].path);
    
    const avatarLocalPath = req?.files?.avatar[0]?.path;
    // const coverImageLocalPath = req?.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar image is required !!!")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(400, "Avatar image is required !!!")
    }

    const user = await User.create({
        fullName,
        userName : userName.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser) {
        throw new ApiError(500, "User not created successfully , something went wrong with create query!!!")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser ,"User created successfully !!!") 
    );


})

const loginUser = asyncHandler(async (req,res)=>{
    //STEPS TO CREATE A LOGIN CONTROLLER
    //-----------------------------------------------------------   
    // Get user details from frontend
    // Validate user details ( if any field empty or missing )
    // Check if user exists : via userName or Email
    // Check if password is correct
    // access refreshToken
    // send cookie

    let { userName, email, password } = req.body;
    
    if(!userName || !email) {
        throw new ApiError(400, "Username or Email are required !!!")
    }

    const user = await User.findOne({
        $or:[{userName}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User doesnt exist !!!")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid password !!!") 
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            }, "User logged in successfully !!!"
        )
    )
    
})

const logoutUser = asyncHandler(async(req, res) => {
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

export { registerUser };
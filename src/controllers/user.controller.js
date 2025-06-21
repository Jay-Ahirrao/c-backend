import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
const registerUser = asyncHandler(async (req, res) => {

    // Steps to create a register controller
    //-----------------------------------------------------------
    // Get user details from frontend
    // Validate user details ( if any field empty or missing )
    // Check if user already exists : via username or mostly Email
    // Check for Images : Avatar exists in User data
    // Upload them to cloudinary
    // Create a new user object in database
    // remove password and refresh token from user object
    // return if user successfully created or not


    let { fullName, username, email, password } = req.body;
    console.log(`Registering user:  ${email}`);

    if (
        [fullName, username, email, password].some((element) => element?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required !!!")
    }
    // .some :   The .some() method in JavaScript is used on arrays to check if at least one element in the array passes a test (returns true from the callback function).                                                           
    let userExist = User.findOne({
        $or: [{ username }, { email }]
    })
    if (userExist) {
        throw new ApiError(409, "User already exists having similar usernaeme or email !!!")
    }

    const avatarLocalPath = req?.files?.avatar[0]?.path;
    const coverImageLocalPath = req?.files?.coverImage[0]?.path;

    if(! avatarLocalPath){
        throw new ApiError(400, "Avatar image is required !!!")
    }

})

export { registerUser };
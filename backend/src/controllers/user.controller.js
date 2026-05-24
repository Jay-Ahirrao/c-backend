import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { Subscription } from '../models/subscription.model.js';
import mongoose from "mongoose";
import { sendEmail } from '../utils/mail.helper.js';
import crypto from "crypto";

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

    const avatar = await uploadOnCloudinary(avatarLocalPath, req);

    if (!avatar) {
        // If avatar upload fails, it's a server-side issue or Cloudinary problem
        throw new ApiError(500, "Failed to upload avatar image to Cloudinary.");
    }

    // Upload cover image if provided
    let coverImage = null;
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath, req);
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
        secure: true,
        signed: true,
        sameSite: 'none'
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
        secure: true,
        signed: true,
        sameSite: 'none'
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.signedCookies?.refreshToken || req.cookies?.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }
    console.log(incomingRefreshToken);
    

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id)

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token | Unauthorized request.")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Expired Refresh Token | Refresh Token Used.")
        }

        const options = {
            httpOnly: true,
            secure: true,
            signed: true,
            sameSite: 'none'
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

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

const changeCurrentPassword = asyncHandler(async (req, res) => {
    // get old password and new password from req body
    // validate both passwords
    // find the user from req.user._id
    // check if old password is correct
    // if not correct send error
    // if correct set new password
    // save the user
    // send success response

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Both old and new passwords are required")
    }
    const user = await User.findById(req.user._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Old password is incorrect")
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))

})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const updateQuery = {
        $set: { fullName, email }
    };

    if (req.user?.email && req.user.email.toLowerCase() !== email.toLowerCase()) {
        updateQuery.$unset = {
            forgotPasswordOtp: 1,
            forgotPasswordOtpExpiry: 1
        };
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        updateQuery,
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User details updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    // get avatar from -- req.file?.path , as file up[loaded by user goes in ,  req.file instead of -- req.user._id
    // change avatar , with checks
    // user.save without password

    const avatarLocalPath = req?.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required !!!");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath, req);

    if (!avatar.url) {
        // If avatar upload fails, it's a server-side issue or Cloudinary problem
        throw new ApiError(500, "Failed to upload avatar image (while updating avatar) to Cloudinary.");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    // get coverImage from -- req.file?.path , as file uploaded by user goes in ,  req.file instead of -- req.user._id
    const coverImageLocalPath = req?.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "coverImage is required !!!");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath, req);

    if (!coverImage.url) {
        // If avatar upload fails, it's a server-side issue or Cloudinary problem
        throw new ApiError(500, "Failed to upload coverImage (while updating coverImage) to Cloudinary.");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User coverImage updated successfully"))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const {username} = req.params;

    if(!username?.trim()){
        throw new ApiError(400, "UserName missing username")
    }

    const channel = await User.aggregate(
        [
            {
                $match: {
                    userName: username.toLowerCase()
                }
            },
            {
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"channel",
                    as:"subscribers"
                }
            },
            {
                $lookup:{
                    from : "subscriptions",
                    localField:"_id",
                    foreignField:"subscriber",
                    as:"subscribedTo"
                }
            },
            {
                $addFields:{
                    subscriberCount: {
                        $size: "$subscribers"
                    },
                    channelsSubscribedToCount: {
                        $size: "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond: {
                            if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    fullName: 1,
                    userName: 1,
                    email: 1,
                    subscriberCount: 1,
                    channelsSubscribedToCount: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1,
                }
            }
        ]
    )

    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exists")
    }

    return res.status(200).json(new ApiResponse(200, channel[0], "User channel fetched successfully"))
})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        }, // pipeline means Joins - join the watchHistory with the owner of the video and each matched users
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline:[
                    {
                        $match: {
                            $or: [
                                { isPublished: true },
                                { owner: new mongoose.Types.ObjectId(req.user?._id) }
                            ]
                        }
                    },
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[
                                {
                                    $project: {
                                        fullName: 1,
                                        userName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully"))
})

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new ApiError(404, "User with this email does not exist");
    }

    // Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    user.forgotPasswordOtp = otp;
    user.forgotPasswordOtpExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    // Send email
    const subject = "Password Reset OTP - EveryTube";
    const text = `Your OTP for password reset is ${otp}. It is valid for 15 minutes.`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #ea580c; text-align: center;">EveryTube Password Reset</h2>
            <p>Hello,</p>
            <p>You requested to reset your password. Use the OTP below to complete the verification process. This OTP is valid for 15 minutes:</p>
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 5px; color: #111827;">
                ${otp}
            </div>
            <p>If you did not initiate this request, please ignore this email.</p>
            <p>Best regards,<br/>The EveryTube Team</p>
        </div>
    `;

    try {
        await sendEmail({ to: user.email, subject, text, html });
    } catch (error) {
        console.error("Failed to send verification email:", error.message);
        user.forgotPasswordOtp = undefined;
        user.forgotPasswordOtpExpiry = undefined;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(500, "Failed to deliver OTP email. Please try again later.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { email }, "OTP sent to your registered email address"));
});

const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new ApiError(404, "User with this email does not exist");
    }

    if (!user.forgotPasswordOtp || user.forgotPasswordOtp !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }

    if (new Date() > user.forgotPasswordOtpExpiry) {
        throw new ApiError(400, "OTP has expired");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "OTP verified successfully"));
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        throw new ApiError(400, "All fields (email, otp, newPassword) are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new ApiError(404, "User with this email does not exist");
    }

    if (!user.forgotPasswordOtp || user.forgotPasswordOtp !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }

    if (new Date() > user.forgotPasswordOtpExpiry) {
        throw new ApiError(400, "OTP has expired");
    }

    // Reset password and clear OTP fields
    user.password = newPassword;
    user.forgotPasswordOtp = undefined;
    user.forgotPasswordOtpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password has been reset successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    forgotPassword,
    verifyOtp,
    resetPassword
}


import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    if (channelId === req.user?._id?.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const subscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    });

    if (subscription) {
        await Subscription.findByIdAndDelete(subscription._id);
        return res.status(200).json(new ApiResponse(200, { isSubscribed: false }, "Unsubscribed successfully"));
    } else {
        await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        });
        return res.status(200).json(new ApiResponse(200, { isSubscribed: true }, "Subscribed successfully"));
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        {
            $unwind: "$subscriberDetails"
        },
        {
            $project: {
                _id: "$subscriberDetails._id",
                userName: "$subscriberDetails.userName",
                fullName: "$subscriberDetails.fullName",
                avatar: "$subscriberDetails.avatar"
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid Subscriber ID");
    }

    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails"
            }
        },
        {
            $unwind: "$channelDetails"
        },
        {
            $project: {
                _id: "$channelDetails._id",
                userName: "$channelDetails.userName",
                fullName: "$channelDetails.fullName",
                avatar: "$channelDetails.avatar"
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, channels, "Subscribed channels fetched successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
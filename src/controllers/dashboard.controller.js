import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { fetchVideosAggregate } from "../utils/videoHelpers.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const { _id } = req.user

    // getting total views :
    const stats = await Video.aggregate([
        // STAGE 1: Get only this user's videos
        {
            $match: {
                owner: new mongoose.Types.ObjectId(_id)
            }
        },
        // STAGE 2: Join with Likes collection
        {
            $lookup: {
                from: "likes",
                localField: "_id",     // Video ID
                foreignField: "video", // Video ID in Likes collection
                as: "likes"
            }
        },
        // STAGE 3: Join with Subscribers (from a separate collection)
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",    // User ID
                foreignField: "channel", // Channel ID in Subscriptions
                as: "subscribers"
            }
        },
        {
            $out: stats
        },
        // STAGE 4: Group everything to calculate totals
        {
            $group: {
                _id: null,
                totalVideos: { $sum:1 }, // $inc:1 doesnt works only in update ()
                totalViews: { $sum: "$views" }, //views local field of Videos
                // Count the total number of likes across all videos
                totalLikes: { $sum: { $size: "$likes" } }, // likes local field too
                // We take the size of subscribers from the first video doc
                // (Since every doc in this match has the same owner/subscriber list)
                totalSubscribers: { $first: { $size: "$subscribers" } } // subs is forignfield
            }
            
        },
        // STAGE 5: Clean up the output
        {
            $project: {
                _id: 0, // Hide the null ID
                totalVideos: 1,
                totalViews: 1,
                totalLikes: 1,
                totalSubscribers: 1
            }
        }
    ]);

    

    // Handle case where user has 0 videos (stats will be an empty array)
    const result = stats[0] || {
        totalVideos: 0,
        totalViews: 0,
        totalLikes: 0,
        totalSubscribers: 0
    };

    return res.status(200).json(new ApiResponse(200, result, "Stats fetched"));
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const { _id } = req.user
    console.log(req.user);
    console.log(_id);
    
    
    // TODO: Get all the videos uploaded by the channel

    const { pageValue = 1, limitValue = 10, query, sortBy = "createdAt", sortType = "desc" } = req.query

    const page = Number(pageValue) //url params converted to numbers
    const limit = Number(limitValue)

    // MATCH: Only this owner, but show BOTH published and private
    const matchStage = {
        owner: new mongoose.Types.ObjectId(_id)
    };

    const sortStage = { [sortBy]: sortType === "asc" ? 1 : -1 };

    const { videos, totalVideos } = await fetchVideosAggregate({ matchStage, sortStage, page, limit });

    return res.status(200).json(new ApiResponse(200, "Channel videos fetched", {
        videos,
        pagination: { page, limit, totalVideos, totalPages: Math.ceil(totalVideos / limit) }
    }));
})


export {
    getChannelStats,
    getChannelVideos
}
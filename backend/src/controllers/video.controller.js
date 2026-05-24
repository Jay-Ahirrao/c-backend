import mongoose, { isObjectIdOrHexString, isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from "../utils/cloudinary.js"
import { fetchVideosAggregate } from "../utils/videoHelpers.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { pageValue = 1, limitValue = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query

    const page = Number(pageValue) //url params converted to numbers
    const limit = Number(limitValue)

    // MATCH: MUST be published
    const matchStage = { isPublished: true };

    if (query) {
        matchStage.$or = [ //adding another key:value to oobject as  { isPublishedd:true , $or: {regex matching} }
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    if (userId) {
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }

    const allowedSortFields = ["title", "views", "duration", "createdAt", "updatedAt"];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const sortStage = { [validSortBy]: sortType === "asc" ? 1 : -1 };

    const { videos, totalVideos } = await fetchVideosAggregate({ matchStage, sortStage, page, limit });

    return res.status(200).json(new ApiResponse(200, {
        videos,
        pagination: { page, limit, totalVideos, totalPages: Math.ceil(totalVideos / limit) }
    }, "Public videos fetched"));

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    console.log("Publishing a video with title:", title, "and description:", description)

    //1. check if title and description are present in the request
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required")
    }

    //2. check if video already exists with the same title for the same user
    const videoExist = await Video.findOne({ title, owner: req.user._id })
    if (videoExist) {
        throw new ApiError(400, "Video with the same title already exists")
    }

    //3. check if video file and thumbnail are present in the request (Multer stores files as arrays)
    const videoFile = req.files?.videoFile?.[0]
    const thumbnail = req.files?.thumbnail?.[0]
    if (!videoFile || !thumbnail) {
        throw new ApiError(400, "Video File and Thumbnail are required")
    }

    //4. upload video and thumbnail to cloudinary
    // Multer's diskStorage provides a `path` (and `destination` + `filename`) for saved files
    console.log("Uploading video file to Cloudinary...", videoFile.path);
    const videoPath = await uploadOnCloudinary(videoFile.path, req)
    console.log("Video upload result:", videoPath);

    console.log("Uploading thumbnail to Cloudinary...", thumbnail.path);
    const thumbnailPath = await uploadOnCloudinary(thumbnail.path, req)
    console.log("Thumbnail upload result:", thumbnailPath);

    if (!videoPath || !thumbnailPath) {
        console.error("Failed to upload video or thumbnail to cloudinary")
        throw new ApiError(500, "Failed to upload video or thumbnail to cloudinary.")
    }

    // Validate resource types: ensure the uploaded "videoFile" is actually a video
    if (videoPath.resource_type && videoPath.resource_type !== "video") {
        console.error(`Uploaded videoFile resource_type=${videoPath.resource_type}`)
        throw new ApiError(400, "The file uploaded as 'videoFile' is not a video. Please upload a valid video file.")
    }

    // Ensure thumbnail is an image (optional but helpful)
    if (thumbnailPath.resource_type && thumbnailPath.resource_type !== "image") {
        console.error(`Uploaded thumbnail resource_type=${thumbnailPath.resource_type}`)
        throw new ApiError(400, "The file uploaded as 'thumbnail' is not an image. Please upload a valid image file.")
    }

    // Safely set duration: Cloudinary provides `duration` for video uploads. Convert to string to match schema.
    const durationValue = videoPath.duration ? String(videoPath.duration) : "0"

    // adding the uploaded video to the database
    const vid = await Video.create({
        videoFile: videoPath.secure_url,
        thumbnail: thumbnailPath.secure_url,
        title,
        description,
        owner: req.user._id,
        duration: durationValue,
    })

    if (!vid) {
        throw new ApiError(500, "Failed to create video")
    }

    return res.status(201).json(
        new ApiResponse(201, {
            videoId: vid._id,
            title: vid.title,
        }, "Video published successfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const userId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;

    // 1. Fetch video with owner, subscription and like stats using aggregation
    const videoResult = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                let: { ownerId: "$owner" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$channel", "$$ownerId"] },
                                    { $eq: ["$subscriber", userId] }
                                ]
                            }
                        }
                    }
                ],
                as: "subscription"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
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
                owner: { $first: "$owner" },
                likesCount: { $size: "$likes" },
                isLiked: userId ? {
                    $cond: {
                        if: { $in: [userId, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                } : false,
                isSubscribed: userId ? {
                    $cond: {
                        if: { $gt: [{ $size: "$subscription" }, 0] },
                        then: true,
                        else: false
                    }
                } : false
            }
        },
        {
            $project: {
                likes: 0, // remove raw likes array
                subscription: 0
            }
        }
    ]);

    const video = videoResult[0];

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // 1.5 check if video is published , if not only owner can see it
    if (!video.isPublished && video.owner?._id?.toString() !== req.user?._id?.toString()) {
        throw new ApiError(403, "This video is private")
    }

    // 2. Add video to user's watch history if logged in atomically
    if (req.user) {
        await User.findByIdAndUpdate(req.user._id, [
            {
                $set: {
                    watchHistory: {
                        $concatArrays: [
                            {
                                $filter: {
                                    input: { $ifNull: ["$watchHistory", []] },
                                    as: "id",
                                    cond: { $ne: ["$$id", new mongoose.Types.ObjectId(videoId)] }
                                }
                            },
                            [new mongoose.Types.ObjectId(videoId)]
                        ]
                    }
                }
            }
        ]);
    }

    // 3. Increment views (using findByIdAndUpdate for efficiency)
    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
    video.views += 1; // Update local object for response

    return res.status(200).json(new ApiResponse(200, { video }, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    // 1. Find video
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    // 2. Authorization check
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this video");
    }

    // 3. Handle Thumbnail Update
    // const videoFile = req.files?.videoFile?.[0]
    // const thumbnail = req.files?.thumbnail?.[0]
    const thumbnailLocalPath = req?.file?.path // Upload.single (in route file) provides " .path not .thumbnail or .video ", keep in mind
    console.log(req.file);
    
    console.log(`local file of thumbnail path : ${thumbnailLocalPath}`);
    

    if (thumbnailLocalPath) {
        // Upload new thumbnail to Cloudinary
        const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath, req);
        
        if (!newThumbnail.url) {
            throw new ApiError(400, "Error while uploading new thumbnail");
        }

        // Delete OLD thumbnail: Extract Public ID from the URL using ultility called as below :)
        // Example: "https://res.cloudinary.com/jay-cloud/image/upload/v1772652364/te01vcjcnks30gazulxq.png",
        const oldThumbnailPublicId = getPublicIdFromUrl(video.thumbnail)
        console.log(`old thumnail id for testing: ${oldThumbnailPublicId}`);
        
        await deleteFromCloudinary(oldThumbnailPublicId);

        // Update DB field
        video.thumbnail = newThumbnail.url;
    }

    // 4. Update text fields
    if (title) video.title = title;
    if (description) video.description = description;

    await video.save({ validateBeforeSave: false }); // especially needed for patch

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Thumbnail and details updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    //1. check if the video with given id exists in the database
    const vid = await Video.findById(videoId)
    if (!vid) {
        throw new ApiError(404, "Video not found")
    }

    //2. check if the user is the owner of the video
    if (vid.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video")
    }

    await Video.findByIdAndDelete(videoId)

    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // check if the video with given id exists in the database
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // check if the user is the owner of the video
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video")
    }

    // toggle publish status
    video.isPublished = !video.isPublished // toggle the publish status of the video
    await video.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, { isPublished: video.isPublished }, `Video ${video.isPublished ? "published" : "unpublished"} successfully`))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}

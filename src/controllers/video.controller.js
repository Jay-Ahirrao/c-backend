import mongoose, { isObjectIdOrHexString, isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { pageValue = 1, limitValue = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    /*
        Model.aggregate([
            {stage1},
            {stage2},
            {stage3}
        ])

        Video.aggregate([
        { $match: { find all documnts which are public} },
        { $lookup: { if searched a query by user, find all fields where query matches, from all published videos} },
        { $unwind: "if no query and yes userId , then getAll videos for that userId, or channel videos" },
        { $project: {send only neccessary data , dont overload frontend} },
        { $sort: {sort as filter value given by frontend, by default - createdAt} },
        { $skip: number },   how many users to skip, pagination - satrt point
        { $limit: number } - pagination end point - limit
        ])  we can also use a , different 
    */
    const page = Number(pageValue) //url params converted to numbers
    const limit = Number(limitValue)

    // When you pass this object into a .find() or $match stage, MongoDB treats all top-level keys as an implicit AND operation.
    // Logic: isPublished MUST be true AND (the title matches OR the description matches).

    // ---------- MATCH FILTER ----------
    const matchStage = {
        isPublished: true
    }

    // ----------------search----------=
    if (query) {
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }

    // --------filter by owner-----------
    if (userId && await User.findById(userId)) {
        matchStage.owner = new mongoose.Types.ObjectId(String(userId))
    }

    // ---------sort stage =------- > The square brackets [] are a JavaScript ES6 feature called Computed Property Names.
    // It tells JavaScript: "Don't use the word 'sortBy' as the key. Instead, look at the value of the variable sortBy and use that.
    const sortStage = {
        [sortBy]: sortType === "asc" ? 1 : -1
    }

    // ---------- AGGREGATION ----------

    const aggregateResult = await Video.aggregate([
        {
            $match: matchStage
        },
        { // join owner for derails
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"  // convert arr of objs to obj, single
        },
        {
            $facet: {
                // Branch 1: Metadata
                metadata: [{ $count: "totalVideos" }],
                // Branch 2: Actual Data
                data: [
                    { $sort: sortStage },
                    { $skip: (page - 1) * limit },
                    { $limit: limit },
                    {
                        $project: {
                            title: 1,
                            description: 1,
                            thumbnail: 1,
                            videoFile: 1,
                            duration: 1,
                            views: 1,
                            createdAt: 1,
                            "owner._id": 1,
                            "owner.username": 1,
                            "owner.avatar": 1
                        }
                    }
                ]
            }
        }
    ])

    const videos = aggregateResult[0].data || []
    const totalVideos = aggregateResult[0].metadata[0]?.totalVideos || 0

    return res.status(200).json(
        new ApiResponse(200, "Videos fetched successfully", {
            videos,
            pagination: {
                page,
                limit,
                totalVideos,
                totalPages: Math.ceil(totalVideos / limit)
            }
        })
    )

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
    const videoPath = await uploadOnCloudinary(videoFile.path)
    console.log("Video upload result:", videoPath);

    console.log("Uploading thumbnail to Cloudinary...", thumbnail.path);
    const thumbnailPath = await uploadOnCloudinary(thumbnail.path)
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
        new ApiResponse(201, "Video published successfully", {
            videoId: vid._id,
            title: vid.title,
        })
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    //1. check if the video with given id exists in the database
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res.status(200).json(new ApiResponse(200, "Video fetched successfully", {video:video}, video))
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
        const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        
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

    return res.status(200).json(new ApiResponse(200, "Video deleted successfully"))

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
    await video.save()

    return res.status(200).json(new ApiResponse(200, `Video ${video.isPublished ? "published" : "unpublished"} successfully`))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}

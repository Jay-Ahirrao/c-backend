import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination



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

    //3. check if video file and thumbnail are present in the request
    const videoFile = req.files?.videoFile
    const thumbnail = req.files?.thumbnail
    if (!videoFile || !thumbnail) {
        throw new ApiError(400, "Video File and Thumbnail are required")
    }

    //4. upload video and thumbnail to cloudinary
    const videoPath = await uploadOnCloudinary(videoFile.tempFilePath)
    const thumbnailPath = await uploadOnCloudinary(thumbnail.tempFilePath)
    if (!videoPath || !thumbnailPath) {
        console.error("Failed to upload video or thumbnail to cloudinary")
        throw new ApiError(500, "Failed to upload video or thumbnail to cloudinary.")
    }

    //adding the uploaded video to the database
    const vid = await Video.create({
        videoFile: videoPath.secure_url,
        thumbnail: thumbnailPath.secure_url,
        title,
        description,
        owner: req.user._id,
        duration: videoPath.duration,
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

    return res.status(200).json(new ApiResponse(200, "Video fetched successfully", video.title, video))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    //1. check if the video with given id exists in the database
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
     
    //2. check if the user is the owner of the video
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video")
    }

    //3. update video details
    const {title, description, thumbnail} = req.body
    if (title) {
        video.title = title
    }
    if(description) {
        video.description = description
    }
    if(thumbnail) {
        const thumbnailPath = await uploadOnCloudinary(thumbnail.tempFilePath)
    } // to check how to delete old thunbnail from cloudinary and update with new one

    await video.save()

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}

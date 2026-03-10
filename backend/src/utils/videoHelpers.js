
import { Video } from "../models/video.model.js";

export const fetchVideosAggregate = async ({ matchStage, sortStage, page, limit }) => {
    const aggregateResult = await Video.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        { $unwind: "$owner" },
        {
            $facet: {
                metadata: [{ $count: "totalVideos" }],
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
    ]);

    return {
        videos: aggregateResult[0].data || [],
        totalVideos: aggregateResult[0].metadata[0]?.totalVideos || 0
    };
};

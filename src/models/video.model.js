import mongoose from 'mongoose';

const videoSchema = new Scheam(
{
    videoFile: {
        type: String, //Cloudinary URL
        required: true,
    },
    thumbnail: {
        type: String, //Image Cloudinary URL
        required: true,
    },
    title: {
        type: String, //Video Data Cloudinary URL
        required: true,
    },
    description: {
        type: String, //Cloudinary URL
        required: true,
    },
    duration:{
        type: String, //Cloudinary URL
        required: true,     
    },
    views: {
        type: Number,
        default: 0,
    },
    isPublished:{
        type:Boolean,
        default: true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User", //Reference to User model
        required: true
    }
},
{
    timestamps: true
});

export const Video = new mongoose.model('Video', videoSchema);

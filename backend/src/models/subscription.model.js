import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type : Schema.Types.ObjectId,
        ref : "User",
    },
    channel: {
        type : Schema.Types.ObjectId,
        ref : "User",
    }
}, {timestamps: true});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);

//stores list of documents with user channel and his subs (he is following)
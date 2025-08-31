import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        messages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Message",
                default: [],
            },
        ],
        isGroupChat: {
            type: Boolean,
            default: false,
        },
        groupName: {
            type: String,
            default: "",
        },
        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        groupPic: {
            type: String,
            default: "",
        },
        hiddenFor: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: []
        }],
    },
    { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
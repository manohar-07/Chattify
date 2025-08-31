import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import mongoose from "mongoose";


export const getConversations = async (req, res) => {
	try {
		const loggedInUserId = new mongoose.Types.ObjectId(req.user._id);

		const conversations = await Conversation.aggregate([
			// Stage 1: Find all conversations the user is a part of
			{
				$match: {
					participants: loggedInUserId,
					hiddenFor: { $ne: loggedInUserId } 
				},
			},
			// Stage 2: Get details of other participants
			{
				$lookup: {
					from: "users",
					localField: "participants",
					foreignField: "_id",
					as: "participants",
					pipeline: [
						{ $project: { password: 0 } },
					],
				},
			},

			// Stage 3: Get all messages for each conversation
			{
				$lookup: {
					from: "messages",
					localField: "messages",
					foreignField: "_id",
					as: "messages",
					pipeline: [{ $sort: { createdAt: -1 } }],
				},
			},

			// Stage 4: Add the last message to the top level
			{
				$addFields: {
					lastMessage: { $first: "$messages" },
				},
			},

			// Stage 5: Shape the final output
			{
				$project: {
					_id: 1,
					participants: 1,
					isGroupChat: 1,
					groupName: 1,
					groupPic: 1,
					groupAdmin: 1,
					createdAt: 1,
					updatedAt: 1,
					messages: ["$lastMessage"],
				},
			},
            
			// Stage 6: Sort conversations by the date of the last message
			{ $sort: { "messages.createdAt": -1 } },
		]);

		res.status(200).json(conversations);
	} catch (error) {
		console.log("Error in getConversations", error.message);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const getMessages = async (req, res) => {
    try {
        const { id: conversationId } = req.params;

        const conversation = await Conversation.findById(conversationId).populate("messages");

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        res.status(200).json(conversation.messages);
    } catch (error) {
        console.log("Error in getMessages", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: conversationId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        const newMessage = new Message({
            senderId,
            conversationId,
            text,
            image: imageUrl,
        });

        // Save the message and add it to the conversation's message array
        await Promise.all([
            newMessage.save(),
            conversation.updateOne({ $push: { messages: newMessage._id } }),
        ]);

        
        // Emit the new message to all participants in the conversation room
        conversation.participants.forEach(participantId => {
            const socketId = getReceiverSocketId(participantId.toString());
            if (socketId) {
                io.to(socketId).emit("newMessage", newMessage);
            }
        });

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
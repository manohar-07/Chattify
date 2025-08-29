import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";


export const getConversations = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const conversations = await Conversation.find({ participants: loggedInUserId })
            .populate({
                path: "participants",
                select: "fullName profilePic", 
            })
            .populate({
                path: "messages",
                options: { sort: { createdAt: -1 }, limit: 1 } 
            });

        // Remove the current user from the participants list in each conversation
        conversations.forEach(conversation => {
            conversation.participants = conversation.participants.filter(
                participant => participant._id.toString() !== loggedInUserId.toString()
            );
        });

        res.status(200).json(conversations);
    } catch (error) {
        console.log("Error in getConversations", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}



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
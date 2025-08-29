import Conversation from "../models/conversation.model.js";

export const findOrCreateConversation = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { receiverId } = req.body;

        // Find a non-group conversation that includes BOTH the sender and receiver
        let conversation = await Conversation.findOne({
            isGroupChat: false,
            participants: { $all: [senderId, receiverId] },
        });

        // If a conversation is found, return it
        if (conversation) {
            return res.status(200).json(conversation);
        }

        // If not found, create a new one-on-one conversation
        conversation = new Conversation({
            participants: [senderId, receiverId],
        });

        await conversation.save();

        res.status(201).json(conversation);

    } catch (error) {
        console.log("Error in findOrCreateConversation controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
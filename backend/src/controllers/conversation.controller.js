import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

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
			const isHidden = conversation.hiddenFor.includes(senderId);

			if (isHidden) {
				await Conversation.updateOne({ _id: conversation._id }, { $pull: { hiddenFor: senderId } });
			}
			
			// Populate and return the now-visible conversation
			const populatedConversation = await Conversation.findById(conversation._id)
				.populate("participants", "-password")
				.populate({
					path: "messages",
					options: { sort: { createdAt: -1 }, limit: 1 },
				});
			return res.status(200).json(populatedConversation);
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

export const hideOrLeaveConversation = async (req, res) => {
	try {
		const { id: conversationId } = req.params;
		const userId = req.user._id;

		const conversation = await Conversation.findById(conversationId);
		if (!conversation) return res.status(404).json({ message: "Conversation not found" });

		if (conversation.isGroupChat) {

			let systemMessageText = `${req.user.fullName} has left the group`;

			if (userId.toString() === conversation.groupAdmin.toString()) {
				const remainingParticipants = conversation.participants.filter(
					(p) => p.toString() !== userId.toString()
				);

				// If there are members left, promote the first one to be the new admin
				if (remainingParticipants.length > 0) {
					const newAdminId = remainingParticipants[0];
					await Conversation.updateOne({ _id: conversationId }, { groupAdmin: newAdminId });

					const newAdmin = await User.findById(newAdminId).select("fullName");
					systemMessageText = `${req.user.fullName} left. ${newAdmin.fullName} is the new admin.`;
				}
			}
			
			// Now, remove the user and create the system message as before
			await Conversation.updateOne({ _id: conversationId }, { $pull: { participants: userId } });
			console.log("SYSTEM MESSAGE TO BE SAVED:", systemMessageText);
			const systemMessage = new Message({
				conversationId,
				senderId: userId,
				text: systemMessageText,
				messageType: "system",
			});
			
			await systemMessage.save();
			await Conversation.updateOne({ _id: conversationId }, { $push: { messages: systemMessage._id } });


			res.status(200).json({ message: "You have left the group" });
		} else {
			// --- LOGIC FOR HIDING A 1-ON-1 CHAT ---
			await Conversation.updateOne({ _id: conversationId }, { $addToSet: { hiddenFor: userId } });
			res.status(200).json({ message: "Conversation hidden successfully" });
		}
	} catch (error) {
		console.log("Error in hideOrLeaveConversation controller", error.message);
		res.status(500).json({ message: "Internal Server Error" });
	}
};
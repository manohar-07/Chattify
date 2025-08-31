import Conversation from "../models/conversation.model.js";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId ,io} from "../lib/socket.js";

export const createGroup = async (req, res) => {
    try {
        const { groupName, participants } = req.body; 
        const admin = req.user._id; // The creator is the admin

        if (!groupName || !participants || participants.length === 0) {
            return res.status(400).json({ message: "Group name and participants are required." });
        }

        if (participants.length < 2) {
            return res.status(400).json({ message: "A group must have at least 3 members (including you)." });
        }

        // Add the admin to the participants list
        const allParticipants = [...participants, admin];

        // Create a new conversation document
        const newGroup = new Conversation({
            isGroupChat: true,
            groupName,
            groupAdmin: admin,
            participants: allParticipants,
        });

        await newGroup.save();
		const populatedGroup = await Conversation.findById(newGroup._id).populate("participants", "-password");
        res.status(201).json(populatedGroup);

    } catch (error) {
        console.log("Error in createGroup controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateGroupDetails = async (req, res) => {
	try {
		const { groupName, groupPic } = req.body;
		const { id: conversationId } = req.params;
		const userId = req.user._id;

		const conversationToUpdate = await Conversation.findById(conversationId);

		if (!conversationToUpdate) {
			return res.status(404).json({ message: "Group not found" });
		}

		if (conversationToUpdate.groupAdmin.toString() !== userId.toString()) {
			return res.status(403).json({ message: "Only the group admin can edit group details" });
		}

		const updates = {};
		if (groupName) {
			updates.groupName = groupName;
		}

		if (groupPic) {
			const uploadResponse = await cloudinary.uploader.upload(groupPic);
			updates.groupPic = uploadResponse.secure_url;
		}

		// --- THE FIX IS HERE ---

		// Step 1: Perform ONLY the update first.
		await Conversation.findByIdAndUpdate(conversationId, updates);

		// Step 2: As a separate step, find the fully updated document and populate it.
		const updatedConversation = await Conversation.findById(conversationId).populate(
			"participants",
			"-password"
		);

		updatedConversation.participants.forEach(participant => {
		const socketId = getReceiverSocketId(participant._id.toString());
		if (socketId) {
			io.to(socketId).emit("conversationUpdated", updatedConversation);
			}
		});

		res.status(200).json(updatedConversation);
	} catch (error) {
		console.log("Error in updateGroupDetails controller", error.message);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const addMembers = async (req, res) => {
	try {
		const { memberIds } = req.body;
		const { id: conversationId } = req.params;
		const userId = req.user._id;

		const conversation = await Conversation.findById(conversationId);
		if (!conversation) return res.status(404).json({ message: "Group not found" });
		if (conversation.groupAdmin.toString() !== userId.toString()) {
			return res.status(403).json({ message: "Only the admin can add members" });
		}

		await Conversation.updateOne({ _id: conversationId }, { $addToSet: { participants: { $each: memberIds } } });

		const newMembers = await User.find({ _id: { $in: memberIds } }).select("fullName");
		const newMemberNames = newMembers.map((member) => member.fullName).join(", ");
		
		const systemMessage = new Message({
			conversationId,
			senderId: userId,
			text: `${req.user.fullName} added ${newMemberNames} to the group`,
			messageType: "system",
		});
		await systemMessage.save();
		await Conversation.updateOne({ _id: conversationId }, { $push: { messages: systemMessage._id } });

        // Fetch the updated conversation with participants and latest message
        const updatedConversation = await Conversation.findById(conversationId)
            .populate("participants", "-password")
            .populate({
                path: "messages",
                options: { sort: { createdAt: -1 }, limit: 1 }
            });
		
			const existingParticipants = conversation.participants.filter(p => !memberIds.includes(p.toString()));
			// 1. Notify EXISTING members that the conversation was updated
			existingParticipants.forEach(participant => {
				const socketId = getReceiverSocketId(participant.toString());
				if (socketId) {
					io.to(socketId).emit("conversationUpdated", updatedConversation);
				}
			});

			// 2. Notify the NEW members that they've been added to a group
			memberIds.forEach(memberId => {
				const socketId = getReceiverSocketId(memberId.toString());
				if (socketId) {
					io.to(socketId).emit("addedToGroup", updatedConversation);
				}
			});
		res.status(200).json(updatedConversation); // Send the updated conversation back
	} catch (error) {
		console.log("Error in addMembers controller", error.message);
		res.status(500).json({ message: "Internal Server Error" });
	}
};


export const removeMember = async (req, res) => {
	try {
		const { memberId } = req.body;
		const { id: conversationId } = req.params;
		const userId = req.user._id;

		const conversation = await Conversation.findById(conversationId);
		if (!conversation) return res.status(404).json({ message: "Group not found" });
		if (conversation.groupAdmin.toString() !== userId.toString()) {
			return res.status(403).json({ message: "Only the admin can remove members" });
		}
		if (memberId === userId.toString()) {
			return res.status(400).json({ message: "Admin cannot be removed" });
		}

		// Update the participants list
		await Conversation.updateOne({ _id: conversationId }, { $pull: { participants: memberId } });
        const removedMember = await User.findById(memberId).select("fullName");

		// Create the system message
		const systemMessage = new Message({
			conversationId,
			senderId: userId,
			text: `${req.user.fullName} removed ${removedMember.fullName} from the group`,
			messageType: "system",
		});
		await systemMessage.save();
		await Conversation.updateOne({ _id: conversationId }, { $push: { messages: systemMessage._id } });

        // Fetch the updated conversation with participants and latest message
        const updatedConversation = await Conversation.findById(conversationId)
            .populate("participants", "-password")
            .populate({
                path: "messages",
                options: { sort: { createdAt: -1 }, limit: 1 }
            });

			
		// 1. Notify the REMAINING members that the conversation was updated
			updatedConversation.participants.forEach(participant => {
				const socketId = getReceiverSocketId(participant._id.toString());
				if (socketId) {
					io.to(socketId).emit("conversationUpdated", updatedConversation);
				}
			});

			// 2. Notify the REMOVED member that they should delete the conversation
			const removedMemberSocketId = getReceiverSocketId(memberId.toString());
			if (removedMemberSocketId) {
				io.to(removedMemberSocketId).emit("removedFromGroup", { conversationId });
			}


		res.status(200).json(updatedConversation); // Send the updated conversation back
	} catch (error) {
		console.log("Error in removeMember controller", error.message);
		res.status(500).json({ message: "Internal Server Error" });
	}
};
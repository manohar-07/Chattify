import Conversation from "../models/conversation.model.js";
import cloudinary from "../lib/cloudinary.js";

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

        res.status(201).json(newGroup);

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

		res.status(200).json(updatedConversation);
	} catch (error) {
		console.log("Error in updateGroupDetails controller", error.message);
		res.status(500).json({ message: "Internal Server Error" });
	}
};
import Conversation from "../models/conversation.model.js";

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
// frontend/src/components/AddMemberModal.jsx
import { useState } from "react";
import UserList from "./UserList";
import { useChatStore } from "../store/useChatStore";

const AddMemberModal = ({ conversation, onClose }) => {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const { addMembersToGroup } = useChatStore(); // We will create this action next

    const handleCreate = async () => {
        const memberIds = selectedUsers.map(u => u._id);
        await addMembersToGroup(conversation._id, memberIds);
        onClose();
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                <h3 className="font-bold text-lg">Add New Members</h3>
                
                {/* We will need to update UserList to accept an 'exclude' prop */}
                <UserList 
                    selectedUsers={selectedUsers} 
                    onUserSelect={(user) => setSelectedUsers(prev => 
                        prev.some(u => u._id === user._id) 
                        ? prev.filter(u => u._id !== user._id) 
                        : [...prev, user]
                    )}
                    exclude={conversation.participants.map(p => p._id)}
                />

                <div className="modal-action">
                    <button className="btn" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleCreate} disabled={selectedUsers.length === 0}>Add</button>
                </div>
            </div>
        </div>
    );
};
export default AddMemberModal;
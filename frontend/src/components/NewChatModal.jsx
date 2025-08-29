import { useState } from "react";
import UserList from "./UserList";
import { axiosInstance } from "../lib/axios";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const NewChatModal = ({ onClose }) => {
	const [selectedUsers, setSelectedUsers] = useState([]);
	const [groupName, setGroupName] = useState("");
	const [loading, setLoading] = useState(false);
	const { fetchConversations, setSelectedConversation } = useChatStore();

	const handleUserSelect = (user) => {
		setSelectedUsers((prev) =>
			prev.some((u) => u._id === user._id)
				? prev.filter((u) => u._id !== user._id)
				: [...prev, user]
		);
	};

	const handleCreate = async () => {
		setLoading(true);
		try {
			let newConversation;
			if (selectedUsers.length === 1) {
				// Find or create 1-on-1 chat
				const res = await axiosInstance.post("/conversations", { receiverId: selectedUsers[0]._id });
				newConversation = res.data;
			} else {
				// Create a group chat
				if (!groupName.trim()) return toast.error("Group name is required");
				const participantIds = selectedUsers.map((u) => u._id);
				const res = await axiosInstance.post("/groups/create", {
					groupName,
					participants: participantIds,
				});
				newConversation = res.data;
			}
			await fetchConversations(); // Refresh the sidebar
			setSelectedConversation(newConversation); // Select the new chat
			onClose(); // Close the modal
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='modal modal-open'>
			<div className='modal-box'>
				<button onClick={onClose} className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>
					✕
				</button>
				<h3 className='font-bold text-lg'>Start a new chat</h3>
				<p className='py-2 text-sm text-base-content/70'>Select one for a private chat or multiple for a group.</p>

				<UserList selectedUsers={selectedUsers} onUserSelect={handleUserSelect} />

				{selectedUsers.length > 1 && (
					<div className='mt-4'>
						<input
							type='text'
							placeholder='Enter group name...'
							className='input input-bordered w-full'
							value={groupName}
							onChange={(e) => setGroupName(e.target.value)}
						/>
					</div>
				)}

				<div className='modal-action'>
					<button className='btn' onClick={onClose}>
						Cancel
					</button>
					<button
						className='btn btn-primary'
						disabled={loading || selectedUsers.length === 0}
						onClick={handleCreate}
					>
						{loading ? <span className='loading loading-spinner' /> : "Create"}
					</button>
				</div>
			</div>
		</div>
	);
};
export default NewChatModal;
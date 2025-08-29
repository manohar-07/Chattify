import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const Conversation = ({ conversation }) => {
	const { authUser } = useAuthStore();
	const { selectedConversation, setSelectedConversation } = useChatStore();

	const otherParticipant = conversation.participants[0];
	const isSelected = selectedConversation?._id === conversation._id;

	return (
		<button
			onClick={() => setSelectedConversation(conversation)}
			className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors
      ${isSelected ? "bg-base-300 ring-1 ring-base-300" : ""}`}
		>
			<div className='relative mx-auto lg:mx-0'>
				<img
					src={conversation.isGroupChat ? "/group_avatar.png" : otherParticipant.profilePic || "/avatar.png"}
					alt='chat avatar'
					className='size-12 object-cover rounded-full'
				/>
				{/* Online status can be added later if needed */}
			</div>

			<div className='hidden lg:block text-left min-w-0'>
				<div className='font-medium truncate'>
					{conversation.isGroupChat ? conversation.groupName : otherParticipant.fullName}
				</div>
				<div className='text-sm text-base-content/70 truncate'>
					{conversation.messages[0]?.text || "Start a conversation"}
				</div>
			</div>
		</button>
	);
};
export default Conversation;
import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = ({ onHeaderClick }) => {
	const { selectedConversation, setSelectedConversation } = useChatStore();
	const { authUser } = useAuthStore();

	let chatDisplayName;
	let chatDisplayImage;

	if (selectedConversation.isGroupChat) {
		chatDisplayName = selectedConversation.groupName;
		chatDisplayImage = selectedConversation.groupPic || "/group_avatar.png";
	} else {
		const otherParticipant = selectedConversation.participants.find((p) => p._id !== authUser._id);
		chatDisplayName = otherParticipant.fullName;
		chatDisplayImage = otherParticipant.profilePic || "/avatar.png";
	}

	return (
		<div className='p-2.5 border-b border-base-300'>
			<div className='flex items-center justify-between'>
				<button
					className={`flex items-center gap-3 w-full ${
						selectedConversation.isGroupChat ? "cursor-pointer hover:bg-base-200 rounded-md p-1" : "cursor-default p-1"
					}`}
					onClick={selectedConversation.isGroupChat ? onHeaderClick : undefined}
				>
					
					<div className='avatar'>
						<div className='size-10 rounded-full relative'>
							<img src={chatDisplayImage} alt={chatDisplayName} />
						</div>
					</div>

					<div>
						<h3 className='font-medium'>{chatDisplayName}</h3>
					</div>
				</button>

				{/* Close button remains separate */}
				<button onClick={() => setSelectedConversation(null)}>
					<X />
				</button>
			</div>
		</div>
	);
};
export default ChatHeader;
import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
	// 1. Get the new state from the store
	const { selectedConversation, setSelectedConversation } = useChatStore();
	const { authUser } = useAuthStore();

	// 2. Add logic to determine the correct display name and image
	let chatDisplayName;
	let chatDisplayImage;

	if (selectedConversation.isGroupChat) {
		chatDisplayName = selectedConversation.groupName;
		chatDisplayImage = "/group_avatar.png";
	} else {
		// It's a 1-on-1 chat, find the other participant
		const otherParticipant = selectedConversation.participants[0];
		chatDisplayName = otherParticipant.fullName;
		chatDisplayImage = otherParticipant.profilePic || "/avatar.png";
	}

	return (
		<div className='p-2.5 border-b border-base-300'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					{/* Avatar */}
					<div className='avatar'>
						<div className='size-10 rounded-full relative'>
							<img src={chatDisplayImage} alt={chatDisplayName} />
						</div>
					</div>

					{/* User info */}
					<div>
						<h3 className='font-medium'>{chatDisplayName}</h3>
						{/* Online status can be improved later for groups */}
					</div>
				</div>

				{/* Close button */}
				<button onClick={() => setSelectedConversation(null)}>
					<X />
				</button>
			</div>
		</div>
	);
};
export default ChatHeader;
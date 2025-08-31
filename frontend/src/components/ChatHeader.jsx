import { MoreVertical, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = ({ onHeaderClick }) => {
	const { selectedConversation, setSelectedConversation, leaveOrDeleteConversation } = useChatStore();
	const { authUser } = useAuthStore();

	// Safety check to prevent crashes if the component renders before conversation is ready
	if (!selectedConversation) return null;

	let chatDisplayName;
	let chatDisplayImage;

	if (selectedConversation.isGroupChat) {
		chatDisplayName = selectedConversation.groupName;
		chatDisplayImage = selectedConversation.groupPic || "/group_avatar.png";
	} else {
		const otherParticipant = selectedConversation.participants?.find((p) => p._id !== authUser._id);
		chatDisplayName = otherParticipant?.fullName || "Chat User";
		chatDisplayImage = otherParticipant?.profilePic || "/avatar.png";
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

				<div className='flex items-center gap-2'>
					{/* Render the "More Options" dropdown only for 1-on-1 chats */}
					{!selectedConversation.isGroupChat && (
						<div className='dropdown dropdown-end'>
							<div tabIndex={0} role='button' className='btn btn-ghost btn-circle btn-sm'>
								<MoreVertical size={20} />
							</div>
							<ul
								tabIndex={0}
								className='dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-52'
							>
								<li>
									<a onClick={() => leaveOrDeleteConversation(selectedConversation)}>
                                        Delete Conversation
                                    </a>
								</li>
							</ul>
						</div>
					)}

					<button className='btn btn-ghost btn-circle btn-sm' onClick={() => setSelectedConversation(null)}>
						<X size={20}/>
					</button>
				</div>
			</div>
		</div>
	);
};
export default ChatHeader;
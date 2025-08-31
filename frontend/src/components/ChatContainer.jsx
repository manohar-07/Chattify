import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import GroupInfoModal from "./GroupInfoModal";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";



const ChatContainer = () => {
	const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);

	const {
		messages,
		fetchMessages, // Changed from getMessages
		isMessagesLoading,
		selectedConversation, // Changed from selectedUser
		subscribeToMessages,
		unsubscribeFromMessages,
	} = useChatStore();

	const { authUser } = useAuthStore();
	const messageEndRef = useRef(null);

	// 1. Update useEffect to use selectedConversation._id
	useEffect(() => {
		if (selectedConversation) {
			fetchMessages(selectedConversation._id);
			subscribeToMessages();
		}
		return () => unsubscribeFromMessages();
	}, [selectedConversation, fetchMessages, subscribeToMessages, unsubscribeFromMessages]);

	useEffect(() => {
		if (messageEndRef.current && messages) {
			messageEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);
	
	const getSenderProfilePic = (senderId) => {
		if (senderId === authUser._id) return authUser.profilePic || "/avatar.png";
		// For both 1-on-1 and group chats, find the sender in the participants list
		const sender = selectedConversation.participants.find(p => p._id === senderId);
		return sender?.profilePic || "/avatar.png";
	};


	if (isMessagesLoading) {
		return (
			<div className='flex-1 flex flex-col overflow-auto'>
				<ChatHeader />
				<MessageSkeleton />
				<MessageInput />
			</div>
		);
	}

	return (
		<div className='flex-1 flex flex-col overflow-auto'>
			<ChatHeader onHeaderClick={() => setIsGroupInfoOpen(true)} />

			<div className='flex-1 overflow-y-auto p-4 space-y-4'>
				{messages.map((message) => {
					if (message.messageType === 'system') {
						return (
							<div key={message._id} className="text-center text-sm text-base-content/60 my-2 italic">
								{message.text}
							</div>
						);
					}
					return (
					<div
						key={message._id}
						className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
						ref={messageEndRef}
					>
						<div className=' chat-image avatar'>
							<div className='size-10 rounded-full border'>
								{/* 2. Update avatar logic to work for groups */}
								<img
									src={getSenderProfilePic(message.senderId)}
									alt='profile pic'
								/>
							</div>
						</div>
						<div className='chat-header mb-1'>
							<time className='text-xs opacity-50 ml-1'>
								{formatMessageTime(message.createdAt)}
							</time>
						</div>
						<div className='chat-bubble flex flex-col'>
							{message.image && (
								<img
									src={message.image}
									alt='Attachment'
									className='sm:max-w-[200px] rounded-md mb-2'
								/>
							)}
							{message.text && <p>{message.text}</p>}
						</div>
					</div>
					);
			})}
			
			</div>

			<MessageInput />
			{isGroupInfoOpen && <GroupInfoModal conversation={selectedConversation} onClose={() => setIsGroupInfoOpen(false)} />}
		</div>
	);
};
export default ChatContainer;
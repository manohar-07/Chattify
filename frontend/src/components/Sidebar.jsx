import { useEffect, useState } from "react"; // 1. Import useState
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { MessageSquarePlus, Users } from "lucide-react";
import Conversation from "./Conversation";
import NewChatModal from "./NewChatModal"; // 2. Import the new modal

const Sidebar = () => {
	const { conversations, fetchConversations, isConversationsLoading } = useChatStore();
	const [isModalOpen, setIsModalOpen] = useState(false); // 3. Add state for the modal

	useEffect(() => {
		fetchConversations();
	}, [fetchConversations]);

	if (isConversationsLoading) return <SidebarSkeleton />;

	return (
		<aside className='h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200'>
			{/* Header */}
			<div className='border-b border-base-300 w-full p-5'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Users className='size-6' />
						<span className='font-medium hidden lg:block'>Conversations</span>
					</div>
					
					{/* 4. Make the button open the modal */}
					<button className='btn btn-sm btn-circle' onClick={() => setIsModalOpen(true)}>
						<MessageSquarePlus size={20} />
					</button>
				</div>
			</div>

			{/* Conversation List */}
			<div className='overflow-y-auto w-full py-3'>
				{conversations.map((conversation) => (
					<Conversation key={conversation._id} conversation={conversation} />
				))}
				{conversations.length === 0 && (
					<div className='text-center text-base-content/60 py-4'>No conversations yet</div>
				)}
			</div>
			
			{/* 5. Render the modal conditionally */}
			{isModalOpen && <NewChatModal onClose={() => setIsModalOpen(false)} />}
		</aside>
	);
};
export default Sidebar;
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  conversations: [],
  selectedConversation: null,
  messages: [],
  isConversationsLoading: false,
  isMessagesLoading: false,

  fetchConversations: async () => {
    set({ isConversationsLoading: true });
    try {
      const res = await axiosInstance.get("/messages/conversations");
      set({ conversations: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      set({ isConversationsLoading: false });
    }
  },

  //Fetches messages for a selected conversation ---
  fetchMessages: async (conversationId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${conversationId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  //Sends a message using a conversationId ---
  sendMessage: async (messageData) => {
    const { selectedConversation } = get();
    try {
      await axiosInstance.post(`/messages/send/${selectedConversation._id}`, messageData);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },

  updateGroup: async (conversationId, data) => {
    try {
        const res = await axiosInstance.put(`/groups/${conversationId}/update`, data);
        const updatedConversation = res.data;

        set((state) => ({
            // Update the main list of conversations
            conversations: state.conversations.map((c) =>
                c._id === conversationId ? { ...c, ...updatedConversation } : c
            ),
            // Update the selected conversation if it's the one being edited
            selectedConversation:
                state.selectedConversation?._id === conversationId
                    ? { ...state.selectedConversation, ...updatedConversation }
                    : state.selectedConversation,
        }));

        toast.success("Group updated successfully");
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update group");
    }
},

// Add this new function to useChatStore.js
leaveOrDeleteConversation: async (conversation) => {
    const isGroup = conversation.isGroupChat;
    const conversationId = conversation._id;

    // Show a confirmation dialog
    const confirmed = window.confirm(
        `Are you sure you want to ${isGroup ? "leave this group" : "delete this chat"}?`
    );
    if (!confirmed) return;

    try {
        await axiosInstance.delete(`/conversations/${conversationId}`);
        toast.success(isGroup ? "You have left the group" : "Chat deleted");

        // Refresh the sidebar and close the chat window
        set({ selectedConversation: null });
        get().fetchConversations();
    } catch (error) {
        toast.error(error.response?.data?.message || "An error occurred");
    }
},


removeMemberFromGroup: async (conversationId, memberId) => {
    try {
        const res = await axiosInstance.post(`/groups/${conversationId}/remove-member`, { memberId });
        const updatedConversation = res.data; // The fresh conversation object from the backend
        toast.success("Member removed");

        // Update both the main list and the selected conversation
        set(state => ({
            conversations: state.conversations.map(c => 
                c._id === conversationId ? updatedConversation : c
            ),
            selectedConversation: 
                state.selectedConversation?._id === conversationId 
                ? updatedConversation 
                : state.selectedConversation
        }));
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to remove member");
    }
},

addMembersToGroup: async (conversationId, memberIds) => {
    try {
        const res = await axiosInstance.post(`/groups/${conversationId}/add-members`, { memberIds });
        const updatedConversation = res.data;

        toast.success("Members added");

        set(state => ({
            conversations: state.conversations.map(c => 
                c._id === conversationId ? updatedConversation : c
            ),
            selectedConversation: 
                state.selectedConversation?._id === conversationId 
                ? updatedConversation 
                : state.selectedConversation
        }));
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to add members");
    }
},
  
  // Listens for messages in the current conversation ---
  subscribeToMessages: () => {
    const { selectedConversation } = get();
    if (!selectedConversation) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      // Only add the message if it belongs to the currently selected conversation
      if (newMessage.conversationId === selectedConversation._id) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },

handleConversationUpdate: (updatedConversation) => {
    set(state => ({
        // Update the conversation in the main list
        conversations: state.conversations.map(c => 
            c._id === updatedConversation._id ? updatedConversation : c
        ),
        // If the updated conversation is the one currently selected, update it too
        selectedConversation: 
            state.selectedConversation?._id === updatedConversation._id 
            ? updatedConversation 
            : state.selectedConversation
    }));
},

handleAddedToGroup: (newConversation) => {
    set((state) => ({
        conversations: [newConversation, ...state.conversations],
    }));
    toast.success(`You have been added to the group: ${newConversation.groupName}`);
},

handleRemovedFromGroup: (conversationId) => {
    set((state) => ({
        // Remove the conversation from the main list
        conversations: state.conversations.filter(c => c._id !== conversationId),

        // If the removed conversation was the one currently selected, close it
        selectedConversation: 
            state.selectedConversation?._id === conversationId 
            ? null 
            : state.selectedConversation
    }));
    toast.error(`You have been removed from ${conversationId.groupName} group.`);
},
  
  setSelectedConversation: (selectedConversation) => set({ selectedConversation }),
}));
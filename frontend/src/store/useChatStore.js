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
  
  setSelectedConversation: (selectedConversation) => set({ selectedConversation }),
}));
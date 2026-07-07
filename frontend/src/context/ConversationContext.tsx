import axios from "axios";
import { createContext, useEffect, useState, useCallback } from "react";

// Create the context
export const ConversationContext = createContext<any>(null);

export const ConversationProvider = ({ children }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // 🎯 Wrapped in useCallback so components can invoke it safely
  // without triggering unintended sub-component re-renders
  const fetchConversationsList = useCallback(async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/conversation/list`, {
        withCredentials: true,
      });
      if (res.data?.data) {
        setConversations(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching sidebar list:", err);
    }
  }, [backendUrl]);

  // Handle initialization and window sync signals
  useEffect(() => {
    fetchConversationsList();

    const handleSyncSignal = () => fetchConversationsList();
    window.addEventListener("newChatCreated", handleSyncSignal);

    return () => {
      window.removeEventListener("newChatCreated", handleSyncSignal);
    };
  }, [fetchConversationsList]);

  

  return (
    // 🎯 We expose BOTH the state and the updater function to the app!
    <ConversationContext.Provider
      value={{ conversations, setConversations, fetchConversationsList }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

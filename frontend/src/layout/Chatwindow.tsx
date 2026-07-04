import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import Sidebar from "./Sidebar";

export default function ChatWindow() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setaiResponse] = useState("");
  const { user } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversationsList = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/conversation/list`);
      setConversations(res.data.data);
    } catch (err) {
      console.error("Error fetching sidebar list:", err);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sidebar Conversation List
  useEffect(() => {
    fetchConversationsList();

    const handleSyncSignal = () => {
      
      fetchConversationsList();
    };

    window.addEventListener("newChatCreated", handleSyncSignal);

    return () => {
      window.removeEventListener("newChatCreated", handleSyncSignal);
    };
  }, []);

  // Fetch Chat messages

  useEffect(() => {
    // Prevents race conditions from fast context switching
    let isMounted = true;

    const fetchChatMessages = async () => {
      if (!conversationId) {
        setMessages([]);
        return;
      }

      try {
        const response = await axios.get(
          `${backendUrl}/api/chat/conversations/${conversationId}/messages`,
          { withCredentials: true }, // Pass secure HTTP-Only cookies to authorize the request
        );

        

        if (response.data.success && isMounted) {
          setMessages(response.data.response);
        }
      } catch (error) {
        if (!isMounted) return;
       

        toast.error("Unable to access requested conversation history.");
        setMessages([]);
        navigate("/dashboard");
      }
    };

    fetchChatMessages();

    return () => {
      isMounted = false;
    };
  }, [conversationId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userPrompt = input;

    setInput("");
    setLoading(true);

    const temporaryUserMessage = {
      id: Date.now(),
      sender: "user",
      text: userPrompt,
    };
    setMessages((prev) => [...prev, temporaryUserMessage]);

    try {
      const response = await axios.post(
        `${backendUrl}/api/chat/handle-user-prompt`,
        {
          conversationId: conversationId || null,
          prompt: userPrompt,
        },
        { withCredentials: true },
      );

      const payload = response.data.data;
      const aiReplyText = payload.reply;
      const returnedConvoId = payload.conversationId;
      setaiResponse(aiReplyText);

      const finalModelMessage = {
        id: Date.now() + 1,
        sender: "model",
        text: aiReplyText,
        routedModel: response.data.modelUsed || "gemini-2.5-flash",
        confidence: response.data.confidenceScore || 0.85,
      };

      setMessages((prev) => [...prev, finalModelMessage]);

      if (!conversationId && returnedConvoId) {
        navigate(`/chat/${returnedConvoId}`, { replace: true });
        const syncEvent = new CustomEvent("newChatCreated", {
          detail: returnedConvoId,
        });
        window.dispatchEvent(syncEvent);
      }
    } catch (error) {
      console.error("Routing transmission failure:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white font-sans overflow-hidden">
      {/* SIDEBAR PANEL PANEL CONTAINER  */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between">
        <div className="space-y-4">
          {/* LOGO */}

          <div className="pt-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
              lOGO
            </h3>

            <Sidebar
              conversations={conversations}
              setConversation={setConversations}
              refreshList={fetchConversationsList}
            />
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4">
          <button className="w-full text-left py-2 px-3 rounded-md text-sm flex items-center gap-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
            📊 Open System Analytics
          </button>
        </div>
      </aside>

      {/* Chat Frame */}
      <main className="flex-1 flex flex-col justify-between bg-slate-900">
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">
              Dynamic Gateway Router Console
            </h2>
            <p className="text-xs text-slate-400"></p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 px-3 py-1 rounded-full text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Operational Free Tiers Synced
          </div>
        </header>

        {/* ACTIVE CONVERSATION MESSAGES CANVAS CONTAINER */}
        <section className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-2xl px-4 py-3 rounded-2xl shadow-sm text-sm ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-slate-800 text-slate-100 border border-slate-700/50 rounded-tl-none"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </p>
              </div>

              {/* 🎯 THE INTERVIEW STANDOUT FEATURE: ROUTER INSPECTOR BADGE */}
              {msg.sender === "model" && msg.routedModel && (
                <div className="mt-1.5 flex items-center gap-2 text-[11px] font-medium text-slate-400 px-1">
                  <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-indigo-400 font-mono">
                    🤖 {msg.routedModel}
                  </span>
                  {msg.confidence && (
                    <span className="text-slate-500">
                      Confidence Score:{" "}
                      <span className="text-emerald-500 font-semibold">
                        {(msg.confidence * 100).toFixed(1)}%
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></div>
              <span className="text-xs text-slate-500 italic pl-1">
                Thinking...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </section>

        {/* BOTTOM USER INPUT FORM CONTROL FORM ACTION CANOPY */}
        <footer className="p-4 bg-slate-900 border-t border-slate-800/60">
          <form
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto flex gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g., test logic puzzles, prompt a cloud script setup, check tech stocks)..."
              className="flex-1 bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-xl px-4 py-3 text-sm placeholder-slate-400 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium text-sm px-5 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Dispatch
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}

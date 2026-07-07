import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setaiResponse] = useState("");
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      // if (!conversationId && returnedConvoId) {
      //   console.log("%c⧭ inside newpage", "color: #364cd9");
      //   navigate(`/chat/${returnedConvoId}`, { replace: true });
      //   const syncEvent = new CustomEvent("newChatCreated", {
      //     detail: returnedConvoId,
      //   });
      //   window.dispatchEvent(syncEvent);
      // }
    } catch (error) {
      console.error("Routing transmission failure:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ACTIVE CONVERSATION MESSAGES CANVAS CONTAINER */}
      <section className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg: any) => (
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
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>

            {msg.sender === "model" && msg.routedModel && (
              <div className="mt-1.5 flex items-center gap-2 text-[11px] font-medium #f1f5f9 px-1">
                <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 #00b660 font-mono">
                  🤖 {msg.routedModel}
                </span>
                {msg.confidence && (
                  <span className="#f1f5f9">
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
          <div className="flex items-center gap-2 text-sm #f1f5f9 font-medium">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></div>
            <span className="text-xs #f1f5f9 italic pl-1">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </section>

      {/* BOTTOM USER INPUT FORM CONTROL */}
      <footer className="p-4 bg-slate-900 border-t border-slate-800/60">
        <form
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-xl px-4 py-3 text-sm placeholder-slate-400 transition-all"
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
    </>
  );
}

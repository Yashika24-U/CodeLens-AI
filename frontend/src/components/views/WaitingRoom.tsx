import React, { useState } from "react";
import { Sparkles, Copy, Check, ArrowUp, Share2 } from "lucide-react";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

interface SyncWaitingRoomProps {
  roomId: string;
  userName?: string;
}

export default function WaitingRoom({
  roomId,
  userName,
}: SyncWaitingRoomProps) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sendStatus, setSendStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const syncLink = `${window.location.origin}/chat/${roomId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(syncLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSending(true);
    setSendStatus(null);

    try {
      await axios.post(
        `${backendUrl}/api/sync/invite`,
        { email: email.trim(), syncLink, roomId },
        { withCredentials: true },
      );
      setSendStatus({ type: "success", msg: "Invite sent successfully." });
      setEmail("");
    } catch (error) {
      setSendStatus({
        type: "error",
        msg: "Couldn't send the invite. Copy the link instead.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleWhatsAppShare = () => {
    const textMessage = encodeURIComponent(
      `Join my session — let's work through it together:\n\n${syncLink}`,
    );
    window.open(`https://api.whatsapp.com/send?text=${textMessage}`, "_blank");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 h-full bg-[#0a0a0b] text-slate-200 font-sans">
      <div className="w-full max-w-xl flex flex-col items-center text-center">
        {/* Eyebrow — mirrors the "WORKSPACE HOME" label */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#00B660]" />
          <span className="text-[11px] font-semibold tracking-[0.15em] text-[#00B660] uppercase">
            Team Sync
          </span>
        </div>

        {/* Headline — same serif treatment as "Up late, Yashi?" */}
        <h1 className="font-serif text-4xl sm:text-5xl text-white mb-3 leading-tight">
          Waiting on your teammate
        </h1>
        <p className="text-sm text-slate-500 max-w-sm mb-8">
          Share this session and they'll drop in the moment they open it.
        </p>

        {/* Status chip — same shape/logic as the sidebar's "Initialize Team Sync" chip */}
        <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.08] px-4 py-2 rounded-xl mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B660] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B660]" />
          </span>
          <span className="text-xs text-slate-300">
            No one's joined yet — this page updates the moment they do
          </span>
        </div>

        {/* Primary action — pill input, same language as "Ask code reviewer anything…" */}
        <form onSubmit={handleSendInvite} className="w-full mb-4">
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] focus-within:border-[#00B660]/40 rounded-full pl-5 pr-2 py-2 transition-colors">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Invite by email…"
              required
              className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
            />
            <button
              type="submit"
              disabled={isSending}
              aria-label="Send invite"
              className="shrink-0 w-9 h-9 rounded-full bg-[#00B660] hover:bg-[#00A356] disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowUp className="w-4 h-4 text-black" />
            </button>
          </div>
          {sendStatus && (
            <p
              className={`text-[11px] font-medium mt-2 text-left px-1 ${
                sendStatus.type === "success"
                  ? "text-emerald-400"
                  : "text-rose-400"
              }`}
            >
              {sendStatus.msg}
            </p>
          )}
        </form>

        {/* Secondary actions — quiet pill buttons, not competing cards */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied" : "Copy link"}
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

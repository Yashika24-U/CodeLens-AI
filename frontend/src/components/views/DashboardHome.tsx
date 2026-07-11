import React, { useState, useEffect } from "react";
import { Search, ArrowUp } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

interface DashboardHomeProps {
  userName?: string;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({}) => {
  const [greeting, setGreeting] = useState("");
  const [homeInput, setHomeInput] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const userName = user?.username;

  useEffect(() => {
    const getDynamicGreeting = (): string => {
      const hour = new Date().getHours();

      // Night Owl Phase (10 PM - 5 AM)
      if (hour >= 22 || hour < 5) {
        const nightPhrases = [
          `Late session, ${userName}?`,
          `Up late, ${userName}?`,
          `Midnight coding, ${userName}?`,
        ];
        return nightPhrases[Math.floor(Math.random() * nightPhrases.length)];
      }
      // Morning Phase (5 AM - 12 PM)
      if (hour >= 5 && hour < 12) {
        return `Good morning, ${userName}.`;
      }
      // Afternoon Phase (12 PM - 5 PM)
      if (hour >= 12 && hour < 17) {
        return `Welcome back, ${userName}.`;
      }
      // Evening Phase (5 PM - 10 PM)
      return `Good evening, ${userName}.`;
    };

    setGreeting(getDynamicGreeting());
  }, [userName]);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeInput.trim()) return;

    // 🟢 CRITICAL ARCHITECTURE STEP:
    // We navigate to a placeholder chat view, passing the text along inside window.history.state

    console.log("%c⧭Navigatingggg", "color: #00736b");
    navigate("/chat/new", { state: { initialPrompt: homeInput } });
  };

  return (
    // 🎨 Theme: Base Background shifted to Soho Dark Slate (#0b0c0c)
    <div className="relative flex flex-col items-center justify-start min-h-screen bg-[#0b0c0c] text-[#f8fafc] px-4 pt-[30vh] select-none overflow-hidden">
      {/* 🔮 Soho Accent Glow Layer instead of slate-blue */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,182,96,0.06)_0%,transparent_65%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        {/* 🌟 Soho Home Premium Greeting Block */}
        <div className="flex flex-col items-center justify-center gap-2 mb-10 select-none">
          {/* Elegant Sparkle Icon Accent using your Soho Green */}
          <div className="flex items-center justify-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-[#00b660] animate-pulse opacity-90"
              aria-hidden="true"
            >
              <path d="M12 2l2.4 7.2 7.2 2.4-7.2 2.4-2.4 7.2-2.4-7.2-7.2-2.4 7.2-2.4z" />
            </svg>

            {/* Subtitle Line */}
            <span className="text-xs font-semibold uppercase tracking-widest #f1f5f9">
              Workspace Home
            </span>
          </div>
          {/* Premium Editorial Greeting Text */}
          <h1 className="text-4xl font-normal tracking-tight text-center font-serif text-[#f1f5f9] drop-shadow-md">
            {greeting}
          </h1>
        </div>

        <form
          onSubmit={handleInitialSubmit}
          className="w-full bg-[#1e2129] border border-[#2e333f] rounded-full pl-6 pr-3 py-3 flex items-center gap-4 shadow-xl focus-within:border-[#00b660]/60 transition-all duration-300"
        >
          <Search size={20} className="text-[#00b660] shrink-0" />

          <input
            type="text"
            value={homeInput}
            onChange={(e) => setHomeInput(e.target.value)}
            placeholder="Ask code reviewer anything..."
            className="bg-transparent flex-1 outline-none text-base text-gray-200 placeholder-gray-500 w-full font-normal"
          />

          <button
            type="submit"
            disabled={!homeInput.trim()}
            className="bg-[#00b660] text-white hover:bg-[#00a354] p-2.5 rounded-full transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center shrink-0 cursor-pointer"
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardHome;

// ─── auth.shared.tsx ─────────────────────────────────────────────────────────
// Shared types, constants, icons, and helpers used by Login.tsx & Register.tsx
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
}

export interface PasswordStrength {
  score: number; // 0–5
  label: string;
  barColor: string; // Tailwind bg-* class
  textColor: string; // Tailwind text-* class
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  message?: string;
}

// ── Password Strength Helper ──────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;

  if (score <= 1)
    return {
      score,
      label: "Weak",
      barColor: "bg-red-500",
      textColor: "text-red-400",
    };
  if (score <= 2)
    return {
      score,
      label: "Fair",
      barColor: "bg-orange-400",
      textColor: "text-orange-400",
    };
  if (score <= 3)
    return {
      score,
      label: "Good",
      barColor: "bg-yellow-400",
      textColor: "text-yellow-400",
    };
  return {
    score,
    label: "Strong",
    barColor: "bg-emerald-400",
    textColor: "text-emerald-400",
  };
}

// ── Tailwind Class Constants ──────────────────────────────────────────────────

export const inputBase =
  "w-full bg-obsidian text-slate-200 text-sm border border-glass-border rounded-lg px-4 py-3 " +
  "focus:outline-none focus:border-gemini-blue focus:ring-1 focus:ring-gemini-blue " +
  "placeholder:text-slate-600 transition-all duration-200";

export const labelBase =
  "block text-xs uppercase tracking-widest text-slate-400 font-medium";

// ── Reusable UI Components ────────────────────────────────────────────────────

/** Brand logo + wordmark strip */
export function BrandRow() {
  return (
    <div className="flex items-center gap-2.5 mb-6">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gemini-blue to-gemini-cyan flex items-center justify-center shrink-0">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </div>
      <span className="text-slate-200 font-bold text-lg tracking-tight">
        PromptForge
      </span>
    </div>
  );
}

/** Full-screen cyber background: ambient glows + dot grid */
export function BackgroundGlow() {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute -bottom-40 -right-20 w-80 h-80 rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
    </div>
  );
}

/** Glassmorphic card wrapper — wraps the page content */
export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative z-1
      0 w-full max-w-md bg-obsidian-light border border-glass-border rounded-xl p-8"
      style={{
        boxShadow:
          "0 0 0 1px rgba(59,130,246,0.06), 0 32px 64px rgba(0,0,0,0.65)",
      }}
    >
      {children}
    </div>
  );
}

/** "──── or ────" divider */
export function OrDivider() {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-slate-600 text-[10px] uppercase tracking-widest">
        or
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

/** Eye toggle icon for password inputs */
export function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

/** Animated submit button — shows a spinner while loading */
export function SubmitButton({
  loading,
  disabled,
  label,
  loadingLabel,
}: {
  loading: boolean;
  disabled?: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full bg-gradient-to-r from-gemini-blue to-gemini-cyan text-white font-semibold
                 rounded-lg px-4 py-3 text-sm hover:opacity-90 transition-all duration-200
                 disabled:opacity-40 disabled:cursor-not-allowed
                 flex items-center justify-center gap-2 mt-2 cursor-pointer"
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
            />
          </svg>
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}

/** Single password checklist item */
export function CheckItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div
      className={`flex items-center gap-2 text-xs transition-colors duration-200
      ${met ? "text-emerald-400" : "text-slate-500"}`}
    >
      <span
        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0
        transition-all duration-200
        ${met ? "border-emerald-400 bg-emerald-400/20" : "border-slate-600"}`}
      >
        {met && (
          <svg
            width="8"
            height="8"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="2,6 5,9 10,3" />
          </svg>
        )}
      </span>
      {text}
    </div>
  );
}

/** Google OAuth button */
export function GoogleOAuthButton({
  label = "Continue with Google",
}: {
  label?: string;
}) {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-center gap-3 bg-obsidian border border-glass-border
                 rounded-lg px-4 py-3 text-sm text-slate-200 font-medium
                 hover:border-slate-500 hover:bg-white/5 transition-all duration-200"
    >
      <svg width="17" height="17" viewBox="0 0 48 48" className="shrink-0">
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
      </svg>
      {label}
    </button>
  );
}

/** GitHub OAuth button */
export function GitHubOAuthButton({
  label = "Continue with GitHub",
}: {
  label?: string;
}) {
  return (
    <a
      href="http://localhost:5000/api/auth/github"
      type="button"
      className="w-full flex items-center justify-center gap-3 bg-obsidian border border-glass-border
                 rounded-lg px-4 py-3 text-sm text-slate-200 font-medium
                 hover:border-slate-500 hover:bg-white/5 transition-all duration-200 cursor-po"
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="shrink-0 text-slate-200"
      >
        <path
          d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57
          0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695
          -.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99
          .105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225
          -.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405
          c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225
          0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3
          0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
        />
      </svg>
      {label}
    </a>
  );
}

// ─── Login.tsx ────────────────────────────────────────────────────────────────
// Login page for PromptForge — powered by React Hook Form
//
// Install dep:  npm install react-hook-form
// Route:        /login   (wire via React Router or Next.js routing)
// Navigate to register page by replacing the `useNavigate` / `router.push` call
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import {
  type LoginFormValues,
  inputBase,
  labelBase,
  BrandRow,
  BackgroundGlow,
  AuthCard,
  OrDivider,
  EyeIcon,
  SubmitButton,
  GitHubOAuthButton,
} from "../components/auth/auth.shared";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import axios from "axios";

// ─── Page Component ───────────────────────────────────────────────────────────

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // ── React Hook Form setup ──────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    mode: "onTouched", // validate on blur, then live on change
    defaultValues: { email: "", password: "" },
  });

  // ── Local UI state (not form values — RHF owns those) ─────────────────────
  const [showPassword, setShowPassword] = useState(false);

  // ── Submit handler ────────────────────────────────────────────────────────
  const onSubmit = async (data: LoginFormValues) => {
    await new Promise((r) => setTimeout(r, 1500)); // simulated network delay
    try {
      const resp = await login(data.email, data.password);

      // 2. Cast it using your existing type interface cleanly
      const typedResp = resp as LoginResponse;

      if (typedResp && typedResp.success) {
        toast.success("Welcome back!");

        navigate("/dashboard");
      } else {
        toast.error(
          typedResp.message || "Invalid credentials. Please try again.",
        );
      }
    } catch (error: unknown) {
      let errorMessage = "Something went wrong. Please try again.";

      if (axios.isAxiosError(error)) {
        // TypeScript now knows 'error.response' definitely exists!
        errorMessage = error.response?.data?.message || errorMessage;
      }

      toast.error(errorMessage);
    }
  };

  // ── Field class helper ────────────────────────────────────────────────────
  const fieldClass = (hasError: boolean) =>
    `${inputBase} ${hasError ? "border-red-500/60 focus:border-red-500 focus:ring-red-500" : ""}`;

  // ─────────────────────────────────────────────────────────────────────────

  const handleForgotPasswordSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    const currentEmail = getValues("email");
    if (!currentEmail || currentEmail.trim() === "") {
      alert("Please enter your email address first!");
      return; // Stop execution here
    }

    try {
      await axios.post(`http://localhost:5000/api/auth/forgot-password`, {
        email: currentEmail,
      });
      alert("Check your email for the reset link!");
    } catch (error) {
      console.error("Error sending reset email", error);
    }
  };
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-4 relative">
      <BackgroundGlow />

      <AuthCard>
        {/* ── Brand ───────────────────────────────────────────────────── */}
        <BrandRow />

        {/* ── Heading ─────────────────────────────────────────────────── */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-200 mb-1">
            Welcome back
          </h1>
          <p className="text-slate-400 text-sm">
            A place where high-quality prompts and code are engineered
          </p>
        </div>

        {/* ── OAuth Buttons ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <GitHubOAuthButton />
        </div>

        <OrDivider />

        {/* ── Form ─────────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
        >
          {/* Email */}
          <div>
            <label htmlFor="email" className={`${labelBase} mb-1.5`}>
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className={fieldClass(!!errors.email)}
              {...register("email", {
                required: "Email is required.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address.",
                },
              })}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className={labelBase}>
                Password
              </label>
              <button
                type="button"
                className="text-xs text-gemini-cyan hover:underline transition-colors cursor-pointer"
                onClick={handleForgotPasswordSubmit}
              >
                Forgot password?
              </button>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`${fieldClass(!!errors.password)} pr-11`}
                {...register("password", {
                  required: "Password is required.",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters.",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500
                           hover:text-slate-300 transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <SubmitButton
            loading={isSubmitting}
            label="Sign In"
            loadingLabel="Signing in…"
          />
        </form>

        {/* ── Footer link ──────────────────────────────────────────────── */}
        <p className="text-center text-slate-500 text-sm mt-6">
          No account yet?
          {/*
            Replace this <a> with your router's <Link to="/register"> or
            Next.js <Link href="/register"> as needed.
          */}
          <a
            href="/register"
            className="text-gemini-cyan hover:underline font-medium transition-colors"
          >
            Create one
          </a>
        </p>
      </AuthCard>
    </div>
  );
}

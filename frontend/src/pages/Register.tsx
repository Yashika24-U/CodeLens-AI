// ─── Register.tsx ─────────────────────────────────────────────────────────────
// Registration page for Code Wiki — powered by React Hook Form
//
// Install dep:  npm install react-hook-form
// Route:        /register  (wire via React Router or Next.js routing)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  type RegisterFormValues,
  getPasswordStrength,
  inputBase,
  labelBase,
  BrandRow,
  BackgroundGlow,
  AuthCard,
  OrDivider,
  EyeIcon,
  SubmitButton,
  CheckItem,
  GitHubOAuthButton,
  type LoginResponse,
} from "../components/auth/auth.shared";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// ─── Page Component ───────────────────────────────────────────────────────────

export default function RegisterPage() {
  const navigate = useNavigate();
  // ── React Hook Form setup ──────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    mode: "onTouched",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreedToTerms: false,
    },
  });

  // ── Watch live values for derived UI ─────────────────────────────────────
  const watchedPassword = watch("password");
  const watchedConfirm = watch("confirmPassword");
  const watchedAgreed = watch("agreedToTerms");

  // ── Local UI-only state ───────────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Derived password state ────────────────────────────────────────────────
  const strength = getPasswordStrength(watchedPassword);

  const passwordChecks = {
    length: watchedPassword.length >= 8,
    upper: /[A-Z]/.test(watchedPassword),
    number: /[0-9]/.test(watchedPassword),
    special: /[^A-Za-z0-9]/.test(watchedPassword),
  };

  const passwordsMatch =
    watchedPassword.length > 0 && watchedPassword === watchedConfirm;
  const passwordsMismatch =
    watchedConfirm.length > 0 && watchedPassword !== watchedConfirm;

  // ── Submit handler ────────────────────────────────────────────────────────
  const onSubmit = async (data: RegisterFormValues) => {
    // Replace with your real auth call, e.g.:
    //   await createAccount(data.username, data.email, data.password)
    await new Promise((r) => setTimeout(r, 1500)); // simulated network delay
    try {
      const response = await api.post<LoginResponse>(
        "/api/auth/register",
        data,
      );

      if (response.data.success) {
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(`Error : ${error}`);
    }
  };

  // ── Field class helpers ───────────────────────────────────────────────────
  const fieldClass = (hasError: boolean) =>
    `${inputBase} ${hasError ? "border-red-500/60 focus:border-red-500 focus:ring-red-500" : ""}`;

  const confirmFieldClass = () => {
    if (passwordsMismatch)
      return `${inputBase} pr-11 border-red-500/60 focus:border-red-500 focus:ring-red-500`;
    if (passwordsMatch)
      return `${inputBase} pr-11 border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500`;
    return `${inputBase} pr-11`;
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-4 relative">
      <BackgroundGlow />

      <AuthCard>
        {/* ── Brand ───────────────────────────────────────────────────── */}
        <BrandRow />

        {/* ── Heading ─────────────────────────────────────────────────── */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-200 mb-1">
            Create your account
          </h1>
          <p className="text-slate-400 text-sm">
            A place where high-quality prompts and code are engineered
          </p>
        </div>

        {/* ── OAuth Buttons ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {/* <GoogleOAuthButton label="Google" /> */}
          <GitHubOAuthButton label="GitHub" />
        </div>

        <OrDivider />

        {/* ── Form ─────────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
        >
          {/* Username */}
          <div>
            <label htmlFor="username" className={`${labelBase} mb-1.5`}>
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="CodeLearner99"
              autoComplete="username"
              className={fieldClass(!!errors.username)}
              {...register("username", {
                required: "Username is required.",
                minLength: { value: 3, message: "At least 3 characters." },
                maxLength: { value: 20, message: "At most 20 characters." },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: "Only letters, numbers, and underscores.",
                },
              })}
            />
            {errors.username && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.username.message}
              </p>
            )}
          </div>

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

          {/* Password + Strength */}
          <div>
            <label htmlFor="password" className={`${labelBase} mb-1.5`}>
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                className={`${fieldClass(!!errors.password)} pr-11`}
                {...register("password", {
                  required: "Password is required.",
                  minLength: {
                    value: 8,
                    message: "Must be at least 8 characters.",
                  },
                  validate: {
                    hasUpper: (v) =>
                      /[A-Z]/.test(v) || "Needs an uppercase letter.",
                    hasNumber: (v) =>
                      /[0-9]/.test(v) || "Needs at least one number.",
                    hasSpecial: (v) =>
                      /[^A-Za-z0-9]/.test(v) || "Needs a special character.",
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

            {/* ── Strength bar (visible once user starts typing) ───────── */}
            {watchedPassword.length > 0 && (
              <div className="mt-3 space-y-2">
                {/* Bar + label */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.barColor}`}
                      style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-semibold transition-colors duration-200 ${strength.textColor}`}
                  >
                    {strength.label}
                  </span>
                </div>

                {/* Checklist */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-0.5">
                  <CheckItem
                    met={passwordChecks.length}
                    text="At least 8 characters"
                  />
                  <CheckItem
                    met={passwordChecks.upper}
                    text="One uppercase letter"
                  />
                  <CheckItem met={passwordChecks.number} text="One number" />
                  <CheckItem
                    met={passwordChecks.special}
                    text="One special character"
                  />
                </div>
              </div>
            )}

            {/* RHF validation error (shown on blur/submit) */}
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className={`${labelBase} mb-1.5`}>
              Confirm password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your password"
                autoComplete="new-password"
                className={confirmFieldClass()}
                {...register("confirmPassword", {
                  required: "Please confirm your password.",
                  validate: (val) =>
                    val === watchedPassword || "Passwords don't match.",
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500
                           hover:text-slate-300 transition-colors cursor-pointer"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>

            {passwordsMismatch && !errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-red-400">
                Passwords don't match.
              </p>
            )}
            {passwordsMatch && (
              <p className="mt-1.5 text-xs text-emerald-400">
                Passwords match ✓
              </p>
            )}
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms & Conditions — manually managed via RHF setValue */}
          <div className="flex items-start gap-3 pt-1">
            {/*
              We use a custom-styled div as the checkbox UI while keeping
              the real <input type="checkbox"> hidden for RHF to track.
            */}
            <input
              type="checkbox"
              id="agreedToTerms"
              className="sr-only" // visually hidden; focus handled by the visual div below
              {...register("agreedToTerms", {
                validate: (v) => v === true || "You must accept the terms.",
              })}
            />
            <button
              type="button"
              role="checkbox"
              aria-checked={watchedAgreed}
              aria-labelledby="terms-label"
              onClick={() =>
                setValue("agreedToTerms", !watchedAgreed, {
                  shouldValidate: true,
                })
              }
              className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center
                          justify-center transition-all duration-200
                          ${
                            watchedAgreed
                              ? "bg-gemini-blue border-gemini-blue"
                              : "bg-transparent border-glass-border hover:border-slate-500"
                          }`}
            >
              {watchedAgreed && (
                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="2,6 5,9 10,3" />
                </svg>
              )}
            </button>

            <span
              id="terms-label"
              className="text-xs text-slate-400 leading-relaxed"
            >
              I agree to the{" "}
              <a href="/terms" className="text-gemini-cyan hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-gemini-cyan hover:underline">
                Privacy Policy
              </a>
              .
            </span>
          </div>

          {errors.agreedToTerms && (
            <p className="-mt-3 text-xs text-red-400">
              {errors.agreedToTerms.message}
            </p>
          )}

          {/* Submit */}
          <SubmitButton
            loading={isSubmitting}
            label="Create Account"
            loadingLabel="Creating account…"
          />
        </form>

        {/* ── Footer link ──────────────────────────────────────────────── */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{" "}
          {/*
            Replace this <a> with your router's <Link to="/login"> or
            Next.js <Link href="/login"> as needed.
          */}
          <a
            href="/login"
            className="text-gemini-cyan hover:underline font-medium transition-colors"
          >
            Sign in
          </a>
        </p>
      </AuthCard>
    </div>
  );
}

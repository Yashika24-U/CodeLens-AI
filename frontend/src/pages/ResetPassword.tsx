import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

import {
  type RegisterFormValues,
  inputBase,
  labelBase,
  BrandRow,
  BackgroundGlow,
  AuthCard,
  EyeIcon,
  SubmitButton,
  getPasswordStrength,
} from "../components/auth/auth.shared";

type ResetPasswordFormValues = Pick<
  RegisterFormValues,
  "password" | "confirmPassword"
>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 1. Grab token cleanly at the top level of your component hook cycle
  const token = searchParams.get("token");

  // ── React Hook Form Setup ──────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    mode: "onTouched",
    defaultValues: { password: "", confirmPassword: "" },
  });

  // Track password live to calculate visual strength meter profiles
  const watchedPassword = watch("password", "");

  // ── Local UI Toggle States ─────────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Calculate dynamic strength properties on the fly
  const strength = getPasswordStrength(watchedPassword);

  // ── Unified Submit Logic (Executed by handleSubmit) ────────────────────────
  const handleUpdatePassword = async (data: ResetPasswordFormValues) => {
    // Check for token availability right away
    if (!token) {
      toast.error(
        "Reset token is missing or has expired. Please request a new link.",
      );
      return;
    }

    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

      // Match backend payload naming conventions safely

      await axios.put(`${backendUrl}/api/auth/reset-password`, {
        token,
        newPassword: data.password,
      });

      toast.success("Password updated successfully!");
      navigate("/login");
    } catch (error) {
      let errorMessage = "Failed to update password. Link might be invalid.";

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  const fieldClass = (hasError: boolean) =>
    `${inputBase} ${hasError ? "border-red-500/60 focus:border-red-500 focus:ring-red-500" : ""}`;

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-4 relative">
      <BackgroundGlow />

      <AuthCard>
        {/* ── Brand Wordmark ────────────────────────────────────────────────── */}
        <BrandRow />

        {/* ── Title Context Block ───────────────────────────────────────────── */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-200 mb-1">
            Reset your password
          </h1>
          <p className="#f1f5f9 text-sm">
            Please engineer a secure, strong password to lock your profile.
          </p>
        </div>

        {/* ── Form Matrix ───────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit(handleUpdatePassword)}
          noValidate
          className="space-y-5"
        >
          {/* New Password Input Field */}
          <div>
            <label htmlFor="password" className={`${labelBase} mb-1.5`}>
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`${fieldClass(!!errors.password)} pr-11`}
                {...register("password", {
                  required: "Password string is required.",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters.",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 #f1f5f9 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            {/* Live Strength Progression Bar Meter */}
            {watchedPassword && (
              <div className="mt-2.5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="#f1f5f9">Password strength:</span>
                  <span className={`${strength.textColor} font-semibold`}>
                    {strength.label}
                  </span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.barColor} transition-all duration-300`}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm New Password Input Field */}
          <div>
            <label htmlFor="confirmPassword" className={`${labelBase} mb-1.5`}>
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`${fieldClass(!!errors.confirmPassword)} pr-11`}
                {...register("confirmPassword", {
                  required: "Please confirm your password entry.",
                  validate: (value) =>
                    value === watchedPassword || "The passwords do not match.",
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 #f1f5f9 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <EyeIcon open={showConfirmPassword} />
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Action Block */}
          <SubmitButton
            loading={isSubmitting}
            label="Update Password"
            loadingLabel="Updating entry pipeline…"
          />
        </form>
      </AuthCard>
    </div>
  );
}

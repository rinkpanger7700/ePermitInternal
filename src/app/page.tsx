"use client";

import { createClient } from "@/lib/supabase";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  ClipboardList,
  CheckCircle,
  BarChart2,
  Network,
  ChevronDown,
  Headset,
} from "lucide-react";

const OFFICES = [
  "NCR",
  "CAR",
  "NIR",
  "RO1",
  "RO2",
  "RO3",
  "RO4A",
  "RO4B",
  "RO5",
  "RO6",
  "RO7",
  "RO8",
  "RO9",
  "RO10",
  "RO11",
  "RO12",
  "RO13",
];

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [office, setOffice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // Read role from user metadata, fallback to email prefix check
      let role = data.user?.user_metadata?.role;
      
      if (!role) {
        role = "regional"; // default
        const lowerEmail = email.toLowerCase();
        if (lowerEmail.includes("admin")) role = "admin";
        else if (lowerEmail.includes("executive")) role = "executive";
        else if (lowerEmail.includes("bureau")) role = "bureau";
      }

      // Store in localStorage so the dashboard can render correctly
      localStorage.setItem("userRole", role);

      // Redirect straight to the main unified dashboard
      router.push(`/dashboard`);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: "#f8faff" }}>
      {/* Top navy header bar */}
      <div
        className="flex items-center gap-3 px-6 py-2.5"
        style={{ background: "#1e3a8a" }}
      >
        <Lock size={16} className="text-white" />
        <span className="text-white font-semibold text-sm tracking-wide uppercase">
          Employee Login
        </span>
      </div>

      {/* Branding bar */}
      <div
        className="flex items-center gap-4 px-8 py-3 bg-white"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 flex items-center justify-center overflow-hidden"
          >
            <Image
              src="/dhsud.png"
              alt="DHSUD Seal"
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-bold text-lg leading-tight" style={{ color: "#000000" }}>
              DHSUD
            </div>
            <div className="text-xs text-gray-500">
              eServices Portal
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px mx-2 bg-gray-300" />

        <div className="font-semibold text-xl" style={{ color: "#1e3a8a" }}>
          ePermits – Internal Portal
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-5xl flex gap-12 items-stretch">
          {/* ── Left panel ── */}
          <div className="flex-1 flex flex-col gap-6 justify-center pl-8">
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ color: "#000000" }}>
                Welcome, DHSUD Personnel
              </h1>
              <p className="text-sm text-gray-600">
                Sign in to access the ePermits Internal Portal.
              </p>
            </div>

            {/* Feature list card */}
            <div
              className="rounded-xl p-6 border w-11/12 shadow-sm"
              style={{ background: "#f0f4ff", borderColor: "#e5e7eb" }}
            >
              <p className="text-sm font-medium mb-4" style={{ color: "#1e40af" }}>
                What you can do inside ePermits
              </p>
              <div className="flex flex-col gap-4">
                {[
                  { icon: ClipboardList, label: "Review applications" },
                  { icon: CheckCircle, label: "Validate requirements" },
                  { icon: BarChart2, label: "Prepare reports" },
                  { icon: Network, label: "Track routing and approvals" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <Icon size={20} style={{ color: "#3b82f6" }} strokeWidth={1.5} />
                    <span className="text-sm font-medium text-gray-700">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Building illustration */}
            <div className="flex items-end mt-auto -ml-4">
              <Image
                src="/backgroundImageInternal.png"
                alt="DHSUD Building"
                width={660}
                height={220}
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* ── Right panel — login form ── */}
          <div className="flex items-center justify-center">
            <div
              className="w-full max-w-sm rounded-2xl border shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col gap-6"
              style={{ background: "#fff", borderColor: "#f3f4f6" }}
            >
              <div>
                <h2 className="text-xl font-bold" style={{ color: "#000000" }}>
                  Employee Sign In
                </h2>
                <p className="text-xs mt-1 text-gray-500">
                  Use your official DHSUD account credentials.
                </p>
              </div>

              {error && (
                <div
                  className="text-sm px-4 py-3 rounded-lg border"
                  style={{
                    background: "#fff0f0",
                    borderColor: "#fca5a5",
                    color: "#b91c1c",
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                {/* Email field */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-semibold text-gray-700"
                    htmlFor="email"
                  >
                    Employee ID / DHSUD Email
                  </label>
                  <div
                    className="flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-all focus-within:ring-2 focus-within:ring-blue-100"
                    style={{ borderColor: "#e5e7eb" }}
                  >
                    <User size={16} className="text-gray-400" />
                    <input
                      id="email"
                      type="text"
                      placeholder="Enter your Employee ID or DHSUD email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 text-gray-800"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-semibold text-gray-700"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <div
                    className="flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-all focus-within:ring-2 focus-within:ring-blue-100"
                    style={{ borderColor: "#e5e7eb" }}
                  >
                    <Lock size={16} className="text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 text-gray-800"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember me + Forgot password */}
                <div className="flex items-center justify-between mt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                      style={{ accentColor: "#2563eb" }}
                    />
                    <span className="text-xs text-gray-600">
                      Remember me
                    </span>
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium hover:underline transition-colors"
                    style={{ color: "#2563eb" }}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-medium text-sm text-white transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                  style={{ background: "#2563eb" }}
                  id="login-btn"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Signing in…
                    </span>
                  ) : (
                    "Login"
                  )}
                </button>

                {/* SSO button */}
                <button
                  type="button"
                  className="w-full py-2.5 rounded-lg font-medium text-sm border flex items-center justify-center gap-2 transition-all hover:bg-blue-50 active:scale-[0.98]"
                  style={{ borderColor: "#2563eb", color: "#2563eb", background: "white" }}
                  id="sso-btn"
                >
                  <ShieldCheck size={16} strokeWidth={2} />
                  Login via DHSUD SSO
                </button>

                {/* Notice */}
                <div className="flex items-center gap-2 pt-2">
                  <Lock size={12} className="text-gray-400" />
                  <span className="text-[11px] text-gray-400 whitespace-nowrap">
                    For authorized DHSUD personnel only.
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Office / Unit selector */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <label
                    className="text-xs font-semibold text-gray-700"
                    htmlFor="office"
                  >
                    Office / Unit{" "}
                    <span className="font-normal text-gray-400">(Optional)</span>
                  </label>
                  <div
                    className="flex items-center gap-2 rounded-lg border px-3 py-2.5"
                    style={{ borderColor: "#e5e7eb" }}
                  >
                    <Building2 size={16} className="text-gray-400" />
                    <select
                      id="office"
                      value={office}
                      onChange={(e) => setOffice(e.target.value)}
                      className="flex-1 bg-transparent text-sm outline-none text-gray-700"
                    >
                      <option value="" disabled>
                        Central Office / Regional Office
                      </option>
                      {OFFICES.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="text-gray-400" />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-5 text-center mt-auto flex justify-center items-center gap-2">
        <Headset size={16} style={{ color: "#475569" }} />
        <p className="text-xs" style={{ color: "#475569" }}>
          Need help? Contact{" "}
          <a
            href="mailto:kmiss@dhsud.gov.ph"
            className="font-medium hover:underline"
            style={{ color: "#2563eb" }}
          >
            KMISS
          </a>{" "}
          /{" "}
          <a
            href="mailto:admin@dhsud.gov.ph"
            className="font-medium hover:underline"
            style={{ color: "#2563eb" }}
          >
            System Administrator
          </a>
          .
        </p>
      </div>
    </div>
  );
}

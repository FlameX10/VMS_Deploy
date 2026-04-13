import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

// Import images from public folder
const WORK_TIME_IMG = "/images/WhatsApp Image 2026-03-15 at 6.11.43 PM.jpeg";
const SAFE_IMG = "/images/WhatsApp Image 2026-03-15 at 6.11.42 PM.jpeg";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: "", otp: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleRequest = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await api.post("/request-password-reset", { email: form.email });
      setMessage(response.data.message);
      setStep(2);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to send OTP");
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await api.post("/verify-otp", { email: form.email, otp: form.otp });
      setMessage(response.data.message);
      setStep(3);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "OTP verification failed");
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      const response = await api.post("/reset-password", { email: form.email, newPassword: form.newPassword });
      setMessage(response.data.message);
      setStep(4);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Password reset failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-stretch md:items-center justify-center bg-[#f5f3ef] p-3">
      <div className="w-full max-w-4xl flex flex-col md:flex-row min-h-0 md:min-h-[min(90vh,720px)] rounded-2xl overflow-hidden shadow-xl bg-white md:bg-transparent">
        {/* Form Section */}
        <div className="flex-shrink-0 md:flex-[1.2] flex items-center justify-center p-4 sm:p-6 md:pr-3 bg-[#f5f3ef] md:bg-transparent">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6 sm:p-8 md:p-10">
            <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">
              Reset Password
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Visitor Management System
            </p>

            {step === 1 && (
              <form onSubmit={handleRequest} className="mt-6 space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-stone-600 mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={update}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-300 transition"
                    required
                  />
                </div>

                {error && <div className="rounded-lg bg-red-50 border border-red-200/80 px-4 py-3 text-sm text-red-700">{error}</div>}
                {message && <div className="rounded-lg bg-green-50 border border-green-200/80 px-4 py-3 text-sm text-green-700">{message}</div>}

                <button type="submit" className="w-full py-3 px-4 rounded-lg font-medium text-white bg-stone-800 border border-stone-600 hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={!form.email}>
                  Send OTP
                </button>
                <Link to="/login" className="block text-center text-sm text-stone-500 hover:text-stone-700">
                  Back to login
                </Link>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerify} className="mt-6 space-y-5">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-stone-600 mb-1.5">
                    Enter OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    name="otp"
                    value={form.otp}
                    onChange={update}
                    placeholder="Enter code from email"
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-300 transition"
                    required
                  />
                </div>

                {error && <div className="rounded-lg bg-red-50 border border-red-200/80 px-4 py-3 text-sm text-red-700">{error}</div>}
                {message && <div className="rounded-lg bg-green-50 border border-green-200/80 px-4 py-3 text-sm text-green-700">{message}</div>}

                <button type="submit" className="w-full py-3 px-4 rounded-lg font-medium text-white bg-stone-800 border border-stone-600 hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={!form.otp}>
                  Verify OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setForm({ ...form, otp: "" });
                    setMessage("");
                  }}
                  className="block w-full text-center text-sm text-stone-500 hover:text-stone-700"
                >
                  Use a different email
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleReset} className="mt-6 space-y-5">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-stone-600 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={form.newPassword}
                      onChange={update}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 pr-11 rounded-lg border border-stone-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-300 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878a4.5 4.5 0 106.262 6.262M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-600 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={update}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 pr-11 rounded-lg border border-stone-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-300 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878a4.5 4.5 0 106.262 6.262M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && <div className="rounded-lg bg-red-50 border border-red-200/80 px-4 py-3 text-sm text-red-700">{error}</div>}
                {message && <div className="rounded-lg bg-green-50 border border-green-200/80 px-4 py-3 text-sm text-green-700">{message}</div>}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-lg font-medium text-white bg-stone-800 border border-stone-600 hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={!form.newPassword || !form.confirmPassword || form.newPassword !== form.confirmPassword}
                >
                  Reset Password
                </button>
              </form>
            )}

            {step === 4 && (
              <div className="mt-6 space-y-5">
                <div className="rounded-lg bg-green-50 border border-green-200/80 px-4 py-3 text-sm text-green-700">
                  Password updated successfully. You can log in now.
                </div>
                <Link to="/login" className="block w-full py-3 px-4 rounded-lg font-medium text-white bg-stone-800 border border-stone-600 hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 transition text-center">
                  Back to login
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Image Section */}
        <div className="flex-1 min-h-[220px] sm:min-h-[280px] md:min-h-0 relative p-4 sm:p-6 md:p-8 bg-[#e2eaf2] overflow-hidden flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-4 sm:gap-0">
          <img
            src={SAFE_IMG}
            alt="Safe icon"
            className="absolute top-32 left-4 sm:left-6 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain drop-shadow-sm"
          />
          <img
            src={WORK_TIME_IMG}
            alt="Work time illustration"
            className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-72 lg:h-72 xl:w-80 xl:h-80 object-contain drop-shadow-md"
          />
        </div>
      </div>
    </div>
  );
}

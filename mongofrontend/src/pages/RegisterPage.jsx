import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// Import images from public folder
const WORK_TIME_IMG = "/images/WhatsApp Image 2026-03-15 at 6.11.43 PM.jpeg";
const SAFE_IMG = "/images/WhatsApp Image 2026-03-15 at 6.11.42 PM.jpeg";

const initialForm = {
  name: "",
  email: "",
  employee_id: "",
  department: "",
  phone: "",
  password: "",
};

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await register(form);
      setMessage(response.message || "Registration submitted successfully.");
      setForm(initialForm);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-stretch md:items-center justify-center bg-[#f5f3ef] p-3">
      <div className="w-full max-w-4xl flex flex-col md:flex-row min-h-0 md:min-h-[min(90vh,720px)] rounded-2xl overflow-hidden shadow-xl bg-white md:bg-transparent">
        {/* Form Section */}
        <div className="flex-shrink-0 md:flex-[1.2] flex items-center justify-center p-4 sm:p-6 md:pr-3 bg-[#f5f3ef] md:bg-transparent">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6 sm:p-8 md:p-10">
            <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">
              Create Account
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Employee Onboarding for VMS
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              <p className="text-xs text-stone-500">
                Your account will remain pending until the Process Admin approves and assigns a role.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-stone-600 mb-1.5">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-300 transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-stone-600 mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-300 transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="employee_id" className="block text-sm font-medium text-stone-600 mb-1.5">
                    Employee ID
                  </label>
                  <input
                    id="employee_id"
                    type="text"
                    name="employee_id"
                    value={form.employee_id}
                    onChange={onChange}
                    placeholder="Your employee ID"
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-300 transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-stone-600 mb-1.5">
                    Department
                  </label>
                  <input
                    id="department"
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={onChange}
                    placeholder="Your department"
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-300 transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-stone-600 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="Your phone number"
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-300 transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-stone-600 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={onChange}
                      placeholder="Create a password"
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
              </div>

              {message && <div className="rounded-lg bg-green-50 border border-green-200/80 px-4 py-3 text-sm text-green-700">{message}</div>}
              {error && <div className="rounded-lg bg-red-50 border border-red-200/80 px-4 py-3 text-sm text-red-700">{error}</div>}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg font-medium text-white bg-stone-800 border border-stone-600 hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading || !form.name || !form.email || !form.employee_id || !form.department || !form.phone || !form.password}
              >
                {loading ? "Submitting..." : "Create Account"}
              </button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-stone-500 hover:text-stone-700">
                  Back to login
                </Link>
              </div>
            </form>
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

import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// Import images from public folder
const WORK_TIME_IMG = "/images/WhatsApp Image 2026-03-15 at 6.11.43 PM.jpeg";
const SAFE_IMG = "/images/WhatsApp Image 2026-03-15 at 6.11.42 PM.jpeg";

const routeByRole = {
  process_admin: "/dashboard",
  sm: "/dashboard",
  sg: "/dashboard",
  he: "/dashboard",
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = useMemo(() => location.state?.from?.pathname || "/dashboard", [location.state]);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(routeByRole[user.role] || from, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6", padding: "20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%", maxWidth: "1100px", borderRadius: "16px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.12)", background: "white" }}>
        
        {/* Form Section - Left */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 60px", backgroundColor: "#ffffff" }}>
          <div style={{ width: "100%", maxWidth: "360px" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#1f2937", marginBottom: "8px", letterSpacing: "-0.5px" }}>
              Welcome to VMS
            </h1>
            <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "48px", lineHeight: "1.5" }}>
              Sign in with your email to continue.
            </p>

            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <label htmlFor="email" style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="you@company.com"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", fontFamily: "inherit", boxSizing: "border-box", backgroundColor: "#f9fafb", transition: "all 0.2s" }}
                  required
                  autoComplete="email"
                  onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>

              <div>
                <label htmlFor="password" style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, password: event.target.value }));
                      setError("");
                    }}
                    placeholder="Enter your password"
                    style={{ width: "100%", padding: "12px 14px", paddingRight: "44px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", fontFamily: "inherit", boxSizing: "border-box", backgroundColor: "#f9fafb", transition: "all 0.2s" }}
                    required
                    autoComplete="current-password"
                    onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "4px" }}
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

              {error && <div style={{ borderRadius: "8px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "12px 14px", fontSize: "13px", color: "#991b1b", lineHeight: "1.4" }}>{error}</div>}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Link to="/register" style={{ padding: "12px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", color: "#374151", backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", textDecoration: "none", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.target.style.backgroundColor = "#e5e7eb"; }} onMouseLeave={(e) => { e.target.style.backgroundColor = "#f3f4f6"; }}>
                  Create account
                </Link>
                <button type="submit" style={{ padding: "12px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", color: "white", backgroundColor: "#4b5563", border: "none", cursor: loading || !form.email || !form.password ? "not-allowed" : "pointer", opacity: loading || !form.email || !form.password ? 0.6 : 1, transition: "all 0.2s" }} disabled={loading || !form.email || !form.password} onMouseEnter={(e) => { if (!loading && form.email && form.password) e.target.style.backgroundColor = "#374151"; }} onMouseLeave={(e) => { e.target.style.backgroundColor = "#4b5563"; }}>
                  {loading ? "Signing in..." : "Login"}
                </button>
              </div>

              {error && (
                <div style={{ textAlign: "center" }}>
                  <Link to="/forgot-password" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none", fontWeight: "500", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => { e.target.style.color = "#1d4ed8"; }} onMouseLeave={(e) => { e.target.style.color = "#2563eb"; }}>
                    Forgot password?
                  </Link>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Image Section - Right */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#dff2ff", padding: "80px 60px", position: "relative", overflow: "hidden" }}>
          {/* Decorative background elements */}
          <div style={{ position: "absolute", top: "40px", right: "50px", width: "100px", height: "100px", backgroundColor: "rgba(255,255,255,0.3)", borderRadius: "50%", zIndex: 0 }}></div>
          
          {/* Images Container */}
          <div style={{ display: "flex", flexDirection: "column", gap: "30px", alignItems: "center", justifyContent: "center", zIndex: 2, position: "relative" }}>
            {/* Top Illustration */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
              <img
                src={SAFE_IMG}
                alt="Security illustration"
                style={{ width: "140px", height: "140px", objectFit: "contain" }}
              />
            </div>

            {/* Bottom Illustration */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", borderRadius: "12px", padding: "30px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
              <img
                src={WORK_TIME_IMG}
                alt="Work illustration"
                style={{ width: "160px", height: "160px", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import api from "../api/client";

const navByRole = {
  process_admin: [
    { to: "/dashboard/pa/employee-approvals", label: "👤 Employee Approvals" },
    { to: "/dashboard/pa/visitor-approvals", label: "✓ Visitor Approvals" },
    { to: "/dashboard/pa/meeting-approvals", label: "📅 Meeting Approvals" },
    { to: "/dashboard/pa/visitor-registry", label: "📋 Visitor Registry" },
  ],
  sm: [
    { to: "/dashboard/sm/verification", label: "🔍 Verification" },
    { to: "/dashboard/sm/movement", label: "📍 Movement" },
    { to: "/dashboard/sm/visitor-log", label: "📝 Visitor Log" },
  ],
  sg: [
    { to: "/dashboard/sg/gate-desk", label: "🚪 Gate Desk" },
    { to: "/dashboard/sg/validation", label: "✅ Validation" },
    { to: "/dashboard/sg/reports", label: "📊 Reports" },
  ],
  he: [
    { to: "/dashboard/he/invitations", label: "📧 Invitations" },
    { to: "/dashboard/he/meetings", label: "🤝 Meetings" },
    { to: "/dashboard/he/history", label: "📜 History" },
  ],
};

export default function DashboardShell({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const navItems = navByRole[user?.role] || [];
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        if (active) {
          setNotifications(response.data.data || []);
        }
      } catch {
        if (active) {
          setNotifications([]);
        }
      }
    };

    loadNotifications();
    const timer = setInterval(loadNotifications, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const markRead = async (notificationId) => {
    await api.patch(`/notifications/${notificationId}/read`);
    setNotifications((current) => current.map((notification) => (
      notification.notification_id === notificationId
        ? { ...notification, read: true }
        : notification
    )));
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      {/* ==================== SIDEBAR ==================== */}
      <aside style={{
        width: "280px",
        backgroundColor: "#1f2937",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #374151" }}>
          <p style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#9ca3af", margin: 0 }}>Vishay VMS</p>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff", margin: "8px 0 0 0" }}>Visitor Ops</h2>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "24px 0", overflowY: "auto" }}>
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end
              style={({ isActive }) => ({
                display: "block",
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: 500,
                color: isActive ? "#3b82f6" : "#d1d5db",
                backgroundColor: isActive ? "rgba(59, 130, 246, 0.1)" : "transparent",
                borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
                textDecoration: "none",
                transition: "all 0.2s ease"
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Notifications Section */}
        <div style={{ borderTop: "1px solid #374151", padding: "0" }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: "100%",
              padding: "16px 20px",
              backgroundColor: "transparent",
              border: "none",
              color: "#d1d5db",
              textAlign: "left",
              fontSize: "13px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#374151"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
          >
            🔔 Notifications {notifications.length > 0 && <span style={{ backgroundColor: "#ef4444", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700 }}>{notifications.length}</span>}
          </button>
          
          {showNotifications && (
            <div style={{ maxHeight: "300px", overflowY: "auto", backgroundColor: "#111827", borderTop: "1px solid #374151" }}>
              {notifications.length === 0 ? (
                <p style={{ padding: "16px 20px", fontSize: "13px", color: "#9ca3af", margin: 0 }}>No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.notification_id}
                    style={{
                      padding: "12px 20px",
                      borderBottom: "1px solid #374151",
                      fontSize: "12px",
                      cursor: "pointer",
                      opacity: notification.read ? 0.6 : 1,
                      transition: "all 0.2s ease"
                    }}
                    onClick={() => markRead(notification.notification_id)}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#374151"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  >
                    <p style={{ margin: 0, color: "#f3f4f6", fontWeight: 500 }}>{notification.title}</p>
                    <p style={{ margin: "4px 0 0 0", color: "#9ca3af", fontSize: "11px" }}>{notification.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: "20px", borderTop: "1px solid #374151" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#9ca3af", margin: 0 }}>Signed in as</p>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff", margin: "8px 0 0 0" }}>{user?.name || user?.email}</p>
          <span style={{ display: "inline-block", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, backgroundColor: "#3b82f6", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "8px" }}>
            {user?.role}
          </span>
          <button
            onClick={logout}
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "10px 12px",
              backgroundColor: "#374151",
              border: "1px solid #4b5563",
              borderRadius: "6px",
              color: "#d1d5db",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#4b5563";
              e.target.style.color = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#374151";
              e.target.style.color = "#d1d5db";
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT ==================== */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          padding: "32px 40px",
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
        }}>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>Dashboard</p>
          <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#1f2937", margin: "8px 0 0 0" }}>{title}</h1>
          <p style={{ fontSize: "15px", color: "#6b7280", margin: "8px 0 0 0" }}>{subtitle}</p>
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: "auto", padding: "32px 40px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}

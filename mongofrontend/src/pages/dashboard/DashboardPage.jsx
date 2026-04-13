import { useAuth } from "../../auth/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import HostEmployeeDashboard from "./HostEmployeeDashboard";
import ProcessAdminDashboard from "./ProcessAdminDashboard";
import SecurityGuardDashboard from "./SecurityGuardDashboard";
import SecurityManagerDashboard from "./SecurityManagerDashboard";

const roleDefaults = {
  process_admin: "/dashboard/pa/employee-approvals",
  sm: "/dashboard/sm/verification",
  sg: "/dashboard/sg/gate-desk",
  he: "/dashboard/he/invitations",
};

const roleSegments = {
  process_admin: "pa",
  sm: "sm",
  sg: "sg",
  he: "he",
};

const allowedSections = {
  process_admin: ["employee-approvals", "visitor-approvals", "visitor-registry", "meeting-approvals"],
  sm: ["verification", "movement", "visitor-log"],
  sg: ["gate-desk", "validation", "reports"],
  he: ["invitations", "meetings", "history"],
};

export default function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const defaultPath = roleDefaults[user?.role] || roleDefaults.he;
  const segments = location.pathname.split("/").filter(Boolean);
  const currentRoleSegment = segments[1] || "";
  const section = segments[2] || "";

  if (location.pathname === "/dashboard" || location.pathname === "/dashboard/") {
    return <Navigate to={defaultPath} replace />;
  }

  if (currentRoleSegment !== roleSegments[user?.role]) {
    return <Navigate to={defaultPath} replace />;
  }

  if (!allowedSections[user?.role]?.includes(section)) {
    return <Navigate to={defaultPath} replace />;
  }

  if (user?.role === "process_admin") {
    return <ProcessAdminDashboard section={section} />;
  }

  if (user?.role === "sm") {
    return <SecurityManagerDashboard section={section} />;
  }

  if (user?.role === "sg") {
    return <SecurityGuardDashboard section={section} />;
  }

  return <HostEmployeeDashboard section={section} />;
}

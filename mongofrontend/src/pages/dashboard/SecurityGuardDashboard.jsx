import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import api from "../../api/client";
import DashboardShell from "../../components/DashboardShell";

export default function SecurityGuardDashboard({ section }) {
  const [visitors, setVisitors] = useState([]);
  const [unvalidated, setUnvalidated] = useState([]);
  const [logs, setLogs] = useState([]);
  const [report, setReport] = useState([]);
  const [message, setMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const load = async () => {
    try {
      const [visitorsRes, unvalidatedRes, logsRes, reportRes] = await Promise.all([
        api.get("/visitors"),
        api.get("/sg/unvalidated-visitors"),
        api.get("/sg/visitor-logs"),
        api.get("/sg/visitor-report"),
      ]);
      const visitorsData = visitorsRes.data.data || [];
      const approvedCount = visitorsData.filter(v => v.visitor_approve === "approved").length;
      console.log(`📊 SG Loaded: ${visitorsData.length} total visitors, ${approvedCount} approved, ${(unvalidatedRes.data.data || []).length} unvalidated`);
      
      setVisitors(visitorsData);
      setUnvalidated(unvalidatedRes.data.data || []);
      setLogs(logsRes.data.data || []);
      setReport(reportRes.data.data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("❌ Error loading SG data:", error);
    }
  };

  useEffect(() => {
    load().catch(() => setMessage("Unable to load gate desk data"));
    
    // Auto-refresh every 15 seconds to pick up PA approvals
    const interval = setInterval(() => {
      load().catch(() => {});
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  const approvedVisitors = useMemo(() => {
    return visitors.filter((v) => v.visitor_approve === "approved");
  }, [visitors]);

  const todayVisitors = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return visitors.filter((visitor) => String(visitor.visit_date || "").slice(0, 10) === today);
  }, [visitors]);

  const upcomingVisitors = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return visitors.filter((visitor) => String(visitor.visit_date || "").slice(0, 10) > today);
  }, [visitors]);

  const action = async (url, body) => {
    try {
      const response = await api.post(url, body);
      setMessage(response.data.message || "Action completed successfully");
      load();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Action failed";
      setMessage(`Error: ${errorMsg}`);
    }
  };

  const lifecycleAction = async (meetingId, actionName) => {
    if (!meetingId) return;
    try {
      await api.patch(`/he/meetings/${meetingId}/lifecycle`, { action: actionName });
      setMessage("Lifecycle action completed");
      load();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Action failed";
      setMessage(`Error: ${errorMsg}`);
    }
  };

  return (
    <DashboardShell title="Security Guard" subtitle="Validate identity, manage entry and exit, and keep gate records current.">
      {message ? <p style={{ padding: "12px 16px", backgroundColor: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "8px", color: "#15803d", marginBottom: "20px", fontWeight: "500" }}>{message}</p> : null}

      {unvalidated.length > 0 && section === "gate-desk" && (
        <div style={{
          padding: "16px 20px",
          backgroundColor: "#fef08a",
          border: "2px solid #eab308",
          borderRadius: "8px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 4px 12px rgba(212, 166, 0, 0.1)"
        }}>
          <div>
            <p style={{ margin: "0", fontWeight: "600", color: "#854d0e", fontSize: "15px" }}>⚠️ {unvalidated.length} visitor(s) awaiting validation</p>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#92400e" }}>Please complete ID verification before allowing check-in. Last updated: {lastUpdated.toLocaleTimeString()}</p>
          </div>
          <div style={{ display: "flex", gap: "12px", marginLeft: "16px" }}>
            <button 
              onClick={() => load()}
              style={{
                padding: "8px 14px",
                backgroundColor: "#ffffff",
                color: "#92400e",
                border: "1px solid #eab308",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap"
              }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = "#fef3c7"; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = "#ffffff"; }}
              title="Refresh to see PA approvals"
            >
              🔄 Refresh
            </button>
            <NavLink to="/dashboard/sg/validation" style={{
              padding: "8px 16px",
              backgroundColor: "#2563eb",
              color: "white",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "600",
              transition: "all 0.2s",
              whiteSpace: "nowrap"
            }} onMouseEnter={(e) => e.target.style.backgroundColor = "#1d4ed8"} onMouseLeave={(e) => e.target.style.backgroundColor = "#2563eb"}>
              Go to Validation →
            </NavLink>
          </div>
        </div>
      )}

      {section === "gate-desk" ? (
        <section className="dashboard-grid two-columns">
          <div className="card section-card">
            <div className="section-heading"><h3>Today's Visitors</h3><p className="muted">Expected arrivals for today.</p></div>
            <div className="table-list compact-list">
              {todayVisitors.map((visitor) => (
                <div key={visitor.visitor_id} className="table-row"><strong>{visitor.name}</strong><span>{visitor.visit_date ? new Date(visitor.visit_date).toLocaleDateString() : "No date"}</span></div>
              ))}
              {todayVisitors.length === 0 ? <p className="muted">No visitors scheduled today.</p> : null}
            </div>
          </div>

          <div className="card section-card">
            <div className="section-heading"><h3>Upcoming Visitors</h3><p className="muted">Approved visitors expected later.</p></div>
            <div className="table-list compact-list">
              {upcomingVisitors.map((visitor) => (
                <div key={visitor.visitor_id} className="table-row"><strong>{visitor.name}</strong><span>{visitor.visit_date ? new Date(visitor.visit_date).toLocaleDateString() : "No date"}</span></div>
              ))}
              {upcomingVisitors.length === 0 ? <p className="muted">No upcoming visitors.</p> : null}
            </div>
          </div>

          <div className="card section-card lg:col-span-2">
            <div className="section-heading"><h3>Check-In / Check-Out Status</h3><p className="muted">Track visitor entry and exit. Validate ID in the section below first!</p></div>
            
            {approvedVisitors.some(v => !v.validation_status || v.validation_status !== "validated") && (
              <div style={{
                padding: "12px",
                backgroundColor: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "4px",
                marginBottom: "15px",
                color: "#856404"
              }}>
                <strong>⚠️ Note:</strong> Some visitors are not yet validated. Go to <strong>"Identity Validation"</strong> section below and click "✓ Validate ID" for each visitor first.
              </div>
            )}
            
            <div className="stack-gap">
              {approvedVisitors.length === 0 ? (
                <p className="muted">No approved visitors. Visitors must be approved by PA first.</p>
              ) : (
                approvedVisitors.map((visitor) => {
                  const isValidated = visitor.validation_status === "validated";
                  const isCheckedIn = visitor.check_in_status === "checked_in";
                  const isCheckedOut = visitor.check_in_status === "checked_out";
                  
                  return (
                    <div key={visitor.visitor_id} className="nested-card">
                      <div className="list-row">
                        <strong>{visitor.name}</strong>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            backgroundColor: isValidated ? "#d0ffd0" : "#fff0d0",
                            color: isValidated ? "#0a0" : "#c80",
                            fontSize: "0.8em"
                          }}>
                            {isValidated ? "✓ ID Validated" : "⚠ Not Validated"}
                          </span>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            backgroundColor: isCheckedOut ? "#d0d0d0" : isCheckedIn ? "#d0ffd0" : "#ffd0d0",
                            color: isCheckedOut ? "#666" : isCheckedIn ? "#0a0" : "#c00",
                            fontSize: "0.8em"
                          }}>
                            {isCheckedOut ? "✓ Checked Out" : isCheckedIn ? "✓ Checked In" : "⚠ Awaiting Check-In"}
                          </span>
                        </div>
                      </div>
                      <div className="button-row">
                        <button 
                          className="small-button" 
                          onClick={() => action("/sg/visitor/check-in", { visitor_id: visitor.visitor_id })}
                          disabled={!isValidated || isCheckedIn || isCheckedOut}
                          title={!isValidated ? "⚠️ Visitor must be validated in the 'Identity Validation' section first" : isCheckedIn ? "Already checked in" : "Check visitor in"}
                          style={{
                            opacity: !isValidated ? 0.5 : 1,
                            cursor: !isValidated ? "not-allowed" : "pointer",
                          }}
                        >
                          📍 Check In {!isValidated && "- Validate First"}
                        </button>
                        <button 
                          className="small-button danger-button" 
                          onClick={() => action("/sg/visitor/check-out", { visitor_id: visitor.visitor_id })}
                          disabled={!isCheckedIn}
                          title={!isCheckedIn ? "Visitor must be checked in first" : "Check visitor out"}
                          style={{
                            opacity: !isCheckedIn ? 0.5 : 1,
                            cursor: !isCheckedIn ? "not-allowed" : "pointer",
                          }}
                        >
                          🚪 Check Out
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      ) : null}

      {section === "validation" ? (
        <section style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", padding: "40px", marginBottom: "24px" }}>
            <div style={{ marginBottom: "32px" }}>
              <p style={{ fontSize: "12px", fontWeight: "600", color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px 0" }}>✅ Identity Validation</p>
              <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#1f2937", margin: "0 0 12px 0" }}>Visitor Validation & Check-In</h1>
              <p style={{ fontSize: "15px", color: "#6b7280", margin: "0", lineHeight: "1.6" }}>Verify identity documents, validate visitors, and enable check-in for gate entry. Complete validation before check-in is allowed.</p>
            </div>

            {unvalidated.length > 0 && (
              <div style={{
                padding: "16px",
                backgroundColor: "#dbeafe",
                border: "1px solid #bfdbfe",
                borderRadius: "8px",
                marginBottom: "24px",
                color: "#1d4ed8"
              }}>
                <strong>📋 {unvalidated.length} visitor(s) awaiting validation</strong>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {unvalidated.length === 0 ? (
                <div style={{
                  padding: "40px",
                  textAlign: "center",
                  backgroundColor: "#f9fafb",
                  border: "2px dashed #e5e7eb",
                  borderRadius: "8px"
                }}>
                  <p style={{ fontSize: "16px", color: "#6b7280", margin: "0" }}>✓ All visitors have been validated!</p>
                  <p style={{ fontSize: "13px", color: "#9ca3af", margin: "8px 0 0 0" }}>No pending validations at this time.</p>
                </div>
              ) : (
                unvalidated.map((visitor) => (
                  <div key={visitor._id || visitor.visitor_id} style={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "20px",
                    transition: "all 0.2s"
                  }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"} onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      <div>
                        <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", margin: "0 0 4px 0" }}>{visitor.name}</h3>
                        <p style={{ fontSize: "13px", color: "#6b7280", margin: "0" }}>📧 {visitor.email || "No email"}</p>
                      </div>
                      <span style={{
                        padding: "6px 12px",
                        backgroundColor: "#fef3c7",
                        color: "#92400e",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>⚠️ Pending Validation</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #e5e7eb" }}>
                      <div>
                        <p style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px 0" }}>ID Type</p>
                        <p style={{ fontSize: "14px", color: "#1f2937", margin: "0" }}>{visitor.id_proof_type || "Not specified"}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px 0" }}>ID Number</p>
                        <p style={{ fontSize: "14px", color: "#1f2937", margin: "0" }}>{visitor.id_proof_number || "Not provided"}</p>
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      padding: "12px",
                      marginBottom: "16px",
                      fontSize: "12px",
                      color: "#6b7280"
                    }}>
                      <strong style={{ color: "#1f2937" }}>Step 1:</strong> Validate ID Proof → <strong style={{ color: "#1f2937" }}>Step 2:</strong> Check Visitor In
                    </div>

                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <button 
                        onClick={() => {
                          action(`/sg/visitor/validate/${visitor._id || visitor.visitor_id}`, {});
                        }}
                        style={{
                          flex: "1",
                          minWidth: "150px",
                          padding: "12px 16px",
                          backgroundColor: "#2563eb",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#1d4ed8"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#2563eb"}
                      >
                        ✓ Validate ID
                      </button>
                      <button 
                        onClick={() => {
                          action("/sg/visitor/check-in", { visitor_id: visitor._id || visitor.visitor_id });
                        }}
                        style={{
                          flex: "1",
                          minWidth: "150px",
                          padding: "12px 16px",
                          backgroundColor: "#22c55e",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#16a34a"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#22c55e"}
                      >
                        📍 Check In
                      </button>
                      <button 
                        onClick={() => action(`/sg/visitor/reject/${visitor._id || visitor.visitor_id}`, {})}
                        style={{
                          flex: "1",
                          minWidth: "150px",
                          padding: "12px 16px",
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#dc2626"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#ef4444"}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      ) : null}

      {section === "reports" ? (
        <section className="card section-card">
          <div className="section-heading"><h3>Detailed Visitor Report</h3><p className="muted">Generated operational report for print/export workflows.</p></div>
          <div className="table-list">
            {report.map((entry) => (
              <div key={entry.visitor_id} className="table-row tall-row">
                <div>
                  <strong>{entry.name}</strong>
                  <p>{entry.organization_name || "No organization"}</p>
                  <p>{entry.host_name || "No host"} | {entry.meeting_status || "No meeting"}</p>
                </div>
                <div className="table-meta">
                  <span className="status-badge">{entry.check_in_status || "pending"}</span>
                  <span className="muted">Gadgets: {entry.gadgets.length}</span>
                    <div className="button-column">
                      <button className="small-button" onClick={() => lifecycleAction(entry.meeting_id, "left_meeting_area")} disabled={!entry.meeting_id}>Start Exit Timer</button>
                      <button className="small-button" onClick={() => lifecycleAction(entry.meeting_id, "extend_exit_timer")} disabled={!entry.meeting_id}>Extend Timer</button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </DashboardShell>
  );
}

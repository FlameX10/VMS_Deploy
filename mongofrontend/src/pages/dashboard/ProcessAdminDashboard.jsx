import { useEffect, useState } from "react";
import api from "../../api/client";
import DashboardShell from "../../components/DashboardShell";

const emptyApproval = { full_name: "", role: "he", employee_id: "", department: "", phone: "" };

export default function ProcessAdminDashboard({ section }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [pendingVisitors, setPendingVisitors] = useState([]);
  const [pendingMeetings, setPendingMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [forms, setForms] = useState({});
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const [pendingRes, approvedRes, visitorsRes, pendingVisitorsRes, meetingsRes] = await Promise.all([
        api.get("/pa/pending/emp/requests").catch(err => {
          console.error("Error fetching pending users:", err);
          return { data: { pendingUsers: [] } };
        }),
        api.get("/pa/approved/emp/requests").catch(err => {
          console.error("Error fetching approved users:", err);
          return { data: { approvedUsers: [] } };
        }),
        api.get("/visitors").catch(err => {
          console.error("Error fetching visitors:", err);
          return { data: { data: [] } };
        }),
        api.get("/visitors/pending").catch(err => {
          console.error("Error fetching pending visitors:", err);
          return { data: { data: [] } };
        }),
        api.get("/process-admin/pending-meetings").catch(err => {
          console.error("Error fetching pending meetings:", err);
          return { data: { data: [] } };
        }),
      ]);

      const pending = pendingRes.data.pendingUsers || [];
      setPendingUsers(pending);
      setApprovedUsers(approvedRes.data.approvedUsers || []);
      setVisitors(visitorsRes.data.data || []);
      setPendingVisitors(pendingVisitorsRes.data.data || []);
      setPendingMeetings(meetingsRes.data.data || []);
      setForms(
        Object.fromEntries(
          pending.map((user) => [user._id, {
            ...emptyApproval,
            full_name: user.full_name || "",
            employee_id: user.employee_id || "",
            department: user.department || "",
            phone: user.phone || "",
          }])
        )
      );
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setMessage("Unable to load admin dashboard");
    }
  };

  useEffect(() => {
    load().catch(() => setMessage("Unable to load admin dashboard"));
  }, []);

  const updateForm = (userId, field, value) => {
    setForms((current) => ({
      ...current,
      [userId]: {
        ...(current[userId] || emptyApproval),
        [field]: value,
      },
    }));
  };

  const approveUser = async (userId) => {
    await api.patch(`/pa/approve-user/${userId}`, forms[userId]);
    setMessage("User approved successfully");
    load();
  };

  const rejectUser = async (userId) => {
    await api.delete(`/pa/reject-user/${userId}`);
    setMessage("User rejected");
    load();
  };

  const decideVisitor = async (visitorId, action) => {
    console.log(`🔗 PA: API Call - PUT /visitors/${visitorId}/${action}`);
    const result = await api.put(`/visitors/${visitorId}/${action}`);
    console.log(`📤 PA: API Response:`, result.data);
    setMessage(`Visitor ${action}d`);
    await load();
  };

  const approveMeeting = async (meetingId) => {
    try {
      const response = await api.post(`/process-admin/meetings/${meetingId}/approve`);
      console.log("✓ Meeting approved:", response.data);
      setMessage("Meeting approved successfully");
      setSelectedMeeting(null);
      await load();
    } catch (error) {
      const errMsg = error?.response?.data?.message || error?.message || "Failed to approve meeting";
      setMessage(`Error: ${errMsg}`);
      console.error("❌ Error approving meeting:", error?.response?.data || error);
    }
  };

  const rejectMeeting = async (meetingId) => {
    try {
      if (!rejectReason.trim()) {
        setMessage("Please provide a rejection reason");
        return;
      }
      const response = await api.post(`/process-admin/meetings/${meetingId}/reject`, {
        reason: rejectReason,
      });
      console.log("✓ Meeting rejected:", response.data);
      setMessage("Meeting rejected successfully");
      setSelectedMeeting(null);
      setRejectReason("");
      await load();
    } catch (error) {
      const errMsg = error?.response?.data?.message || error?.message || "Failed to reject meeting";
      setMessage(`Error: ${errMsg}`);
      console.error("❌ Error rejecting meeting:", error?.response?.data || error);
    }
  };

  const viewVisitorDetails = async (visitorId) => {
    try {
      const response = await api.get(`/visitors/${visitorId}`);
      setSelectedVisitor(response.data.data || response.data);
    } catch (error) {
      setMessage("Failed to load visitor details");
      console.error("Error fetching visitor details:", error);
    }
  };

  const handleVisitorDecision = async (visitorId, action) => {
    try {
      console.log(`👤 PA: Calling ${action} on visitor ${visitorId}`);
      await decideVisitor(visitorId, action);
      console.log(`✅ PA: Visitor ${action} successful`);
      setSelectedVisitor(null);
    } catch (error) {
      console.error("❌ Error in handleVisitorDecision:", error);
    }
  };

  return (
    <DashboardShell title="Process Admin" subtitle="Approve employees, assign roles and keep global visitor operations under control.">
      {message ? <p className="success-text card flash-card">{message}</p> : null}

      {section === "employee-approvals" ? (
        <section className="dashboard-grid two-columns">
          <div className="card section-card">
            <div className="section-heading"><h3>Pending User Requests</h3><p className="muted">Approve and assign operational roles.</p></div>
            <div className="stack-gap">
              {pendingUsers.map((user) => (
                <div key={user._id} className="nested-card stack-gap">
                  <div className="list-row"><strong>{user.full_name || "New User"}</strong><span>{user.email}</span></div>
                  <div className="grid-two compact-grid">
                    <input placeholder="Full name" value={forms[user._id]?.full_name || ""} onChange={(event) => updateForm(user._id, "full_name", event.target.value)} />
                    <select value={forms[user._id]?.role || "he"} onChange={(event) => updateForm(user._id, "role", event.target.value)}>
                      <option value="he">Host Employee</option>
                      <option value="sm">Security Manager</option>
                      <option value="sg">Security Guard</option>
                    </select>
                    <input placeholder="Employee ID" value={forms[user._id]?.employee_id || ""} onChange={(event) => updateForm(user._id, "employee_id", event.target.value)} />
                    <input placeholder="Department" value={forms[user._id]?.department || ""} onChange={(event) => updateForm(user._id, "department", event.target.value)} />
                    <input placeholder="Phone" value={forms[user._id]?.phone || ""} onChange={(event) => updateForm(user._id, "phone", event.target.value)} />
                  </div>
                  <div className="button-row">
                    <button className="primary-button" onClick={() => approveUser(user._id)}>Approve</button>
                    <button className="ghost-button danger-button" onClick={() => rejectUser(user._id)}>Reject</button>
                  </div>
                </div>
              ))}
              {pendingUsers.length === 0 ? <p className="muted">No pending employee requests.</p> : null}
            </div>
          </div>

          <div className="card section-card">
            <div className="section-heading"><h3>Approved Users</h3><p className="muted">Current role assignment snapshot.</p></div>
            <div className="table-list">
              {approvedUsers.map((user) => (
                <div key={user._id} className="table-row">
                  <div><strong>{user.full_name}</strong><p>{user.email}</p></div>
                  <span className="role-pill">{user.role}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {section === "visitor-approvals" ? (
        <section className="card section-card">
          <div className="section-heading"><h3>Pending Visitor Requests</h3><p className="muted">Secondary approval layer before gate processing.</p></div>
          
          {!selectedVisitor ? (
            <div className="stack-gap">
              {pendingVisitors.map((visitor) => (
                <div 
                  key={visitor.visitor_id} 
                  className="nested-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => viewVisitorDetails(visitor.visitor_id)}
                >
                  <div className="list-row"><strong>{visitor.name}</strong><span>{visitor.email}</span></div>
                  <p className="muted">{visitor.visitor_type || "visitor"} | {visitor.company_name || "No organization"}</p>
                  <p className="muted" style={{ fontSize: "0.85em" }}>Click to view full details</p>
                </div>
              ))}
              {pendingVisitors.length === 0 ? <p className="muted">No pending visitors.</p> : null}
            </div>
          ) : (
            <div className="nested-card">
              <div style={{ marginBottom: "15px" }}>
                <button className="small-button" onClick={() => setSelectedVisitor(null)}>← Back to List</button>
              </div>
              
              <div style={{ borderBottom: "1px solid #e0e0e0", paddingBottom: "15px", marginBottom: "15px" }}>
                <h3>{selectedVisitor.name}</h3>
                <p className="muted">{selectedVisitor.email}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                <div>
                  <p className="muted" style={{ fontSize: "0.85em" }}>Visitor Type</p>
                  <p><strong>{selectedVisitor.visitor_type || "N/A"}</strong></p>
                </div>
                <div>
                  <p className="muted" style={{ fontSize: "0.85em" }}>Phone</p>
                  <p><strong>{selectedVisitor.phone || "N/A"}</strong></p>
                </div>
                <div>
                  <p className="muted" style={{ fontSize: "0.85em" }}>Organization</p>
                  <p><strong>{selectedVisitor.company_name || selectedVisitor.organization_name || "N/A"}</strong></p>
                </div>
                <div>
                  <p className="muted" style={{ fontSize: "0.85em" }}>Department</p>
                  <p><strong>{selectedVisitor.department || "N/A"}</strong></p>
                </div>
                <div>
                  <p className="muted" style={{ fontSize: "0.85em" }}>Designation</p>
                  <p><strong>{selectedVisitor.designation || "N/A"}</strong></p>
                </div>
                <div>
                  <p className="muted" style={{ fontSize: "0.85em" }}>ID Proof Type</p>
                  <p><strong>{selectedVisitor.id_proof_type || "N/A"}</strong></p>
                </div>
                <div>
                  <p className="muted" style={{ fontSize: "0.85em" }}>ID Proof Number</p>
                  <p><strong>{selectedVisitor.id_proof_number || "N/A"}</strong></p>
                </div>
                <div>
                  <p className="muted" style={{ fontSize: "0.85em" }}>Purpose of Meeting</p>
                  <p><strong>{selectedVisitor.purpose_of_meeting || "N/A"}</strong></p>
                </div>
              </div>

              {selectedVisitor.id_proof_image && (
                <div style={{ marginBottom: "20px" }}>
                  <p className="muted" style={{ fontSize: "0.85em" }}>ID Proof Image</p>
                  <img 
                    src={selectedVisitor.id_proof_image} 
                    alt="ID Proof" 
                    style={{ maxWidth: "200px", border: "1px solid #ddd", borderRadius: "4px" }}
                  />
                </div>
              )}

              <div className="button-row">
                <button 
                  className="primary-button" 
                  onClick={() => handleVisitorDecision(selectedVisitor.visitor_id, "approve")}
                >
                  Approve Visitor
                </button>
                <button 
                  className="ghost-button danger-button" 
                  onClick={() => handleVisitorDecision(selectedVisitor.visitor_id, "reject")}
                >
                  Reject Visitor
                </button>
              </div>
            </div>
          )}
        </section>
      ) : null}

      {section === "visitor-registry" ? (
        <section className="card section-card">
          <div className="section-heading"><h3>All Visitors</h3><p className="muted">Global visitor registry and status.</p></div>
          <div className="table-list">
            {visitors.map((visitor) => (
              <div key={visitor.visitor_id} className="table-row">
                <div><strong>{visitor.name}</strong><p>{visitor.organization_name || "No organization"}</p></div>
                <span className="status-badge">{visitor.visitor_approve || "pending"}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {section === "meeting-approvals" ? (
        <section className="dashboard-grid">
          <div className="card section-card">
            <div className="section-heading"><h3>Pending Meeting Requests</h3><p className="muted">Review and approve/reject visitor meetings created by host employees.</p></div>
            <div className="stack-gap">
              {pendingMeetings.map((meeting) => (
                <div 
                  key={meeting.meeting_id} 
                  className="nested-card stack-gap"
                  onClick={() => setSelectedMeeting(meeting)}
                  style={{ cursor: "pointer", padding: "15px", border: "1px solid #e0e0e0", borderRadius: "8px" }}
                >
                  <div className="list-row">
                    <strong>{meeting.visitor_name || "Unknown Visitor"}</strong>
                    <span style={{ fontSize: "0.9em", color: "#666" }}>{meeting.visitor_email}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.9em", color: "#666" }}>
                    <div><strong>Host:</strong> {meeting.host_name}</div>
                    <div><strong>Date:</strong> {new Date(meeting.scheduled_date).toLocaleDateString()}</div>
                    <div><strong>Time:</strong> {meeting.scheduled_time || "N/A"}</div>
                    <div><strong>Type:</strong> {meeting.visitor_type || "visitor"}</div>
                    <div><strong>Company:</strong> {meeting.company_name || "N/A"}</div>
                    <div><strong>Purpose:</strong> {meeting.purpose}</div>
                  </div>
                  <p style={{ margin: "5px 0", color: "#888", fontSize: "0.85em" }}>Click to review and approve/reject</p>
                </div>
              ))}
              {pendingMeetings.length === 0 ? <p className="muted">No pending meeting requests.</p> : null}
            </div>
          </div>

          {selectedMeeting ? (
            <div className="card section-card">
              <div className="section-heading"><h3>Review Meeting Details</h3><p className="muted">Make approval decision</p></div>
              <div className="stack-gap">
                <div className="review-block" style={{ padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
                  <div style={{ marginBottom: "15px" }}>
                    <h4 style={{ margin: "0 0 10px 0" }}>Visitor Information</h4>
                    <div style={{ display: "grid", gap: "8px", fontSize: "0.95em" }}>
                      <div><strong>Name:</strong> {selectedMeeting.visitor_name}</div>
                      <div><strong>Email:</strong> {selectedMeeting.visitor_email}</div>
                      <div><strong>Phone:</strong> {selectedMeeting.visitor_phone || "N/A"}</div>
                      <div><strong>Type:</strong> {selectedMeeting.visitor_type || "visitor"}</div>
                      <div><strong>Company:</strong> {selectedMeeting.company_name || "N/A"}</div>
                      <div><strong>ID Proof:</strong> {selectedMeeting.id_proof_type} - {selectedMeeting.id_proof_number || "N/A"}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <h4 style={{ margin: "0 0 10px 0" }}>Host Employee Information</h4>
                    <div style={{ display: "grid", gap: "8px", fontSize: "0.95em" }}>
                      <div><strong>Name:</strong> {selectedMeeting.host_name}</div>
                      <div><strong>Email:</strong> {selectedMeeting.host_email}</div>
                      <div><strong>Phone:</strong> {selectedMeeting.host_phone || "N/A"}</div>
                      <div><strong>Role:</strong> {selectedMeeting.host_role}</div>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ margin: "0 0 10px 0" }}>Meeting Details</h4>
                    <div style={{ display: "grid", gap: "8px", fontSize: "0.95em" }}>
                      <div><strong>Scheduled Date:</strong> {new Date(selectedMeeting.scheduled_date).toLocaleDateString()}</div>
                      <div><strong>Scheduled Time:</strong> {selectedMeeting.scheduled_time || "To be confirmed"}</div>
                      <div><strong>Purpose:</strong> {selectedMeeting.purpose}</div>
                      <div><strong>Status:</strong> <span className="status-badge">{selectedMeeting.status}</span></div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9em" }}>Rejection Reason (if rejecting):</label>
                    <textarea 
                      placeholder="Enter reason for rejection..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minHeight: "80px", fontFamily: "Arial" }}
                    ></textarea>
                  </div>
                  <div className="button-row">
                    <button 
                      className="primary-button" 
                      onClick={() => approveMeeting(selectedMeeting.meeting_id)}
                    >
                      ✓ Approve Meeting
                    </button>
                    <button 
                      className="ghost-button danger-button" 
                      onClick={() => rejectMeeting(selectedMeeting.meeting_id)}
                    >
                      ✗ Reject Meeting
                    </button>
                    <button 
                      className="ghost-button" 
                      onClick={() => {
                        setSelectedMeeting(null);
                        setRejectReason("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </DashboardShell>
  );
}

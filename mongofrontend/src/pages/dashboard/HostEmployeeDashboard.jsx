import { useEffect, useState } from "react";
import api from "../../api/client";
import DashboardShell from "../../components/DashboardShell";

const invitationInitial = {
  visitor_email: "",
  scheduled_date: "",
  scheduled_time: "",
  purpose: "",
};

export default function HostEmployeeDashboard({ section }) {
  const [form, setForm] = useState(invitationInitial);
  const [meetings, setMeetings] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [message, setMessage] = useState("");

  const load = async () => {
    const [meetingsRes, visitorsRes] = await Promise.all([
      api.get("/he/meetings-status"),
      api.get("/visitors"),
    ]);
    setMeetings(meetingsRes.data.meetings || []);
    setVisitors(visitorsRes.data.data || []);
  };

  useEffect(() => {
    load().catch(() => setMessage("Unable to load host dashboard"));
  }, []);

  useEffect(() => {
    load().catch(() => setMessage("Unable to refresh data"));
  }, [section]);

  const createInvitation = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/he/create-meeting", form);
      setMessage(response.data.message || "Meeting invitation created");
      setForm(invitationInitial);
      load();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to create invitation";
      setMessage(`Error: ${errorMsg}`);
    }
  };

  const meetingAction = async (meetingId, action) => {
    try {
      await api.patch(`/he/meetings/${meetingId}/lifecycle`, { action });
      setMessage(`Meeting action applied: ${action}`);
      load();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to apply action";
      setMessage(`Error: ${errorMsg}`);
    }
  };

  return (
    <DashboardShell title="Host Employee" subtitle="Invite visitors, track meetings and manage post-meeting exit escalation.">
      {message ? <p className="success-text card flash-card">{message}</p> : null}

      {section === "invitations" ? (
        <section className="card section-card">
          <form className="stack-gap" onSubmit={createInvitation}>
            <div className="section-heading"><h3>Create Visitor Invitation</h3><p className="muted">Invite a visitor and trigger the registration form email.</p></div>
            <label className="field"><span>Visitor Email</span><input type="email" value={form.visitor_email} onChange={(event) => setForm((current) => ({ ...current, visitor_email: event.target.value }))} required /></label>
            <label className="field"><span>Date</span><input type="date" value={form.scheduled_date} onChange={(event) => setForm((current) => ({ ...current, scheduled_date: event.target.value }))} required /></label>
            <label className="field"><span>Time</span><input type="time" value={form.scheduled_time} onChange={(event) => setForm((current) => ({ ...current, scheduled_time: event.target.value }))} /></label>
            <label className="field"><span>Purpose</span><textarea value={form.purpose} onChange={(event) => setForm((current) => ({ ...current, purpose: event.target.value }))} required /></label>
            <button className="primary-button" type="submit">Send Invitation</button>
          </form>
        </section>
      ) : null}

      {section === "meetings" ? (
        <section className="card section-card">
          <div className="section-heading"><h3>Meeting Status</h3><p className="muted">Start meeting, complete it, and trigger exit monitoring.</p></div>
          <div className="table-list">
            {meetings.map((meeting) => {
              const visitor = visitors.find(v => v.visitor_id === meeting.visitor_id);
              const isCheckedIn = visitor?.check_in_status === "checked_in";
              
              const renderButtons = () => {
                const buttons = [];
                
                // Lock all actions if visitor not checked in
                if (!isCheckedIn) {
                  buttons.push(
                    <div key="locked" style={{ padding: "10px", backgroundColor: "#ffe0e0", borderRadius: "4px", color: "#c00" }}>
                      <strong>⚠️ Awaiting gate check-in</strong>
                      <p style={{ fontSize: "0.85em", margin: "5px 0 0 0" }}>Security Guard must check-in visitor first</p>
                    </div>
                  );
                  return buttons;
                }
                
                // Only show Start Meeting if not started
                if (!meeting.status || meeting.status === "scheduled") {
                  buttons.push(
                    <button key="start" className="small-button" onClick={() => meetingAction(meeting.meeting_id, "start")}>Start Meeting</button>
                  );
                }
                
                // Show Meeting Completed if started
                if (meeting.status === "in_progress") {
                  buttons.push(
                    <button key="complete" className="small-button" onClick={() => meetingAction(meeting.meeting_id, "complete")}>Meeting Completed</button>
                  );
                }
                
                // Show Visitor Left Area if completed
                if (meeting.status === "completed") {
                  buttons.push(
                    <button key="left" className="small-button" onClick={() => meetingAction(meeting.meeting_id, "left_meeting_area")}>Visitor Left Area</button>
                  );
                }
                
                // Show Extend Exit Timer if visitor left
                if (meeting.status === "left_meeting_area") {
                  buttons.push(
                    <button key="extend" className="small-button" onClick={() => meetingAction(meeting.meeting_id, "extend_exit_timer")}>Extend Exit Timer</button>
                  );
                  buttons.push(
                    <button key="close" className="small-button danger-button" onClick={() => meetingAction(meeting.meeting_id, "close_visit")}>Close Visit</button>
                  );
                }
                
                return buttons;
              };
              
              return (
                <div key={meeting.meeting_id} className="table-row tall-row">
                  <div>
                    <strong>{meeting.visitor_name || meeting.visitor_email}</strong>
                    <p>{meeting.purpose || "No purpose"}</p>
                    <p>{meeting.scheduled_date ? new Date(meeting.scheduled_date).toLocaleDateString() : "No date"} {meeting.scheduled_time || ""}</p>
                    <p style={{ fontSize: "0.85em", color: isCheckedIn ? "#0a0" : "#c00" }}>
                      {isCheckedIn ? "✓ Checked In" : "⚠ Not Checked In"}
                    </p>
                  </div>
                  <div className="button-column">
                    <span className="status-badge">{meeting.status}</span>
                    {renderButtons()}
                  </div>
                </div>
              );
            })}
            {meetings.length === 0 ? <p className="muted">No meetings created yet.</p> : null}
          </div>
        </section>
      ) : null}

      {section === "history" ? (
        <section className="card section-card">
          <div className="section-heading">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <div><h3>My Visitor History</h3><p className="muted">Visitors assigned to your meetings.</p></div>
              <button className="small-button" onClick={() => load()} style={{ marginTop: 0 }}>Refresh</button>
            </div>
          </div>
          <div className="table-list">
            {visitors.map((visitor) => (
              <div key={visitor.visitor_id} className="table-row">
                <div><strong>{visitor.name}</strong><p>{visitor.organization_name || "No organization"}</p></div>
                <span className="status-badge">{visitor.check_in_status || visitor.visitor_approve || "pending"}</span>
              </div>
            ))}
            {visitors.length === 0 ? <p className="muted">No visitor history yet.</p> : null}
          </div>
        </section>
      ) : null}
    </DashboardShell>
  );
}

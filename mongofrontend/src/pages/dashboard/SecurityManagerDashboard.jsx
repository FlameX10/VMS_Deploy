import { useEffect, useState } from "react";
import api from "../../api/client";
import DashboardShell from "../../components/DashboardShell";

export default function SecurityManagerDashboard({ section }) {
  const [pendingVisitors, setPendingVisitors] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [report, setReport] = useState([]);
  const [message, setMessage] = useState("");

  const load = async () => {
    const [pendingRes, visitorsRes, meetingsRes, reportRes] = await Promise.all([
      api.get("/visitors/pending"),
      api.get("/visitors"),
      api.get("/meetings/details"),
      api.get("/sg/visitor-report"),
    ]);
    setPendingVisitors(pendingRes.data.data || []);
    setVisitors(visitorsRes.data.data || []);
    setMeetings(meetingsRes.data.data || []);
    setReport(reportRes.data.data || []);
  };

  useEffect(() => {
    load().catch(() => setMessage("Unable to load security manager dashboard"));
  }, []);

  const decideVisitor = async (visitorId, action) => {
    await api.put(`/visitors/${visitorId}/${action}`);
    setMessage(`Visitor ${action}d`);
    load();
  };

  const updateMeetingStatus = async (meetingId, status) => {
    await api.put(`/meetings/${meetingId}/status`, { status });
    setMessage(`Meeting marked ${status}`);
    load();
  };

  return (
    <DashboardShell title="Security Manager" subtitle="Review visitor requests, track meeting movement and respond to exit issues.">
      {message ? <p className="success-text card flash-card">{message}</p> : null}

      {section === "verification" ? (
        <section className="card section-card">
          <div className="section-heading"><h3>Visitor Verification Queue</h3><p className="muted">Accept or reject submitted visitor forms.</p></div>
          <div className="stack-gap">
            {pendingVisitors.map((visitor) => (
              <div key={visitor.visitor_id} className="nested-card">
                <div className="list-row"><strong>{visitor.name}</strong><span>{visitor.email}</span></div>
                <p className="muted">{visitor.company_name || "No organization"} | {visitor.phone || "No phone"}</p>
                <div className="button-row">
                  <button className="primary-button" onClick={() => decideVisitor(visitor.visitor_id, "approve")}>Accept</button>
                  <button className="ghost-button danger-button" onClick={() => decideVisitor(visitor.visitor_id, "reject")}>Reject</button>
                </div>
              </div>
            ))}
            {pendingVisitors.length === 0 ? <p className="muted">No pending visitor requests.</p> : null}
          </div>
        </section>
      ) : null}

      {section === "movement" ? (
        <>
          <section className="card section-card">
            <div className="section-heading"><h3>Movement Alerts</h3><p className="muted">Watch meeting progression and timer events.</p></div>
            <div className="table-list">
              {meetings.map((meeting) => (
                <div key={meeting.meeting_id} className="table-row tall-row">
                  <div>
                    <strong>{meeting.visitor?.name || "Visitor"}</strong>
                    <p>{meeting.host?.full_name || "Unknown host"} | {meeting.status}</p>
                    <p>{meeting.scheduled_date ? new Date(meeting.scheduled_date).toLocaleString() : "No date"}</p>
                  </div>
                  <div className="button-column">
                    <button className="small-button" onClick={() => updateMeetingStatus(meeting.meeting_id, "scheduled")}>Schedule</button>
                    <button className="small-button danger-button" onClick={() => updateMeetingStatus(meeting.meeting_id, "rejected")}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card section-card">
            <div className="section-heading"><h3>Exit Timer Alerts</h3><p className="muted">Visitors who left meeting area but have not completed exit.</p></div>
            <div className="table-list">
              {report
                .filter((entry) => entry.exit_timer_expires_at && entry.check_in_status !== "checked_out")
                .map((entry) => (
                  <div key={entry.visitor_id} className="table-row">
                    <div>
                      <strong>{entry.name}</strong>
                      <p>{entry.host_name || "No host linked"}</p>
                    </div>
                    <span className="status-badge">{new Date(entry.exit_timer_expires_at).toLocaleTimeString()}</span>
                  </div>
                ))}
              {report.filter((entry) => entry.exit_timer_expires_at && entry.check_in_status !== "checked_out").length === 0 ? <p className="muted">No active exit alerts.</p> : null}
            </div>
          </section>
        </>
      ) : null}

      {section === "visitor-log" ? (
        <section className="card section-card">
          <div className="section-heading"><h3>All Visitors</h3><p className="muted">Historical visitor access for monitoring and investigations.</p></div>
          <div className="table-list">
            {visitors.map((visitor) => (
              <div key={visitor.visitor_id} className="table-row">
                <div>
                  <strong>{visitor.name}</strong>
                  <p>{visitor.organization_name || "No organization"}</p>
                </div>
                <div className="table-meta">
                  <span className="status-badge">{visitor.validation_status || visitor.visitor_approve || "pending"}</span>
                  <span className="muted">{visitor.check_in_status || "not checked in"}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </DashboardShell>
  );
}

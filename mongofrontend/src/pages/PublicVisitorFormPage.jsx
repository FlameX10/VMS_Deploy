import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client";

const designationOptions = ["Employee", "Student", "Customer", "Student Trainee", "Service Provider", "Material Supplier", "Manpower Supplier", "Other"];
const idTypeOptions = ["Aadhaar Card", "PAN Card", "Passport", "Driving License", "Other"];
const gadgetOptions = ["Laptop", "Phone", "Tablet", "Charger", "Mouse", "Power Bank", "Keyboard", "Other"];

const makeColleague = () => ({
  name: "",
  employee_id: "",
  mobile_number: "",
  email: "",
  identity_proof_type: "",
  identity_proof_type_other: "",
  identity_proof_file: "",
});

const initialForm = {
  name: "",
  email: "",
  designation: "",
  designationOther: "",
  mobile: "",
  department: "",
  companyName: "",
  purposeOfVisit: "",
  visitDate: "",
  visitorType: "official",
  visitorCategory: "Meeting",
  otherCategory: "",
  idProofType: "",
  idProofTypeOther: "",
  idProofNumber: "",
  idProofImage: "",
  gadgets: [],
  gadgetOther: "",
  gadgetDetails: {},
  colleaguesAccompanying: false,
  colleagues: [],
};

const normalizeGadgetDetails = (gadgetDetails) =>
  Object.entries(gadgetDetails).flatMap(([gadgetType, config]) => {
    const quantity = Number(config.quantity || 0);
    if (!quantity) return [];

    if (["Laptop", "Phone", "Tablet"].includes(gadgetType)) {
      return Array.from({ length: quantity }, (_, index) => ({
        gadget_type: gadgetType,
        quantity: 1,
        model_number: config.models?.[index] || "",
        serial_number: config.models?.[index] || "",
      }));
    }

    return [
      {
        gadget_type: gadgetType,
        quantity,
      },
    ];
  });

export default function PublicVisitorFormPage() {
  const [searchParams] = useSearchParams();
  const invitedEmail = searchParams.get("email") || "";
  const invitedMeetingId = searchParams.get("meeting_id") || "";
  const [form, setForm] = useState({
    ...initialForm,
    email: invitedEmail,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedIdProofFileName, setSelectedIdProofFileName] = useState("");

  const selectedDetailedGadgets = useMemo(
    () => form.gadgets.filter((item) => ["Laptop", "Phone", "Tablet"].includes(item)),
    [form.gadgets]
  );

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const toggleGadget = (value) => {
    setForm((current) => ({
      ...current,
      gadgets: current.gadgets.includes(value)
        ? current.gadgets.filter((item) => item !== value)
        : [...current.gadgets, value],
    }));
  };

  const setGadgetQuantity = (gadgetType, quantity) => {
    setForm((current) => ({
      ...current,
      gadgetDetails: {
        ...current.gadgetDetails,
        [gadgetType]: {
          ...current.gadgetDetails[gadgetType],
          quantity,
          models: Array.from(
            { length: Number(quantity || 0) },
            (_, index) => current.gadgetDetails[gadgetType]?.models?.[index] || ""
          ),
        },
      },
    }));
  };

  const setGadgetModel = (gadgetType, index, value) => {
    setForm((current) => {
      const models = [...(current.gadgetDetails[gadgetType]?.models || [])];
      models[index] = value;
      return {
        ...current,
        gadgetDetails: {
          ...current.gadgetDetails,
          [gadgetType]: {
            ...current.gadgetDetails[gadgetType],
            quantity: current.gadgetDetails[gadgetType]?.quantity || models.length,
            models,
          },
        },
      };
    });
  };

  const updateColleague = (index, field, value) => {
    setForm((current) => ({
      ...current,
      colleagues: current.colleagues.map((colleague, colleagueIndex) =>
        colleagueIndex === index ? { ...colleague, [field]: value } : colleague
      ),
    }));
  };

  const setColleagueCount = (count) => {
    const normalized = Number(count || 0);
    setForm((current) => ({
      ...current,
      colleagues: Array.from({ length: normalized }, (_, index) => current.colleagues[index] || makeColleague()),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = {
        meeting_id: invitedMeetingId,
        name: form.name,
        email: form.email,
        designation: form.designation,
        designationOther: form.designationOther,
        mobile: form.mobile,
        phone: form.mobile,
        department: form.department,
        companyName: form.companyName,
        organizationName: form.companyName,
        purposeOfVisit: form.purposeOfVisit,
        visitDate: form.visitDate,
        visitorType: form.visitorType,
        visitorCategory: form.visitorCategory,
        otherCategory: form.otherCategory,
        idProofType: form.idProofType,
        idProofTypeOther: form.idProofTypeOther,
        idProofNumber: form.idProofNumber,
        idProofImage: form.idProofImage,
        gadgets: form.gadgets,
        gadgetOther: form.gadgetOther,
        gadget_details: normalizeGadgetDetails(form.gadgetDetails),
        colleaguesAccompanying: form.colleaguesAccompanying,
        colleagues: form.colleagues,
      };

      const response = await api.post("/visitor/register", payload);
      setMessage(response.data.message || "Visitor form submitted");
      setForm(initialForm);
      setSelectedIdProofFileName("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit visitor form");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "40px 20px" }}>
      <form style={{ maxWidth: "900px", margin: "0 auto", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", padding: "50px 40px" }} onSubmit={handleSubmit}>
        <div style={{ marginBottom: "40px" }}>
          <p style={{ fontSize: "12px", fontWeight: "600", color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px 0" }}>Visitor Registration</p>
          <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#1f2937", margin: "0 0 12px 0" }}>Gate-ready visitor details</h1>
          <p style={{ fontSize: "15px", color: "#6b7280", margin: "0", lineHeight: "1.6" }}>Fill the form from your invitation link sent by the host employee. Security and host teams will use this for entry verification.</p>
        </div>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937", marginBottom: "20px", paddingBottom: "12px", borderBottom: "2px solid #e5e7eb" }}>Visitor Details</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Name</span>
              <input name="name" value={form.name} onChange={updateField} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "#f9fafb", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} required />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email</span>
              <input type="email" name="email" value={form.email} onChange={updateField} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "#f9fafb", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} required />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Designation</span>
              <select name="designation" value={form.designation} onChange={updateField} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "#f9fafb", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} required>
                <option value="">Select</option>
                {designationOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Mobile Number</span>
              <input name="mobile" pattern="[0-9]{10}" value={form.mobile} onChange={updateField} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "#f9fafb", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} required />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Department</span>
              <input name="department" value={form.department} onChange={updateField} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "#f9fafb", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} required />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Organization Name</span>
              <input name="companyName" value={form.companyName} onChange={updateField} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "#f9fafb", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} required />
            </label>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Purpose of Meeting</span>
              <textarea name="purposeOfVisit" value={form.purposeOfVisit} onChange={updateField} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "#f9fafb", minHeight: "80px", transition: "all 0.2s", resize: "vertical" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} required />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Visit Date</span>
              <input type="date" name="visitDate" value={form.visitDate} onChange={updateField} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "#f9fafb", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} required />
            </label>
          </div>
          {form.designation === "Other" ? (
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "24px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Other Designation</span>
              <input name="designationOther" value={form.designationOther} onChange={updateField} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "#f9fafb", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} required />
            </label>
          ) : null}
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937", marginBottom: "20px", paddingBottom: "12px", borderBottom: "2px solid #e5e7eb" }}>ID Proof</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>ID Type</span>
              <select name="idProofType" value={form.idProofType} onChange={updateField} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "#f9fafb", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} required>
                <option value="">Select</option>
                {idTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>ID Number</span>
              <input name="idProofNumber" value={form.idProofNumber} onChange={updateField} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "#f9fafb", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} required />
            </label>
          </div>
          {form.idProofType === "Other" ? (
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "24px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Other ID Type</span>
              <input name="idProofTypeOther" value={form.idProofTypeOther} onChange={updateField} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "#f9fafb", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} required />
            </label>
          ) : null}
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "24px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Upload ID Proof (PDF/JPG/PNG)</span>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setSelectedIdProofFileName(file.name);
                setForm((current) => ({ ...current, idProofImage: "" }));
              }
            }} style={{ padding: "10px 12px", border: "2px dashed #d1d5db", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "#f9fafb", cursor: "pointer" }} />
          </label>
          {selectedIdProofFileName ? <p style={{ fontSize: "13px", color: "#6b7280", margin: "8px 0 0 0" }}>✓ File selected: {selectedIdProofFileName}</p> : null}
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937", marginBottom: "20px", paddingBottom: "12px", borderBottom: "2px solid #e5e7eb" }}>Gadgets Carried</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
            {gadgetOptions.map((option) => (
              <label key={option} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", borderRadius: "6px", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#dbeafe"; e.currentTarget.style.borderColor = "#bfdbfe"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f9fafb"; e.currentTarget.style.borderColor = "#e5e7eb"; }}>
                <input type="checkbox" checked={form.gadgets.includes(option)} onChange={() => toggleGadget(option)} style={{ cursor: "pointer" }} />
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>{option}</span>
              </label>
            ))}
          </div>
          {form.gadgets.includes("Other") ? (
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "24px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Other Gadget</span>
              <input name="gadgetOther" value={form.gadgetOther} onChange={updateField} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "#f9fafb", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} required />
            </label>
          ) : null}
          {form.gadgets.map((gadget) => (
            <div key={gadget} style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px", marginBottom: "16px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>{gadget} Quantity</span>
                <input type="number" min="0" value={form.gadgetDetails[gadget]?.quantity || ""} onChange={(event) => setGadgetQuantity(gadget, event.target.value)} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "white", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
              </label>
              {selectedDetailedGadgets.includes(gadget)
                ? Array.from({ length: Number(form.gadgetDetails[gadget]?.quantity || 0) }).map((_, index) => (
                    <label key={`${gadget}-${index}`} style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>{gadget} {index + 1} Model or Serial Number</span>
                      <input value={form.gadgetDetails[gadget]?.models?.[index] || ""} onChange={(event) => setGadgetModel(gadget, index, event.target.value)} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "white", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
                    </label>
                  ))
                : null}
            </div>
          ))}
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937", marginBottom: "20px", paddingBottom: "12px", borderBottom: "2px solid #e5e7eb" }}>Colleagues</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "24px" }}>
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>Colleagues accompanying?</span>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <input type="radio" checked={form.colleaguesAccompanying === true} onChange={() => setForm((current) => ({ ...current, colleaguesAccompanying: true, colleagues: current.colleagues.length ? current.colleagues : [makeColleague()] }))} />
              <span style={{ fontSize: "14px", color: "#374151" }}>Yes</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <input type="radio" checked={form.colleaguesAccompanying === false} onChange={() => setForm((current) => ({ ...current, colleaguesAccompanying: false, colleagues: [] }))} />
              <span style={{ fontSize: "14px", color: "#374151" }}>No</span>
            </label>
          </div>
          {form.colleaguesAccompanying ? (
            <>
              <label style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "24px", maxWidth: "300px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Number of colleagues</span>
                <input type="number" min="1" value={form.colleagues.length || ""} onChange={(event) => setColleagueCount(event.target.value)} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "#f9fafb", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
              </label>
              {form.colleagues.map((colleague, index) => (
                <div key={`colleague-${index}`} style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px", marginBottom: "16px" }}>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "#2563eb", marginBottom: "16px" }}>Colleague {index + 1}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "16px" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Name</span>
                      <input value={colleague.name} onChange={(event) => updateColleague(index, "name", event.target.value)} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "white", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} required />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>ID</span>
                      <input value={colleague.employee_id} onChange={(event) => updateColleague(index, "employee_id", event.target.value)} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "white", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} required />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Mobile</span>
                      <input value={colleague.mobile_number} onChange={(event) => updateColleague(index, "mobile_number", event.target.value)} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "white", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} required />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email</span>
                      <input type="email" value={colleague.email} onChange={(event) => updateColleague(index, "email", event.target.value)} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "white", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} required />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>ID Proof Type</span>
                      <select value={colleague.identity_proof_type} onChange={(event) => updateColleague(index, "identity_proof_type", event.target.value)} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "white", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} required>
                        <option value="">Select</option>
                        {idTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </label>
                    {colleague.identity_proof_type === "Other" ? (
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Other ID Type</span>
                        <input value={colleague.identity_proof_type_other} onChange={(event) => updateColleague(index, "identity_proof_type_other", event.target.value)} style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "white", transition: "all 0.2s" }} onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} required />
                      </label>
                    ) : null}
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Upload ID Proof</span>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          uploadFile(file, (url) => updateColleague(index, "identity_proof_file", url));
                        }
                      }} style={{ padding: "10px 12px", border: "2px dashed #d1d5db", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", backgroundColor: "white" }} />
                    </label>
                  </div>
                </div>
              ))}
            </>
          ) : null}
        </section>

        {message ? <p style={{ padding: "12px 16px", backgroundColor: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "6px", color: "#15803d", marginBottom: "24px" }}>{message}</p> : null}
        {error ? <p style={{ padding: "12px 16px", backgroundColor: "#fee2e2", border: "1px solid #fecaca", borderRadius: "6px", color: "#991b1b", marginBottom: "24px" }}>{error}</p> : null}

        <button type="submit" style={{ width: "100%", padding: "14px 24px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => (e.target.style.backgroundColor = "#1d4ed8")} onMouseLeave={(e) => (e.target.style.backgroundColor = "#2563eb")}>Submit Visitor Form</button>
      </form>
    </div>
  );
}

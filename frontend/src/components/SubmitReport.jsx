import React, { useState } from "react";
import axios from "axios";

const SubmitReport = () => {
  const [reportDate, setReportDate] = useState("");
  const [category, setCategory] = useState("HIPAA");
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewURL(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reportDate || !category || !file) {
      setMessage("All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("report_date", reportDate);
    formData.append("category", category);
    formData.append("document", file);

    try {
      const res = await axios.post("http://localhost:8000/api/reports/submit/", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("✅ " + res.data.message);
    } catch (err) {
      console.error(err);
      setMessage("❌ " + (err.response?.data?.error || "Upload failed."));
    }
  };

  return (
    <div>
      <h2>Submit Compliance Report</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Report Date:</label>
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="HIPAA">HIPAA</option>
            <option value="Security">Security</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label>Upload Document (PDF or DOCX):</label>
          <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
        </div>

        {previewURL && file?.type === "application/pdf" && (
          <embed src={previewURL} type="application/pdf" width="100%" height="400px" />
        )}

        {previewURL && file?.type !== "application/pdf" && (
          <p>Preview not available for this file type.</p>
        )}

        <button type="submit">Submit Report</button>
      </form>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
};

export default SubmitReport;

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import SubmitReport from "../components/SubmitReport"; // ✅ Import the upload form

export default function ComplianceReports() {
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/compliance/reports/")
      .then((response) => {
        if (!response.ok) throw new Error("API error");
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) {
          data = [
            {
              id: 1,
              title: "March HIPAA Audit",
              status: "Compliant",
              date: "2025-03-01",
              document: "/documents/march_audit.pdf",
              type: "Privacy Review",
              submittedBy: "Dr. Smith",
              reviewedBy: "Compliance Team",
              riskLevel: "Low",
              auditType: "Internal",
              tags: ["HIPAA", "Quarterly Audit"],
            },
            {
              id: 2,
              title: "Unauthorized Access Log",
              status: "Non-Compliant",
              date: "2025-03-15",
              document: null,
              type: "Security Incident",
              submittedBy: "IT Admin",
              reviewedBy: "Security Lead",
              riskLevel: "High",
              auditType: "External",
              tags: ["Access Violation"],
            },
            {
              id: 3,
              title: "Quarterly Data Export",
              status: "Compliant",
              date: "2025-03-25",
              document: "/documents/q1_export.pdf",
              type: "Data Handling",
              submittedBy: "Records Manager",
              reviewedBy: "Compliance Team",
              riskLevel: "Medium",
              auditType: "Internal",
              tags: ["PHI", "Export"],
            },
          ];
        }

        setReports(data);
        setLoadingReports(false);
      })
      .catch((error) => {
        console.error("Error fetching reports:", error);
        setReports([
          {
            id: 1,
            title: "March HIPAA Audit",
            status: "Compliant",
            date: "2025-03-01",
            document: "/documents/march_audit.pdf",
            type: "Privacy Review",
            submittedBy: "Dr. Smith",
            reviewedBy: "Compliance Team",
            riskLevel: "Low",
            auditType: "Internal",
            tags: ["HIPAA", "Quarterly Audit"],
          },
          {
            id: 2,
            title: "Unauthorized Access Log",
            status: "Non-Compliant",
            date: "2025-03-15",
            document: null,
            type: "Security Incident",
            submittedBy: "IT Admin",
            reviewedBy: "Security Lead",
            riskLevel: "High",
            auditType: "External",
            tags: ["Access Violation"],
          },
          {
            id: 3,
            title: "Quarterly Data Export",
            status: "Compliant",
            date: "2025-03-25",
            document: "/documents/q1_export.pdf",
            type: "Data Handling",
            submittedBy: "Records Manager",
            reviewedBy: "Compliance Team",
            riskLevel: "Medium",
            auditType: "Internal",
            tags: ["PHI", "Export"],
          },
        ]);
        setLoadingReports(false);
      });
  }, []);

  const totalReports = reports.length;
  const nonCompliantReports = reports.filter(
    (r) => r.status && r.status.toLowerCase().includes("non")
  ).length;
  const compliantReports = totalReports - nonCompliantReports;
  const reportsWithDocs = reports.filter((r) => r.document).length;
  const latestReportDate = reports.length > 0 ? reports[0].date : "N/A";

  return (
    <div className="p-4 space-y-8">
      {/* Summary + Chart Side by Side */}
      <section className="flex flex-col lg:flex-row justify-between gap-6 mt-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 flex-grow max-w-[60%]">
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-gray-500 text-sm">Total Reports</p>
            <h2 className="text-xl font-semibold">{totalReports}</h2>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-gray-500 text-sm">Compliant Reports</p>
            <h2 className="text-xl font-semibold text-green-600">
              {compliantReports}
            </h2>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-gray-500 text-sm">Reports with HIPAA Docs</p>
            <h2 className="text-xl font-semibold">{reportsWithDocs}</h2>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-gray-500 text-sm">Latest Report Date</p>
            <h2 className="text-xl font-semibold">{latestReportDate}</h2>
          </div>
        </div>

        {/* Pie Chart to the right */}
        <div className="bg-white rounded-2xl shadow p-4 w-full lg:w-[400px] self-start">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Compliance Overview
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: "Compliant", value: compliantReports },
                  { name: "Non-Compliant", value: nonCompliantReports },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ✅ Upload Form Section */}
      <div className="bg-white p-4 rounded-2xl shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Submit a New Compliance Report</h2>
        <SubmitReport />
      </div>

      {/* Reports Table */}
      <section>
        <h2 className="text-xl font-bold mb-4">Compliance Reports</h2>
        {loadingReports ? (
          <p>Loading reports...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed border border-gray-300 divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-200 text-left font-semibold text-gray-700">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">HIPAA Document</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Submitted By</th>
                  <th className="p-3">Reviewed By</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">Audit Type</th>
                  <th className="p-3">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="p-3">{report.title}</td>
                    <td className="p-3">{report.status}</td>
                    <td className="p-3">{report.date}</td>
                    <td className="p-3">
                      {report.document ? (
                        <a
                          href={
                            report.document.startsWith("http")
                              ? report.document
                              : `http://127.0.0.1:8000${report.document}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          View Document
                        </a>
                      ) : (
                        "No document"
                      )}
                    </td>
                    <td className="p-3">{report.type}</td>
                    <td className="p-3">{report.submittedBy}</td>
                    <td className="p-3">{report.reviewedBy}</td>
                    <td className="p-3">{report.riskLevel}</td>
                    <td className="p-3">{report.auditType}</td>
                    <td className="p-3">
                      {report.tags?.length ? report.tags.join(", ") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

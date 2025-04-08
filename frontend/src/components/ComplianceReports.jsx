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
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Total Reports</h2>
          <p className="text-3xl mt-2 font-bold text-blue-600">3</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Compliant Reports</h2>
          <p className="text-3xl mt-2 font-bold text-green-600">2</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold">HIPAA Documents</h2>
          <p className="text-3xl mt-2 font-bold text-purple-600">2</p>
        </div>
      </div>

      {/* Pie Chart Placeholder */}
      <div className="w-full md:w-1/2 lg:w-1/3 mx-auto bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Compliance Overview</h2>
        <div className="aspect-square border rounded-lg flex items-center justify-center">
          <p className="text-gray-400">Pie chart coming soon</p>
        </div>
      </div>

      {/* Form to Submit New Report */}
      <div className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Submit New Compliance Report</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Date</label>
            <input type="date" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="w-full p-2 border rounded">
              <option>HIPAA</option>
              <option>PCI</option>
              <option>GDPR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Document</label>
            <input type="file" className="w-full p-2 border rounded" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Submit Report
          </button>
        </form>
      </div>

      {/* Compliance Reports Table */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Compliance Reports</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2 border">Report Name</th>
              <th className="text-left p-2 border">Category</th>
              <th className="text-left p-2 border">Date</th>
              <th className="text-left p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border">Report 1</td>
              <td className="p-2 border">HIPAA</td>
              <td className="p-2 border">2025-03-01</td>
              <td className="p-2 border text-green-600">Compliant</td>
            </tr>
            <tr>
              <td className="p-2 border">Report 2</td>
              <td className="p-2 border">PCI</td>
              <td className="p-2 border">2025-03-03</td>
              <td className="p-2 border text-red-600">Non-Compliant</td>
            </tr>
            <tr>
              <td className="p-2 border">Report 3</td>
              <td className="p-2 border">GDPR</td>
              <td className="p-2 border">2025-03-05</td>
              <td className="p-2 border text-green-600">Compliant</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );


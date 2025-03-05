import { useEffect, useState } from "react";

export default function ComplianceReports() {
    const [reports, setReports] = useState([]);
    const [violations, setViolations] = useState([]);
    const [loadingReports, setLoadingReports] = useState(true);
    const [loadingViolations, setLoadingViolations] = useState(true);

    // Fetch compliance reports
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/compliance/reports/")
            .then(response => response.json())
            .then(data => {
                setReports(data);
                setLoadingReports(false);
            })
            .catch(error => {
                console.error("Error fetching reports:", error);
                setLoadingReports(false);
            });
    }, []);

    // Fetch compliance violations
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/compliance/violations/")
            .then(response => response.json())
            .then(data => {
                setViolations(data);
                setLoadingViolations(false);
            })
            .catch(error => {
                console.error("Error fetching violations:", error);
                setLoadingViolations(false);
            });
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">Compliance Reports</h2>
            {loadingReports ? (
                <p>Loading reports...</p>
            ) : reports.length > 0 ? (
                <table className="w-full border-collapse border border-gray-300 mt-4">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border p-2">Title</th>
                            <th className="border p-2">Status</th>
                            <th className="border p-2">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(report => (
                            <tr key={report.id} className="border">
                                <td className="border p-2">{report.title}</td>
                                <td className="border p-2">{report.status}</td>
                                <td className="border p-2">{report.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No reports available.</p>
            )}

            <h2 className="text-xl font-bold mt-6">Compliance Violations</h2>
            {loadingViolations ? (
                <p>Loading violations...</p>
            ) : violations.length > 0 ? (
                <table className="w-full border-collapse border border-gray-300 mt-4">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border p-2">Report</th>
                            <th className="border p-2">User</th>
                            <th className="border p-2">Violation Type</th>
                            <th className="border p-2">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {violations.map(violation => (
                            <tr key={violation.id} className="border">
                                <td className="border p-2">{violation.report}</td>
                                <td className="border p-2">{violation.user}</td>
                                <td className="border p-2">{violation.violation_type}</td>
                                <td className="border p-2">{new Date(violation.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No violations recorded.</p>
            )}
        </div>
    );
}

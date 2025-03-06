import { useEffect, useState } from "react";

export default function ComplianceReports() {
    const [reports, setReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(true);

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
                            <th className="border p-2">HIPAA Document</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(report => (
                            <tr key={report.id} className="border">
                                <td className="border p-2">{report.title}</td>
                                <td className="border p-2">{report.status}</td>
                                <td className="border p-2">{report.date}</td>
                                <td className="border p-2">
                                    {report.document ? (
                                        <a href={`http://127.0.0.1:8000${report.document}`} target="_blank" rel="noopener noreferrer">
                                            View Document
                                        </a>
                                    ) : (
                                        "No document"
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No reports available.</p>
            )}
        </div>
    );
}

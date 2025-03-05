import { useEffect, useState } from "react";

export default function ComplianceReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/compliance/reports/")  // Fetch data from Django API
            .then(response => response.json())
            .then(data => {
                setReports(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching reports:", error);
                setLoading(false);
            });
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">Compliance Reports</h2>
            {loading ? (
                <p>Loading...</p>
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
        </div>
    );
}


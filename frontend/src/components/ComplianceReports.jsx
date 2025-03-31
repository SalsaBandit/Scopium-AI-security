import { useEffect, useState } from "react";

export default function ComplianceReports() {
    const [reports, setReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(true);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/compliance/reports/")
            .then((response) => response.json())
            .then((data) => {
                setReports(data);
                setLoadingReports(false);
            })
            .catch((error) => {
                console.error("Error fetching reports:", error);
                setLoadingReports(false);
            });
    }, []);

    // Derived stats for dashboard cards
    const totalReports = reports.length;
    const nonCompliantReports = reports.filter(
        (r) => r.status && r.status.toLowerCase().includes("non")
    ).length;
    const compliantReports = totalReports - nonCompliantReports;
    const reportsWithDocs = reports.filter((r) => r.document).length;
    const latestReportDate = reports.length > 0 ? reports[0].date : "N/A";

    return (
        <div className="p-4 space-y-8">
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl shadow p-4">
                    <p className="text-gray-500 text-sm">Total Reports</p>
                    <h2 className="text-xl font-semibold">{totalReports}</h2>
                </div>
                <div className="bg-white rounded-2xl shadow p-4">
                    <p className="text-gray-500 text-sm">Compliant Reports</p>
                    <h2 className="text-xl font-semibold text-green-600">{compliantReports}</h2>
                </div>
                <div className="bg-white rounded-2xl shadow p-4">
                    <p className="text-gray-500 text-sm">Reports with HIPAA Docs</p>
                    <h2 className="text-xl font-semibold">{reportsWithDocs}</h2>
                </div>
                <div className="bg-white rounded-2xl shadow p-4">
                    <p className="text-gray-500 text-sm">Latest Report Date</p>
                    <h2 className="text-xl font-semibold">{latestReportDate}</h2>
                </div>
            </section>

            <section>
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
                            {reports.map((report) => (
                                <tr key={report.id} className="border">
                                    <td className="border p-2">{report.title}</td>
                                    <td className="border p-2">{report.status}</td>
                                    <td className="border p-2">{report.date}</td>
                                    <td className="border p-2">
                                        {report.document ? (
                                            report.document.startsWith("http") ? (
                                                <a
                                                    href={report.document}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 underline"
                                                >
                                                    View Document
                                                </a>
                                            ) : (
                                                <a
                                                    href={`http://127.0.0.1:8000${report.document}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 underline"
                                                >
                                                    View Document
                                                </a>
                                            )
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
            </section>
        </div>
    );
}

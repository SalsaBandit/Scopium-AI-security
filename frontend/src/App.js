import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [message, setMessage] = useState("");
    const [activeSection, setActiveSection] = useState("home"); // State to manage displayed content section.
    const [logs, setLogs] = useState([]); // Stores log data.
    const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering logs.
    const [sortField, setSortField] = useState("timestamp"); // Field to sort by.
    const [sortOrder, setSortOrder] = useState("asc"); // Sort order (asc or desc).

    // Fetches test message from backend.
    useEffect(() => {
        axios.get('/api/hello/')
            .then(response => setMessage(response.data.message))
            .catch(error => console.log(error));
    }, []);

    // Fetches logs from backend.
    useEffect(() => {
        if (activeSection === "userActivityLogs") {
            axios.get('/api/get_logs/')
                .then(response => setLogs(response.data.logs))
                .catch(error => console.log(error));
        }
    }, [activeSection]);

    // Function which calls the backend to create a log.
    const logEvent = async (event) => {
        await fetch("/api/log_event/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ event }),
        });
    };

    // Function to sort logs by the selected field and order.
    // NOTE: The button which handles sorting by user ID is currently set to sort by timestamp as well!
    const handleSort = (field) => {
        const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortOrder(order);
        const sortedLogs = [...logs].sort((a, b) => {
            if (order === "asc") return a[field] > b[field] ? 1 : -1;
            return a[field] < b[field] ? 1 : -1;
        });
        setLogs(sortedLogs);
    };

    // Filter logs based on the search term.
    const filteredLogs = logs.filter(log =>
        //log.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.timestamp.includes(searchTerm)
    );

    return (
        <>
            <div>
                <h1>{message}</h1>
                <button onClick={() => logEvent("Button Clicked - Home")}>Home</button>
            </div>

            <div className="dashboard">
                <header className="header">
                    <button>Account</button>
                </header>
                <nav className="navbar">
                    <button onClick={() => setActiveSection("home")}>Home</button>
                    <button onClick={() => setActiveSection("userActivityLogs")}>User Activity Logs</button>
                    <button onClick={() => setActiveSection("complianceReports")}>Compliance Reports</button>
                    <button onClick={() => setActiveSection("forensicTools")}>Forensic Tools</button>
                </nav>
                
                <div className="content">
                    {activeSection === "home" && (
                        <>
                            <div className="section recent-alerts">
                                <h2>Recent Alerts</h2>
                                <p>A list view with color-coded severity levels (critical, high, moderate).</p>
                                <p>Mark as reviewed, etc.</p>
                            </div>
                            <div className="section data-transfer-monitor">
                                <h2>Data Transfer Monitor</h2>
                                <p>A bar chart showing transfer volumes over time.</p>
                                <p>Selecting a bar drills down into detailed analysis (user, destination, data type).</p>
                            </div>
                            <div className="section recent-logs">
                                <h2>Recent Logs</h2>
                                <p>A list view of recent logs (date, user, action, status).</p>
                                <p>Interacting will expand logs for full detail.</p>
                            </div>
                            <div className="section user-activity-monitor">
                                <h2>User Activity Monitor</h2>
                                <p>A line graph showing user activity over time (anomalous spikes in red).</p>
                                <p>Inline notification flags for flagged activity.</p>
                            </div>
                        </>
                    )}
                    {activeSection === "userActivityLogs" && (
                        <div className="section user-activity-logs">
                            <h2>User Activity Logs</h2>
                            <div className="controls">
                                <div className="search-container">
                                    <input
                                        type="text"
                                        placeholder="Search logs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="sort-button">
                                    <button onClick={() => handleSort("timestamp")}>
                                        Sort by Timestamp {sortField === "timestamp" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                                    </button>
                                </div>
                                <div className="sort-button">
                                    <button onClick={() => handleSort("timestamp")}>
                                        Sort by User ID {sortField === "timestamp" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                                    </button>
                                </div>
                            </div>
                            <table className="logs-table">
                                <thead>
                                    <tr>
                                        <th className="event-column">Event</th>
                                        <th className="timestamp-column">Timestamp</th>
                                        <th className="user-id-column">User ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map((log, index) => (
                                        <tr key={index}>
                                            <td>{log.event}</td>
                                            <td>{log.timestamp}</td>
                                            {/*<td>{log.user.user_id}</td>*/}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        )}
                    {activeSection === "complianceReports" && (
                        <div className="section compliance-reports">
                            <h2>Compliance Reports</h2>
                            <p>Detailed compliance reports will be displayed here.</p>
                        </div>
                    )}
                    {activeSection === "forensicTools" && (
                        <div className="section forensic-tools">
                            <h2>Forensic Tools</h2>
                            <p>Tools for forensic analysis are displayed here.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default App;
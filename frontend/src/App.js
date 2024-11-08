import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [message, setMessage] = useState("");
    const [activeSection, setActiveSection] = useState("home"); // State to manage displayed content section.

    // Fetches message from django backend to demonstrate connectivity.
    useEffect(() => {
        axios.get('/api/hello/')
            .then(response => setMessage(response.data.message))
            .catch(error => console.log(error));
    }, []);

    // Function to set the active section to "User Activity Logs".
    const navigateToUserActivityLogs = () => {
        setActiveSection("userActivityLogs");
    };

    return (
        <>
            <div>
                <h1>{message}</h1>
            </div>

            <div className="dashboard">
                <header className="header">
                    <button>Account</button>
                </header>
                <nav className="navbar">
                    <button onClick={() => setActiveSection("home")}>Home</button>
                    <button onClick={navigateToUserActivityLogs}>User Activity Logs</button>
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
                            <p>Here you can view and analyze user activity logs in detail.</p>
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
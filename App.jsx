import './App.css';

function App() {
    return (
        <div className="dashboard">
            <header className="header">
                <h1>Account</h1>
            </header>
            <nav className="navbar">
                <button>Home</button>
                <button>User Activity Logs</button>
                <button>Compliance Reports</button>
                <button>Forensic Tools</button>
            </nav>
            <div className="content">
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
            </div>
        </div>
    );
}

export default App;
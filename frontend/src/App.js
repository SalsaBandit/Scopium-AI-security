import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './App.css';
import Login from './Login';

// Register Chart.js components.
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

function App() {
    const [message, setMessage] = useState("");
    const [activeSection, setActiveSection] = useState("home"); // State to manage displayed content section.
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Track login status
    const [logs, setLogs] = useState([]); // Stores log data.
    const [chartData, setChartData] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering logs.
    const [sortField, setSortField] = useState("timestamp"); // Field to sort by.
    const [sortOrder, setSortOrder] = useState("asc"); // Sort order (asc or desc).
    const [accountBoxes, setAccountBoxes] = useState([]); // State for Account page boxes.

    // Fetch a welcome message from the backend
    useEffect(() => {
        if (isAuthenticated) {
            axios.get('/api/hello/')
                .then(response => setMessage(response.data.message))
                .catch(error => console.error(error));
        }
    }, [isAuthenticated]);
    
    // Fetches logs from backend after authentication.
    useEffect(() => {
        if (isAuthenticated) {
            axios.get('/api/get_logs/')
                .then(response => setLogs(response.data.logs))
                .catch(error => console.log(error));
        }
    }, [activeSection]);

    // Fetch log data for User Activity Monitor widget.
    const aggregateLogsByDate = (logs) => {
        const countsByDate = logs.reduce((acc, log) => {
          const date = new Date(log.timestamp).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});
      
        const dates = Object.keys(countsByDate).sort((a, b) => new Date(a) - new Date(b));
        const counts = dates.map(date => countsByDate[date]);
        return { dates, counts };
      };

      // Function to log out the user
    const handleLogout = () => {
        setIsAuthenticated(false);
        setActiveSection("login"); // Redirect user to login after logout
    };
      
      // Render chart data.
      useEffect(() => {
        if (activeSection === "home" && logs.length > 0) {
          const aggregated = aggregateLogsByDate(logs);
          const data = {
            labels: aggregated.dates,
            datasets: [{
              label: 'Logs/Day',
              data: aggregated.counts,
              borderColor: '#ffb74d',
              tension: 0.1,
            }]
          };
          setChartData(data);
        }
      }, [activeSection, logs]);

    // Fetch Account page data.
    useEffect(() => {
        if (activeSection === "account") {
            axios.get('/api/account/')
                .then(response => setAccountBoxes(response.data.boxes))
                .catch(error => console.error('Error fetching account data:', error));
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
        log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.timestamp.includes(searchTerm)
    );

    // Handle successful login.
    const handleLoginSuccess = async () => {
        setIsAuthenticated(true);
        setActiveSection("home");

        // Log the authentication event.
        /*try {
            await logEvent("User Authenticated");
        } catch (error) {
            console.error("Failed To Log Authentication:", error);
        }*/
    };

    return (
        <>
            {!isAuthenticated && <Login onLoginSuccess={handleLoginSuccess} />}
            <div className={`dashboard ${!isAuthenticated ? "blur-background" : ""}`}>
                <header className="header">
                        <h1 className="header-user">{message}</h1>
                            <div className="header-buttons">
                                <button onClick={() => setActiveSection("account")}>Account</button>
                                {isAuthenticated && (<button className="logout-button" onClick={handleLogout}>Logout</button>)}
                            </div>
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
                                <h2>User Activity Monitor</h2><br/>
                                <div style={{ width: '100%', height: '80%' }}>
                                    {chartData ? (
                                        <Line
                                        data={chartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                            legend: { position: 'left' },
                                            },
                                        }}
                                        />
                                    ) : (
                                        <p>Loading chart...</p>
                                    )}
                                </div>
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
                                            <td>{log.user_id !== null ? log.user_id : "N/A"}</td> {/* Display User ID */}
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
                    {activeSection === "account" && (
                        <div className="section account">
                            <h2>Personal Information</h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                                {/* Account Boxes */}
                                {accountBoxes.map((box, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            border: '1px solid black',
                                            padding: '10px',
                                            margin: '10px',
                                            width: '200px',
                                            borderRadius: '8px',
                                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                            backgroundColor: '#fff',
                                        }}
                                    >
                                        <h3>{box.title}</h3>
                                        <p>{box.content}</p>
                                    </div>
                                ))}

                                {/* Additional Account Content */}
                                <div style={{
                                    flex: '1 1 100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px',
                                    marginTop: '20px',
                                }}>

                                    <div className="section name-information" style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        backgroundColor: '#fff',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                    }}>
                                        <h2>Name</h2>
                                        <p>Name</p>
                                    </div>

                                    <div className="section username-information" style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        backgroundColor: '#fff',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                    }}>
                                        <h2>Username</h2>
                                        <p>Username</p>
                                    </div>

                                    <div className="section email-information" style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        backgroundColor: '#fff',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                    }}>
                                        <h2>Recent Logs</h2>
                                        <p>Email</p>
                                    </div>

                                    <div className="section number-information" style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        backgroundColor: '#fff',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                    }}>
                                        <h2>Phone Number</h2>
                                        <p>Phone Number</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeSection === "account" && (
                        <div className="section account">
                            <h2>Additional Information</h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                                {/* Account Boxes */}
                                {accountBoxes.map((box, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            border: '1px solid black',
                                            padding: '10px',
                                            margin: '10px',
                                            width: '200px',
                                            borderRadius: '8px',
                                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                            backgroundColor: '#fff',
                                        }}
                                    >
                                        <h3>{box.title}</h3>
                                        <p>{box.content}</p>
                                    </div>
                                ))}

                                {/* Additional Account Content */}
                                <div style={{
                                    flex: '1 1 100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px',
                                    marginTop: '20px',
                                }}>

                                    <div className="section role-information" style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        backgroundColor: '#fff',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                    }}>
                                        <h2>User Role</h2>
                                        <p>User Role</p>
                                    </div>

                                    <div className="section account-information" style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        backgroundColor: '#fff',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                    }}>
                                        <h2>Account Created</h2>
                                        <p>Account Created</p>
                                    </div>

                                    <div className="section login-information" style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        backgroundColor: '#fff',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                    }}>
                                        <h2>Last Login</h2>
                                        <p>Last Login</p>
                                    </div>

                                    <div className="section password-information" style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        backgroundColor: '#fff',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                    }}>
                                        <h2>Password Last Changed</h2>
                                        <p>Password Last Changed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default App;
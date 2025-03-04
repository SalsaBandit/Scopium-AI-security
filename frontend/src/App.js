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
    const [activeSection, setActiveSection] = useState("Home"); // State to manage displayed content section.
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Track login status
    const [logs, setLogs] = useState([]); // Stores log data.
    const [recentLogs, setRecentLogs] = useState([]); // Store only 10 recent logs
    const [chartData, setChartData] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering logs.
    const [sortField, setSortField] = useState("timestamp"); // Field to sort by.
    const [sortOrder, setSortOrder] = useState("asc"); // Sort order (asc or desc).
    const [accountBoxes, setAccountBoxes] = useState([]); // State for Account page boxes.
    const [username, setUsername] = useState(localStorage.getItem("username") || "Unknown User");
    const [email, setEmail] = useState(""); // Store user email
    const [accountCreated, setAccountCreated] = useState(""); // Store account creation date
    const [lastLogin, setLastLogin] = useState(""); // Store last login time
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [userRole, setUserRole] = useState("");

    // Fetch a welcome message from the backend
    useEffect(() => {
        if (isAuthenticated) {
            axios.get('/api/hello/', { withCredentials: true })  // Ensure cookies are included
                .then(response => setMessage(response.data.message))
                .catch(error => console.error("API Error:", error));
        }
    }, [isAuthenticated]);

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);
    
    // Fetches logs from backend after authentication.
    useEffect(() => {
        if (isAuthenticated) {
            axios.get('/api/get_logs/')
                .then(response => setLogs(response.data.logs))
                .catch(error => console.log(error));
        }
    }, [activeSection, isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            axios.get('/api/get_recent_logs/')
                .then(response => setRecentLogs(response.data.logs))
                .catch(error => console.log(error));
        }
    }, [activeSection, isAuthenticated]);

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
    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/logout/', {
                method: 'POST',
                credentials: 'include',  // Ensure session is included
            });
    
            const data = await response.json();
            if (data.success) {
                setIsAuthenticated(false);
                setActiveSection("login");
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };
      
      // Render chart data.
      useEffect(() => {
        if (activeSection === "Home" && logs.length > 0) {
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
        if (activeSection === "Account") {
            axios.get('/api/account/')
                .then(response => {
                    if (response.data.boxes) {
                        setAccountBoxes(response.data.boxes);
                    }
                    if (response.data.username) {
                        setUsername(response.data.username);
                    }
                    if (response.data.email) {
                        setEmail(response.data.email);
                    }
                    if (response.data.account_created) {
                        setAccountCreated(response.data.account_created);
                    }
                    if (response.data.last_login) {
                        setLastLogin(response.data.last_login);  // Store last login time
                    }
                    if (response.data.full_name) {
                        setFullName(response.data.full_name);  // Store full name
                    }
                    if (response.data.phone_number) {
                        setPhoneNumber(response.data.phone_number);  // Store phone number
                    }
                    if (response.data.role) {
                        setUserRole(response.data.role);  // Store user role
                    }
                })
                .catch(error => console.error('Error fetching account data:', error));
        }
    }, [activeSection]);

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
    const handleLoginSuccess = async (username) => {
        if (!username) {
            try {
                const response = await fetch('/api/hello/', { credentials: 'include' });
                const data = await response.json();
                username = data.message.replace("Hello, ", "").replace("!", "");
            } catch (error) {
                console.error("Failed to fetch username:", error);
            }
        }
    
        if (username) {
            setUsername(username);  // Store in state
            localStorage.setItem("username", username);  // Store in localStorage
        }
    
        setIsAuthenticated(true);
        setActiveSection("Home");
    };

    const handleNavigation = (section) => {
        setActiveSection(section);
    
        fetch("/api/log_event/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ event: `${username} navigated to ${section}`, user: username }),
        });
    };

    return (
        <>
            {!isAuthenticated && <Login onLoginSuccess={handleLoginSuccess} />}
            <div className={`dashboard ${!isAuthenticated ? "blur-background" : ""}`}>
                <header className="header">
                        <h1 className="header-user">{message}</h1>
                            <div className="header-buttons">
                                <button onClick={() => handleNavigation("Account")}>Account</button>
                                {isAuthenticated && (<button className="logout-button" onClick={handleLogout}>Logout</button>)}
                            </div>
                </header>
                <nav className="navbar">
                    <button onClick={() => handleNavigation("Home")}>Home</button>
                    <button onClick={() => handleNavigation("User Activity Logs")}>User Activity Logs</button>
                    <button onClick={() => handleNavigation("Compliance Reports")}>Compliance Reports</button>
                    <button onClick={() => handleNavigation("Forensic Tools")}>Forensic Tools</button>
                </nav>

                <div className="content">
                    {activeSection === "Home" && (
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
                                <table className="logs-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Action</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentLogs.map((log, index) => (
                                            <tr key={index}>
                                                <td>{log.username}</td>
                                                <td>{log.event}</td>
                                                <td>{log.timestamp}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                    {activeSection === "User Activity Logs" && (
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
                    {activeSection === "Compliance Reports" && (
                        <div className="section compliance-reports">
                            <h2>Compliance Reports</h2>
                            <p>Detailed compliance reports will be displayed here.</p>
                        </div>
                    )}
                    {activeSection === "Forensic Tools" && (
                        <div className="section forensic-tools">
                            <h2>Forensic Tools</h2>
                            <p>Tools for forensic analysis are displayed here.</p>
                        </div>
                    )}
                    {activeSection === "Account" && (
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
                                        <p>{fullName}</p>
                                    </div>

                                    <div className="section username-information" style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        backgroundColor: '#fff',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                    }}>
                                        <h2>Username</h2>
                                        <p>{username}</p>
                                    </div>

                                    <div className="section email-information" style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        backgroundColor: '#fff',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                    }}>
                                        <h2>Email</h2>
                                        <p>{email}</p>
                                    </div>

                                    <div className="section number-information" style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        backgroundColor: '#fff',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                    }}>
                                        <h2>Phone Number</h2>
                                        <p>{phoneNumber || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeSection === "Account" && (
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
                                        <p>{userRole || "N/A"}</p>
                                    </div>

                                    <div className="section account-information" style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        backgroundColor: '#fff',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                    }}>
                                        <h2>Account Created</h2>
                                        <p>{accountCreated}</p>
                                    </div>

                                    <div className="section login-information" style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        backgroundColor: '#fff',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                    }}>
                                        <h2>Last Login</h2>
                                        <p>{lastLogin}</p>
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
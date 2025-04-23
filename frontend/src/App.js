import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import ComplianceReports from "./components/ComplianceReports";

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

  const inputStyle = {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1em',
    fontFamily: 'inherit'
};

const buttonStyle = {
    padding: '10px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    fontFamily: 'inherit'
};

const runForensicTool = async (tool) => {
    try {
        const response = await fetch(`tools/${tool}/`, {
            method: 'GET',
            credentials: 'include', // Include credentials for session management
        });
        const data = await response.json();
        if (data.success) {
            alert(`Tool ${tool} executed successfully.`);
        } else {
            alert(`Error executing tool: ${data.message}`);
        }    
    } catch (error) {
        console.error("Error executing forensic tool:", error);
        alert("An error occurred while executing the tool.");
    }
};

function App() {
    const [message, setMessage] = useState("");
    const [activeSection, setActiveSection] = useState("Home"); // State to manage displayed content section.
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Track login status.
    const [logs, setLogs] = useState([]); // Stores log data.
    const [recentLogs, setRecentLogs] = useState([]); // Store only 5 recent logs.
    const [chartData, setChartData] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering logs.
    const [sortField, setSortField] = useState("timestamp"); // Field to sort by.
    const [sortOrder, setSortOrder] = useState("asc"); // Sort order (asc or desc).
    //const [accountBoxes, setAccountBoxes] = useState([]); // State for Account page boxes.
    const [username, setUsername] = useState(localStorage.getItem("username") || "Unknown User");
    const [email, setEmail] = useState(""); // Store user email.
    const [accountCreated, setAccountCreated] = useState(""); // Store account creation date.
    const [lastLogin, setLastLogin] = useState(""); // Store last login time.
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [userRole, setUserRole] = useState("");
    const [visibleWidgets, setVisibleWidgets] = useState({alerts: true, transfers: true, logs: true, activity: true });
    const [passwordLastChanged, setPasswordLastChanged] = useState(""); // Password change date
    const [accessLevel, setAccessLevel] = useState(parseInt(localStorage.getItem("access_level")) || 1);
    const [allUsers, setAllUsers] = useState([]);
    const [passwordChangeError, setPasswordChangeError] = useState("");
    const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
    const [profileId, setProfileId] = useState("");
    const [eventType, setEventType] = useState("");
    const [exportUserId, setExportUserId] = useState("");
    const [exportTimestamp, setExportTimestamp] = useState("");

    // Fetch a welcome message from the backend.
    useEffect(() => {
        if (isAuthenticated) {
            axios.get('/api/hello/', { withCredentials: true })  // Ensure cookies are included.
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

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

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
                credentials: 'include',  // Ensure session is included.
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
                    /*if (response.data.boxes) {
                        setAccountBoxes(response.data.boxes);
                    }*/
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
                        setLastLogin(response.data.last_login);  // Store last login time.
                    }
                    if (response.data.full_name) {
                        setFullName(response.data.full_name);  // Store full name.
                    }
                    if (response.data.phone_number) {
                        setPhoneNumber(response.data.phone_number);  // Store phone number.
                    }
                    if (response.data.role) {
                        setUserRole(response.data.role);  // Store user role.
                    }
                    if (response.data.password_last_changed) {
                        setPasswordLastChanged(response.data.password_last_changed);
                    }
                    if (response.data.access_level !== undefined) {
                        setAccessLevel(response.data.access_level);
                    }
                    if (response.data.profile_id) {
                        setProfileId(response.data.profile_id);
                    }
                    /*const isAdmin = response.data.role === "admin" && response.data.access_level === 5;
                    console.log("isAdmin:", isAdmin, "| role:", response.data.role, "| access_level:", response.data.access_level);
                    if (isAdmin) {
                        fetch("/api/list_users/", { credentials: "include" })
                            .then(res => res.json())
                            .then(data => {
                                if (data.success) setAllUsers(data.users);
                            })
                            .catch(err => console.error("Error fetching users:", err));
                    }*/
                })
                .catch(error => console.error('Error fetching account data:', error));
        }
    }, [activeSection]);

    useEffect(() => {
        if (userRole === "admin" && accessLevel === 5 && isAuthenticated) {
            fetch("/api/list_users/", { credentials: "include" })
                .then(res => res.json())
                .then(data => {
                    console.log("Fetched users (fallback useEffect):", data);
                    if (data.success) setAllUsers(data.users);
                })
                .catch(err => console.error("Error fetching users (fallback):", err));
        }
    }, [userRole, accessLevel, isAuthenticated]);

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
            setUsername(username);
            localStorage.setItem("username", username);
    
            // Pull from localStorage after Login.js sets it
            const role = localStorage.getItem("role");
            const level = parseInt(localStorage.getItem("access_level"));
    
            setUserRole(role);
            setAccessLevel(level);
        }
    
        setIsAuthenticated(true);
        setActiveSection("Home");
    };

    // Toggles widget on dashboard Home.
    const toggleWidget = (key) => {
        setVisibleWidgets((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
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
            <div className="dashboard-wrapper">
                <div className={`dashboard ${(!isAuthenticated || showPasswordSuccess) ? "blur-background" : ""}`}>
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
                            <div className="home-toggle-bar">
                                <button onClick={() => toggleWidget('alerts')}>
                                    {visibleWidgets.alerts ? 'Hide' : 'Show'} Alerts
                                </button>
                                <button onClick={() => toggleWidget('logs')}>
                                    {visibleWidgets.logs ? 'Hide' : 'Show'} Logs
                                </button>
                                <button onClick={() => toggleWidget('activity')}>
                                    {visibleWidgets.activity ? 'Hide' : 'Show'} Activity Monitor
                                </button>
                            </div>

                            {visibleWidgets.alerts && (
                                <div className="section recent-alerts">
                                    <h2>Recent Alerts</h2>
                                    <ul className="alert-list">
                                        {logs
                                            .filter(log => log.event.toLowerCase().includes("failed login"))
                                            .slice(0, 5) // Show only 5 recent failed login attempts.
                                            .map((log, index) => (
                                                <li key={index} className="alert-item alert-warning">
                                                    <strong>{log.timestamp}</strong> — {log.event}
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            )}

                            {visibleWidgets.logs && (
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
                            )}

                            {visibleWidgets.activity && (
                                <div className="section user-activity-monitor">
                                    <h2>User Activity Monitor</h2><br />
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
                            )}
                        </>
                    )} {/*End Home section.*/}

                    {activeSection === "User Activity Logs" && (
                        <div className="section user-activity-logs">
                            <div className="log-section-container">
                                {/* Panel to export logs with filters */}
                                <div className="log-exporting">
                                    <div className="export-controls">
                                        <input
                                            type="text"
                                            placeholder="Filter by Event Type"
                                            value={eventType}
                                            onChange={(e) => setEventType(e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Filter by User ID"
                                            value={exportUserId}
                                            onChange={(e) => setExportUserId(e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Filter by Timestamp"
                                            value={exportTimestamp}
                                            onChange={(e) => setExportTimestamp(e.target.value)}
                                        />
                                        <button
                                            onClick={() => {
                                                const exportFiltered = filteredLogs.filter(log => {
                                                    const matchesEvent = eventType ? log.event?.toLowerCase().includes(eventType.toLowerCase()) : true;
                                                    const matchesUser = exportUserId ? (log.profile_id || "").toString() === exportUserId : true;
                                                    const matchesTime = exportTimestamp ? log.timestamp.startsWith(exportTimestamp) : true;
                                                    return matchesEvent && matchesUser && matchesTime;
                                                });

                                                const json = JSON.stringify(exportFiltered, null, 2);
                                                const blob = new Blob([json], { type: "application/json" });
                                                const url = URL.createObjectURL(blob);
                                                const link = document.createElement("a");
                                                link.href = url;
                                                link.download = "user-activity-logs.json";
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                                URL.revokeObjectURL(url);
                                            }}
                                        >
                                            Export Logs to JSON
                                        </button>
                                    </div>
                                </div>
                                
                                {/*Panel to view logs without downloading.*/}
                                <div className="log-list">
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
                                                    <td>{log.profile_id !== null ? log.profile_id : "N/A"}</td> {/* Display User ID */}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )} {/*End User Activity Logs section.*/}

                    {activeSection === "Compliance Reports" && <ComplianceReports />}

                    {activeSection === "Forensic Tools" && (
                        <div className="section forensic-tools">
                            <h2>Forensic Tools</h2>
                            <p>Tools for forensic analysis are displayed here.</p>
                            <button onClick={() => runForensicTool('run_tool_1')}>Log analysis</button>
                            <button onClick={() => runForensicTool('run_tool_2')}>File activity monitor</button>
                        </div>
                    )} {/*End Forensic Tools section.*/}

                    {activeSection === "Account" && (() => {
                        const cardStyle = {
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '20px',
                            backgroundColor: '#fff',
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        };

                        return (
                            <>
                                {/*Left-hand side information box.*/}
                                <div className="section account">
                                    <h2>Personal Information</h2>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px', flexDirection: 'column' }}>
                                        <div className="section name-information" style={cardStyle}>
                                            <h2>Name</h2>
                                            <p>{fullName}</p>
                                        </div>
                                        <div className="section username-information" style={cardStyle}>
                                            <h2>Username</h2>
                                            <p>{username}</p>
                                        </div>
                                        <div className="section email-information" style={cardStyle}>
                                            <h2>Email</h2>
                                            <p>{email}</p>
                                        </div>
                                        <div className="section number-information" style={cardStyle}>
                                            <h2>Phone Number</h2>
                                            <p>{phoneNumber || "N/A"}</p>
                                        </div>
                                    </div>
                                    {/* Change Password Section */}
                                    <div className="section account" style={{ maxWidth: '100%', marginTop: '10px' }}>
                                        <h2>Change Password</h2>
                                        <form onSubmit={async (e) => {
                                                e.preventDefault();
                                                const new_password = e.target.new_password.value;
                                                const confirm_password = e.target.confirm_password.value;

                                                if (new_password !== confirm_password) {
                                                    setPasswordChangeError("Passwords do not match");
                                                    return;
                                                }

                                                setPasswordChangeError("");

                                                const response = await fetch("http://localhost:8000/api/change_password/", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    credentials: "include",
                                                    body: JSON.stringify({ new_password, confirm_password }),
                                                });

                                                const result = await response.json();
                                                //alert(result?.message || "Password update attempt failed.");
                                                if (result.success) {
                                                    e.target.reset();
                                                    setShowPasswordSuccess(true);  // Show success box
                                                } 
                                                else {
                                                    setPasswordChangeError(result.message || "Password update attempt failed.");
                                                }
                                            }}
                                            style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '100%' }}
                                        >
                                            <input type="password" name="new_password" placeholder="New Password" required style={inputStyle} />
                                            <input type="password" name="confirm_password" placeholder="Confirm Password" required style={inputStyle} />
                                            <button type="submit" style={buttonStyle}>Change Password</button>
                                            {passwordChangeError && (
                                                <p style={{ color: 'red', fontSize: '0.9em' }}>{passwordChangeError}</p>
                                            )}
                                        </form>
                                    </div>
                                </div>
                                {/*Right-hand side information box.*/}
                                <div className="section account">
                                    <h2>Additional Information</h2>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px', flexDirection: 'column' }}>
                                        <div className="section role-information" style={cardStyle}>
                                            <h2>User Role</h2>
                                            <p>{userRole || "N/A"}</p>
                                        </div>
                                        <div className="section user-id-information" style={cardStyle}>
                                            <h2>User ID</h2>
                                            <p>{profileId || "N/A"}</p>
                                        </div>
                                        <div className="section account-information" style={cardStyle}>
                                            <h2>Account Created</h2>
                                            <p>{accountCreated}</p>
                                        </div>
                                        <div className="section login-information" style={cardStyle}>
                                            <h2>Last Login</h2>
                                            <p>{lastLogin}</p>
                                        </div>
                                        <div className="section password-information" style={cardStyle}>
                                            <h2>Password Last Changed</h2>
                                            <p>{passwordLastChanged}</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Create User Form & Delete User Form */}
                                {userRole === "admin" && accessLevel === 5 && (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'stretch',
                                        gap: '20px',
                                        maxWidth: '600px',
                                        width: '100%',
                                    }}>
                                        {/* Create User Form */}
                                        <div className="section" style={{
                                        border: '1px solid #4caf50',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        backgroundColor: '#f9fff9',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                        width: '100%'
                                        }}>
                                        <h2>Add New User</h2>
                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            const username = e.target.username.value;
                                            const password = e.target.password.value;
                                            const email = e.target.email.value;
                                            const full_name = e.target.full_name.value;
                                            const phone_number = e.target.phone_number.value;
                                            const role = e.target.role.value;
                                            const access_level = parseInt(e.target.access_level.value);

                                            try {
                                            const response = await fetch("/api/register/", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                credentials: "include",
                                                body: JSON.stringify({ username, password, email, full_name, phone_number, role, access_level })
                                            });

                                            const result = await response.json();
                                            alert(result.message);
                                            e.target.reset();
                                            } catch (err) {
                                            alert("Error: Could not register user.");
                                            console.error(err);
                                            }
                                        }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <input type="text" name="username" placeholder="Username" required style={inputStyle} />
                                            <input type="password" name="password" placeholder="Password" required style={inputStyle} />
                                            <input type="text" name="full_name" placeholder="Full Name" style={inputStyle} />
                                            <input type="text" name="email" placeholder="Email" style={inputStyle} />
                                            <input type="text" name="phone_number" placeholder="Phone Number" style={inputStyle} />
                                            <select name="role" defaultValue="user" style={inputStyle}>
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                            </select>
                                            <input type="number" name="access_level" placeholder="Access Level" defaultValue="1" min="1" style={inputStyle} />
                                            <button type="submit" style={buttonStyle}>Create User</button>
                                        </form>
                                        </div>

                                        {/* Delete User Form */}
                                        <div className="section" style={{
                                        border: '1px solid #f44336',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        backgroundColor: '#fff8f8',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                        width: '100%'
                                        }}>
                                        <h2>Delete User</h2>
                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            const usernameToDelete = e.target.username.value;

                                            if (!window.confirm(`Are you sure you want to delete user "${usernameToDelete}"?`)) return;

                                            try {
                                            const response = await fetch("/api/delete_user/", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                credentials: "include",
                                                body: JSON.stringify({ username: usernameToDelete })
                                            });

                                            const result = await response.json();
                                            alert(result.message);
                                            e.target.reset();

                                            // 🔄 Refresh the user list dropdown
                                            const refreshed = await fetch("/api/list_users/", { credentials: "include" });
                                            const data = await refreshed.json();
                                            if (data.success) setAllUsers(data.users);

                                            } catch (err) {
                                            alert("Error: Could not delete user.");
                                            console.error(err);
                                            }
                                        }} style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: 0, padding: 0 }}>
                                            <select name="username" required style={inputStyle}>
                                            <option value="">Select user to delete</option>
                                            {allUsers
                                                .filter(u => u && u !== username) // prevent excluding empty/null usernames
                                                .map((u, idx) => (
                                                <option key={idx} value={u}>{u}</option>
                                                ))}
                                            </select>
                                            <button type="submit" style={{ ...buttonStyle, backgroundColor: '#f44336' }}>Delete User</button>
                                        </form>
                                        </div>
                                    </div>
                                    )}
                            </>
                        );
                    })()} {/*End account section.*/}
                </div>
            </div>
            </div>
            {showPasswordSuccess && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        padding: '30px',
                        borderRadius: '12px',
                        maxWidth: '400px',
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                    }}>
                        <h3 style={{ color: '#2e7d32' }}>Password Changed</h3>
                        <p style={{ margin: '15px 0' }}>Please log in again with your new password.</p>
                        <button
                            style={{ ...buttonStyle, padding: '8px 20px' }}
                            onClick={() => {
                                setShowPasswordSuccess(false);
                                setIsAuthenticated(false);
                                localStorage.removeItem("username");
                                localStorage.removeItem("role");
                                localStorage.removeItem("access_level");
                                setActiveSection("login");
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default App;
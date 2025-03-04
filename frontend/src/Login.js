import React, { useState } from 'react';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',  // REQUIRED to send cookies
                body: JSON.stringify({ username, password })
            });
    
            const data = await response.json();
            if (data.success) {
                // Fetch additional user details (role, access level)
                const userDetailsResponse = await fetch(`http://localhost:8000/api/user_details/${username}/`);
                const userDetails = await userDetailsResponse.json();

                if (userDetails.success) {
                    localStorage.setItem("username", username);
                    localStorage.setItem("role", userDetails.role);
                    localStorage.setItem("access_level", userDetails.access_level);

                    onLoginSuccess(username, userDetails.role, userDetails.access_level);
                } else {
                    setMessage("Failed to retrieve user details.");
                }
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="login-overlay">
            <div className="login-popup">
                <h2>Login</h2><br/>
                <div>
                    <input 
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <br />
                <div>
                    <input 
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <br />
                <button type="button" onClick={handleLogin}>Login</button>
                <br />
                {message && <p>{message}</p>}
            </div>
        </div>
    );
};

export default Login;
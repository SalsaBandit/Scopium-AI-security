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
                body: JSON.stringify({ username, password })
            });
    
            const data = await response.json();
            if (data.success) {
                onLoginSuccess(username); // Pass the username to App.js
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
                <p>[DEBUG] Use 'test' for USER & PASS</p><br/>
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
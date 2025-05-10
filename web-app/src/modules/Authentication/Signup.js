import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/firebase';  // Correct path to firebase
import { createUserWithEmailAndPassword } from 'firebase/auth';
import '../../styles/signup.css';  // Correct path to signup.css

function Signup() {
    const [email, setEmail] = useState('');
    const [nric, setNric] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSignup = (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then(() => {
                navigate('/login');  // Redirect to Login page after successful signup
            })
            .catch((error) => {
                setError(error.message);
            });
    };

    return (
        <div className="container">
            <div className="signup-box">
                <h1>Create an Account</h1>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSignup}>
                    <label htmlFor="email">Email address:</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label htmlFor="nric">NRIC:</label>
                    <input
                        type="text"
                        id="nric"
                        placeholder="NRIC"
                        value={nric}
                        onChange={(e) => setNric(e.target.value)}
                        required
                    />
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <label htmlFor="confirm-password">Confirm Password:</label>
                    <input
                        type="password"
                        id="confirm-password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn">Sign Up</button>
                </form>
                <p className="login-text">Already have an account? <a href="/login">Login</a></p>
            </div>
        </div>
    );
}

export default Signup;

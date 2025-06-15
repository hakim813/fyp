import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, database } from '../../firebase/firebase'; // Make sure database is exported
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, get, set, child } from 'firebase/database';
import './signup.css';

function Signup() {
    const [email, setEmail] = useState('');
    const [nricId, setNricId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordRule = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!username || !email || !nricId || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (!passwordRule.test(password)) {
            setError('Password must be at least 8 characters, include an uppercase letter and a number.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            // Check for duplicate email/NRIC in Realtime Database
            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, "users"));
            if (snapshot.exists()) {
                const users = snapshot.val();
                const idExist = Object.values(users).find(user => user.nricId === nricId);
                const emailExist = Object.values(users).find(user => user.email === email);
                if (emailExist) {
                    setError("Email already taken. Please use a different one.");
                    return;
                } else if (idExist) {
                    setError("NRIC already taken. Please use a different one.");
                    return;
                }
            }
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            // Store extra info in Realtime Database
            await set(ref(database, "users/" + user.uid), {
                username: username,
                email: user.email,
                nricId: nricId,
            });
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-container">
                <div className="signup-box">
                    <h1>Create an Account</h1>
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleSignup}>
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <label htmlFor="email">Email address:</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label htmlFor="nricId">NRIC:</label>
                        <input
                            type="text"
                            id="nricId"
                            placeholder="NRIC"
                            value={nricId}
                            onChange={(e) => setNricId(e.target.value)}
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
        </div>
    );
}

export default Signup;
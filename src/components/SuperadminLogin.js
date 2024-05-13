import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom'; // Import Link from react-router-dom
import { auth, firestore } from '../firebase'; // Import Firebase auth and Firestore
import './SuperadminLogin.css'; // Import custom styles

function SuperadminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Sign in with email and password
            await auth.signInWithEmailAndPassword(email, password);
            // Fetch additional details from Firestore
            const currentUser = auth.currentUser;
            const userRef = firestore.collection('superadmins').doc(currentUser.uid);
            const userSnapshot = await userRef.get();
            if (userSnapshot.exists) {
                // User is a superadmin, set loggedIn state to true
                setLoggedIn(true);
            } else {
                setError('You are not authorized as a superadmin.');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    if (loggedIn) {
        // Redirect to Superadmin page upon successful login
        return <Navigate to="/superadmin" />;
    }

    return (
        <div className="custom-login-container">
            <div className="custom-login-wrapper">
                <h2 className="custom-login-heading">Superadmin Login</h2>
                <form onSubmit={handleSubmit} className="custom-login-form">
                    <div className="custom-form-group">
                        <input
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            required
                            className="custom-form-input"
                            placeholder="Email"
                        />
                    </div>
                    <div className="custom-form-group">
                        <input
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                            className="custom-form-input"
                            placeholder="Password"
                        />
                    </div>
                    <button type="submit" className="bg-black text-white font-bold py-3 px-3 rounded-lg focus:outline-none focus:shadow-outline hover:bg-gray-900 mt-1">Login</button>
                    {error && <div className="custom-error">{error}</div>}
                </form>
                <p className="text-center mt-4">
                    Don't have an account? <a href="/superadmin-registration" className="text-blue-500 hover:underline">Register here</a>
                </p>
            </div>
        </div>
    );
}

export default SuperadminLogin;

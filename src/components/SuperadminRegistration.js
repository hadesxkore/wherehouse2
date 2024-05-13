import React, { useState } from 'react';
import { auth, firestore } from '../firebase'; // Import Firebase authentication and Firestore
import { Navigate } from 'react-router-dom'; // Import Navigate from react-router-dom

function SuperadminRegistration() {
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [registrationSuccess, setRegistrationSuccess] = useState(false); // State to track registration success

    const handleRegistration = async (e) => {
        e.preventDefault();
        try {
            // Create user with email and password
            const { user } = await auth.createUserWithEmailAndPassword(email, password);
            
            // Once user is created, add additional details to Firestore
            await firestore.collection('superadmins').doc(user.uid).set({
                email,
                displayName,
                role: 'admin', // Set the role to 'admin'
                createdTimestamp: new Date(),
                lastLoginTimestamp: null,
                profilePicture: '', // Add profile picture if needed
                additionalPermissions: {} // Add any additional permissions
            });

            // Set registration success to true
            setRegistrationSuccess(true);
        } catch (error) {
            console.error('Error registering superadmin:', error);
        }
    };

    if (registrationSuccess) {
        // Redirect to Superadmin login page upon successful registration
        return <Navigate to="/superadmin" />;
    }

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center">Superadmin Registration</h2>
                <form onSubmit={handleRegistration}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-l font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="example@example.com"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-l font-bold mb-2" htmlFor="displayName">
                            Display Name
                        </label>
                        <input
                            type="text"
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                            className="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Admin"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-l font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-black text-white font-bold py-3 px-3 rounded-lg focus:outline-none focus:shadow-outline hover:bg-gray-900 mt-1 w-full"
                    >
                        Register
                    </button>
                </form>
                <p className="text-center mt-4">
                    Already have an account? <a href="/superadmin" className="text-blue-500 hover:underline">Login here</a>
                </p>
            </div>
        </div>
    );
}

export default SuperadminRegistration;

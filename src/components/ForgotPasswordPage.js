import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import motion from Framer Motion
import logo from '../images/logo.png';
import lockIcon from '../images/lock.png'; // Import the lock icon image
import { auth } from '../firebase'; // Import Firebase auth

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Start loading animation
        try {
            if (!email) {
                throw new Error('Please enter your email address.');
            }
            await auth.sendPasswordResetEmail(email);
            setResetSuccess(true);
            setResetError('');
        } catch (error) {
            setResetError(error.message);   
            console.error(error.message);
        } finally {
            setIsLoading(false); // Stop loading animation
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: '#eeeeee' }}>
            <div className="logo-container mb-18">
                <img src={logo} alt="Logo" className="logo" style={{ width: '200px' }} />
            </div>
            <motion.form 
                id="forgot-password-form" 
                className="w-full max-w-md bg-white p-8 rounded-lg shadow-md mb-48" 
                onSubmit={handleResetPassword}
                initial={{ opacity: 0, y: -50 }} // Initial motion values
                animate={{ opacity: 1, y: 0 }} // Animation motion values
                transition={{ duration: 0.5 }} // Animation duration
            >
                <div className="relative">
                    <h2 className="text-3xl font-bold mb-6 text-left mt-5">Forgot your password?</h2>
                    <img src={lockIcon} alt="Lock Icon" className="absolute top-2 left-1/2 transform -translate-x-1/2 -translate-y-full" style={{ width: '50px' }} />
                </div>
                <p className="text-gray-600 mb-4">Enter your email address below and we'll send you a code to log in and reset your password.</p>
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
                    <input className="rounded-lg shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-custom-input" id="email" type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <button className="bg-black text-white font-bold py-2 px-3 rounded-lg focus:outline-none focus:shadow-outline hover:bg-gray-900 mt-3" type="submit" style={{ width: '100%' }}>
                    {isLoading ? 'Sending...' : 'Reset Password'}
                </button>
                {resetError && <p className="text-red-500 mt-2">{resetError}</p>}
                {resetSuccess && (
                    <div className="mt-4 p-4 bg-green-200 rounded-md">
                        <p className="text-green-800">Password reset email sent successfully.</p>
                    </div>
                )}
                <hr className="my-8 border-gray-400" style={{ width: '100%' }} />
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-bigger">Remember your password?</span>
                    <Link to="/login" className="border-2 border-custom-color text-custom-color font-relative-pro py-1.5 px-4 rounded-lg focus:outline-none focus:shadow-outline bg-transparent-hover  hover:bg-gray-200 hover:text-gray-900">Log in</Link>
                </div>
            </motion.form>
        </div>
    );
}

export default ForgotPasswordPage;

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './styles/tailwind.css';
import LoadingPage from './components/LoadingPage';
import SignUpPage from './components/SignUpPage';
import LoginPage from './components/LoginPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import VerifyPage from './components/VerifyPage';
import HomePage from './components/HomePage';
import ProfilePage from './components/ProfilePage';
import Dashboard from './components/Dashboard';
import Superadmin from './components/superadmin';
import SuperadminRegistration from './components/SuperadminRegistration';
import WarehouseCard from './components/WarehouseCard';
import Users from './components/users';
import Reports from './components/reports';
import Analytics from './components/Analytics';
import SuperadminLogin from './components/SuperadminLogin';
import { auth } from './firebase'; // Assuming you have Firebase auth
import Navigation from './components/Navigation'; // Import the Navigation component

function App() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <LoadingPage />;
    }

    return (
        <Router>
            <div style={{ backgroundColor: '#eeeeee', minHeight: '100vh' }}>
                <Routes>
                    <Route exact path="/" element={<LoadingPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/verify" element={<VerifyPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/Analytics" element={<Analytics />} />
                    <Route path="/superadmin-registration" element={<SuperadminRegistration />} />
                    <Route path="/WarehouseCard" element={<WarehouseCard />} />
                    {user ? (
                        <Route path="/superadmin" element={<Superadmin />} />
                    ) : (
                        <Route path="/superadmin" element={<SuperadminLogin />} />
                    )}
                    {/* Ensure ChatPage receives the location prop */}
                  

                </Routes>
            </div>
        </Router>
    );
}

export default App;

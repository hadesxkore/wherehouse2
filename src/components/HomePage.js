import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Update import to use useNavigate
import { auth, firestore } from '../firebase'; // Import Firebase authentication
import WarehouseCard from './WarehouseCard'; // Import WarehouseCard component
import logo from '../images/logo.png';
import locationIcon from '../images/location.png';
import searchIcon from '../images/search.png';
import clearIcon from '../images/broom.png';
import userIcon from '../images/userwhite.png';
import sampleImage from '../images/sample.jpg';
import locationTagIcon from '../images/location.png';
import priceTagIcon from '../images/price-tag.png';
import infoIcon from '../images/info.png';
import viewIcon from '../images/view.png';
import Autosuggest from 'react-autosuggest'; // Import Autosuggest component
import chatIcon from '../images/bubble-chat.png'; // Import chat icon
import dashboardIcon from '../images/dashboard.png';
import userProfileIcon from '../images/user.png';
import logoutIcon from '../images/logout1.png';
import { motion, AnimatePresence } from 'framer-motion';
import defaultProfileImage from '../images/default-profile-image.png';
import Dashboard from './Dashboard'; // Import the Dashboard component

// Import CSS file for animations
import './homepage.css';

// Function to fetch verified warehouses
const fetchVerifiedWarehouses = async (setVerifiedWarehouses) => {
    try {
        const warehousesRef = firestore.collection('warehouses').where('status', '==', 'verified');
        const snapshot = await warehousesRef.get();
        const verifiedWarehousesData = snapshot.docs.map(doc => doc.data());
        setVerifiedWarehouses(verifiedWarehousesData);
    } catch (error) {
        console.error('Error fetching verified warehouses:', error);
    }
};

function HomePage() {
    const navigate = useNavigate(); // Initialize useNavigate
    const [profileImage, setProfileImage] = useState(defaultProfileImage);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null); // Define state to store selected warehouse data
    const [suggestions, setSuggestions] = useState([]);
    const [value, setValue] = useState(''); // Define value state variable
    const [verifiedWarehouses, setVerifiedWarehouses] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false); // Define showConfirmation state variable

    // Effect to check if user is already logged in
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setIsLoggedIn(true);
                const userRef = firestore.collection('users').doc(user.uid);
                const userData = await userRef.get();
                if (userData.exists) {
                    const userDataObj = userData.data();
                    setProfileImage(userDataObj.profileImage || defaultProfileImage);
                }
            } else {
                setIsLoggedIn(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // Fetch verified warehouses on component mount
    useEffect(() => {
        fetchVerifiedWarehouses(setVerifiedWarehouses);
    }, []);

    const handleLogout = () => {
        setShowConfirmation(false);
        auth.signOut()
            .then(() => {
                setIsLoggedIn(false);
                setIsDropdownOpen(false);
            })
            .catch(error => {
                console.error('Error signing out:', error);
            });
    };

    // Function to toggle dropdown menu
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    
    const getSuggestions = async (value) => {
        try {
            const warehousesRef = firestore.collection('warehouses').where('address', '>=', value).where('address', '<=', value + '\uf8ff');

            const snapshot = await warehousesRef.get();
            const addressData = snapshot.docs.map(doc => doc.data().address);
            return addressData;
        } catch (error) {
            console.error('Error fetching address suggestions:', error);
            return [];
        }
    };

    const onSuggestionSelected = async (event, { suggestionValue }) => {
        try {
            const warehouseRef = firestore.collection('warehouses').where('address', '==', suggestionValue).where('status', '==', 'verified');
            const snapshot = await warehouseRef.get();
            if (!snapshot.empty) {
                const warehouseData = snapshot.docs.map(doc => doc.data());
                setSelectedWarehouse(warehouseData);
            }
        } catch (error) {
            console.error('Error fetching warehouse data:', error);
        }
    };
    

    const getSuggestionValue = (suggestion) => suggestion;
    const renderSuggestion = (suggestion) => <div>{suggestion}</div>;
    const onChange = (event, { newValue }) => setValue(newValue);
    const onSuggestionsFetchRequested = async ({ value }) => {
        const suggestions = await getSuggestions(value);
        setSuggestions(suggestions);
    };
    const onSuggestionsClearRequested = () => setSuggestions([]);

    // Function to handle clearing the search input
    const handleSearchClear = () => {
        setValue(''); // Clear the search input
        setSelectedWarehouse(null); // Reset selected warehouse to null
        fetchVerifiedWarehouses(setVerifiedWarehouses); // Refetch the verified warehouses
    };

    // Function to navigate to the chat page
    const handleChatClick = () => {
        navigate('/chat'); // Navigate to the chat page
    };

    return (
        <div style={{ backgroundColor: '#eeeeee', minHeight: '100vh' }}>
            <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 md:p-6" style={{ backgroundColor: '#eeeeee' }}>
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                        <img src={logo} alt="Logo" className="h-20" />
                        <div className="flex">
                            <Link to="/" className="text-lg font-semibold hover:text-gray-300 transition duration-300">Home</Link>
                            <Link to="/products" className="text-lg font-semibold hover:text-gray-300 transition duration-300 ml-4">Company</Link>
                            <Link to="/about" className="text-lg font-semibold hover:text-gray-300 transition duration-300 ml-4">About Us</Link>
                        </div>
                        <div className="relative">
                        <Autosuggest
                            suggestions={suggestions}
                            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                            onSuggestionsClearRequested={onSuggestionsClearRequested}
                            getSuggestionValue={getSuggestionValue}
                            renderSuggestion={renderSuggestion}
                            onSuggestionSelected={onSuggestionSelected}
                            inputProps={{
                                placeholder: 'Search for a location',
                                value,
                                onChange,
                                className: 'pl-8 pr-10 py-2 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 text-white focus:outline-none focus:bg-gray-800',
                            }}
                        />
                            <img src={locationIcon} alt="Location" className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4" />
                            {value && (
                                <img src={clearIcon} alt="Clear" className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 cursor-pointer" onClick={handleSearchClear} />
                            )}
                            {!value && (
                                <img src={searchIcon} alt="Search" className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 cursor-pointer" />
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-6 pt-2" >
                        {!isLoggedIn ? (
                            <>
                                <Link to="/signup" className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white px-4 py-2 rounded-lg hover:text-gray-300 transition duration-300">Sign Up</Link>
                                <Link to="/login" className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white px-4 py-2 rounded-lg hover:text-gray-300 transition duration-300">Log In</Link>
                            </>
                        ) : (
                            <div className="relative">
                                <motion.img
                                    src={profileImage}
                                    alt="User"
                                    className="h-12 w-12 cursor-pointer rounded-full"
                                    onClick={toggleDropdown}
                                    whileHover={{ scale: 1.1 }}
                                />
                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            className={`absolute transform -translate-x-1/2 top-12 mr-5 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden dropdown-menu`}
                                            style={{ right: '-200%', zIndex: '999' }}
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Link to="/profile" className="block px-4 py-2 flex items-center hover:bg-gray-200 transition duration-300 text-black">
                                                <img src={userProfileIcon} alt="Profile" className="h-6 mr-2 text-black" />
                                                Profile
                                            </Link>
                                            <Link to="/dashboard" className="block px-4 py-2 flex items-center hover:bg-gray-200 transition duration-300 text-black">
                                                <img src={dashboardIcon} alt="Dashboard" className="h-6 mr-2 text-black" />
                                                Dashboard
                                            </Link>
                                            <div className="border-t border-gray-300"></div>
                                            <button className="block w-full text-left px-4 py-2 flex items-center hover:bg-gray-200 transition duration-300 text-black" onClick={() => setShowConfirmation(true)}>
                                                <img src={logoutIcon} alt="Logout" className="h-6 mr-2 text-black" />
                                                Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                        <img src={chatIcon} alt="Chat" className="h-12 w-12 cursor-pointer rounded-full" onClick={handleChatClick} />
                    </div>
                </div>
            </nav>
       {/* Display selected warehouse data */}
       {selectedWarehouse ? (
                <div className="container mx-auto px-8 py-10 rounded-lg mt-8">
                    {selectedWarehouse.map(warehouse => (
                        <WarehouseCard key={warehouse.id} warehouse={warehouse} />
                    ))}
                </div>
            ) : null}

            {/* Display Verified Warehouses */}
            {!selectedWarehouse && verifiedWarehouses.length > 0 && (
                <div className="container mx-auto px-8 py-10 rounded-lg mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {verifiedWarehouses.map(warehouse => (
                            <WarehouseCard key={warehouse.id} warehouse={warehouse} />
                        ))}
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmation && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="bg-white p-6 rounded-lg shadow-lg text-center"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.5 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p className="text-lg font-semibold mb-4">Are you sure you want to log out?</p>
                        <div className="flex justify-center">
                            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg mr-4 hover:bg-red-500 transition duration-300">Yes, Logout</button>
                            <button onClick={() => setShowConfirmation(false)} className="bg-gray-400 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-300">Cancel</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}

export default HomePage;

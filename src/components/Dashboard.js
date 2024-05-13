import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, firestore, storage } from '../firebase'; // Assuming you have Firebase storage
import logo from '../images/logo.png';
import locationIcon from '../images/location.png';
import searchIcon from '../images/search.png';
import userIcon from '../images/userwhite.png';
import sampleImage from '../images/sample.jpg';
import priceTagIcon from '../images/price-tag.png';
import infoIcon from '../images/info.png';
import viewIcon from '../images/view.png';
import chatIcon from '../images/chat.png';
import dashboardIcon from '../images/dashboard.png';
import uploadIcon from '../images/upload.png';
import warehouseIcon from '../images/warehouse.png';
import userProfileIcon from '../images/user.png';
import logoutIcon from '../images/logout1.png';
import defaultProfileImage from '../images/default-profile-image.png';

import './Dashboard.css';

function Dashboard() {
    // State variables
    const [userAddress, setUserAddress] = useState('');
    const [slideDirection, setSlideDirection] = useState(null);
    const [carouselImages, setCarouselImages] = useState([]);
    const [showCarousel, setShowCarousel] = useState(false);
    const [profileImage, setProfileImage] = useState(defaultProfileImage);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All'); // New state for filtering warehouses
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showMapPopUp, setShowMapPopUp] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [warehouseData, setWarehouseData] = useState({
        name: '',
        address: '',
        description: '',
        price: '',
        images: [],
        videos: [],
        status: 'pending', // Add status field
        uploadDate: null, // Add uploadDate field
    });
        const [uploading, setUploading] = useState(false);
        const [showUploadModal, setShowUploadModal] = useState(false);
        const [userWarehouses, setUserWarehouses] = useState([]);
        const [loadingWarehouses, setLoadingWarehouses] = useState(true);
        const [successMessage, setSuccessMessage] = useState('');

        // Function to handle warehouse data change
        const handleWarehouseDataChange = (e) => {
            const { name, value } = e.target;
            setWarehouseData({ ...warehouseData, [name]: value });
        };

        
        // Function to handle image upload
    const handleImageUpload = async (e) => {
        setUploading(true);
        const file = e.target.files[0];
        const storageRef = storage.ref();
        const fileRef = storageRef.child(file.name);
        await fileRef.put(file);
        const url = await fileRef.getDownloadURL();
        setWarehouseData({ ...warehouseData, images: [...warehouseData.images, url] });
        setUploading(false);
    };

        // Function to handle video upload
        const handleVideoUpload = async (e) => {
            setUploading(true);
            const file = e.target.files[0];
            const storageRef = storage.ref();
            const fileRef = storageRef.child(file.name);
            await fileRef.put(file);
            const url = await fileRef.getDownloadURL();
            setWarehouseData({ ...warehouseData, videos: [...warehouseData.videos, url] });
            setUploading(false);
        };

     // Function to toggle the display of the map pop-up
     const toggleMapPopUp = () => {
        setShowMapPopUp(!showMapPopUp);
    };
    const handleAddressChange = (e) => {
        setUserAddress(e.target.value);
    };

        
    // Function to handle warehouse submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Check if at least three images are uploaded
        if (warehouseData.images.length < 3) {
            alert('Please upload at least three images.');
            return;
        }
        // Save warehouse data to Firestore
        const user = auth.currentUser;
        if (user) {
            const userUid = user.uid;
            const warehousesRef = firestore.collection('warehouses');
            await warehousesRef.add({ ...warehouseData, userUid, uploadDate: new Date() }); // Save upload date
            console.log('Warehouse data added to Firestore:', warehouseData);
            setSuccessMessage('Warehouse data submitted successfully.');
        } else {
            console.error('User not logged in.');
        }
        // Clear warehouse data after submission
        setWarehouseData({
            name: '',
            address: '',
            description: '',
            price: '',
            images: [],
            videos: [],
            status: 'pending', // Reset status
            uploadDate: null, // Reset uploadDate
        });
        // Close upload modal
        setShowUploadModal(false);
    };


      // Function to fetch user's uploaded warehouses
      const fetchUserWarehouses = async () => {
        const user = auth.currentUser;
        if (user) {
            const userUid = user.uid;
            const warehousesRef = firestore.collection('warehouses');
            let query = warehousesRef.where('userUid', '==', userUid);
            // Filter warehouses based on status if it's not 'All'
            if (filterStatus !== 'All') {
                query = query.where('status', '==', filterStatus.toLowerCase());
            }
            const snapshot = await query.get();
            const userWarehousesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setUserWarehouses(userWarehousesData);
            setLoadingWarehouses(false);
        }
    };
         // Effect to check if user is already logged in and fetch user's warehouses
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setIsLoggedIn(true);
                const userRef = firestore.collection('users').doc(user.uid);
                const userData = await userRef.get();
                if (userData.exists) {
                    const userDataObj = userData.data();
                    setProfileImage(userDataObj.profileImage || defaultProfileImage);
                    fetchUserWarehouses();
                }
            } else {
                setIsLoggedIn(false);
            }
        });
        return () => unsubscribe();
    }, [filterStatus]); // Refetch warehouses when filter status changes []);
     // Function to handle filter change
     const handleFilterChange = (status) => {
        setFilterStatus(status);
    };
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

        const closeSuccessMessage = () => {
            setSuccessMessage('');
        };
        // Function to open carousel pop-up with selected images
        const openCarousel = (images) => {
            setCarouselImages(images);
            setSelectedImageIndex(0); // Reset to the first image when opening carousel
            setShowCarousel(true);
        };
        // Define state variables for selected image index
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Function to handle next image
    const handleNext = () => {
        setSelectedImageIndex((prevIndex) => {
            setSlideDirection('left');
            return (prevIndex + 1) % carouselImages.length;
        });
    };
    // Function to handle previous image
    const handlePrev = () => {
        setSelectedImageIndex((prevIndex) => {
            setSlideDirection('right');
            return (prevIndex - 1 + carouselImages.length) % carouselImages.length;
        });
    };
    // Function to close the carousel
    const handleClose = () => { // Define handleClose function
        setShowCarousel(false);
    };
// Function to handle deletion of warehouse data
const handleDeleteWarehouse = async (warehouse) => {
    // Confirm deletion
    if (window.confirm("Are you sure you want to delete this warehouse?")) {
        try {
            // Delete warehouse data from Firestore
            await firestore.collection("warehouses").doc(warehouse.id).delete();

            // Delete images associated with the warehouse from Firebase Storage
            for (const imageUrl of warehouse.images) {
                const imageRef = storage.refFromURL(imageUrl);
                await imageRef.delete();
            }

            // Delete videos associated with the warehouse from Firebase Storage
            for (const videoUrl of warehouse.videos) {
                const videoRef = storage.refFromURL(videoUrl);
                await videoRef.delete();
            }

            // Remove the deleted warehouse from the state
            setUserWarehouses((prevWarehouses) => prevWarehouses.filter((w) => w.id !== warehouse.id));

            // Show success message
            setSuccessMessage("Warehouse deleted successfully.");
        } catch (error) {
            console.error("Error deleting warehouse:", error);
            // Show error message
            alert("An error occurred while deleting the warehouse.");
        }
    }
};

        return (
            <div style={{ backgroundColor: '#eeeeee', minHeight: '100vh' }}>
                {/* Navigation Bar */}
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
                                <input type="text" placeholder="Search for a location" className="pl-8 pr-10 py-2 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 text-white focus:outline-none focus:bg-gray-800" />
                                <img src={locationIcon} alt="Location" className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4" />
                                <img src={searchIcon} alt="Search" className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 cursor-pointer" />
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
                        </div>
                    </div>
                </nav>
                {/* Upload Warehouse and View Uploaded Warehouses */}
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-center space-x-8">
                        {/* Upload Warehouse Card */}
        
                        <div className="max-w-md bg-white p-8 rounded-lg shadow-md text-center cursor-pointer transition duration-300 transform hover:scale-105" onClick={() => setShowUploadModal(true)}>
                            <div className="flex flex-col justify-center items-center"> {/* Using flexbox to center items */}
                                <img src={uploadIcon} alt="Upload Icon" className="h-6 mb-2" /> {/* Using uploadIcon as the source */}
                                <div className="text-lg font-semibold">Upload Warehouse</div>
                            </div>
                        </div>
        
                        {/* View Uploaded Warehouses Card */}
                        <div className="max-w-md bg-white p-8 rounded-lg shadow-md text-center cursor-pointer transition duration-300 transform hover:scale-105" onClick={fetchUserWarehouses}>
                            <div className="flex flex-col justify-center items-center"> {/* Using flexbox to center items */}
                                <img src={warehouseIcon} alt="Upload Icon" className="h-6 mb-2" /> {/* Using uploadIcon as the source */}
                                <div className="text-lg font-semibold">Uploaded Warehouse</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Warehouse Upload Modal */}
                {showUploadModal && (
                    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-75 z-50">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg shadow-md w-full md:max-w-lg">
                            <h2 className="text-2xl font-bold mb-4">Upload Warehouse Details</h2>
                            <form onSubmit={handleSubmit}>
                                {/* Form Inputs */}
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="mb-4">
                                        <label className="block text-lg font-medium mb-2" htmlFor="name">Warehouse Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={warehouseData.name}
                                            onChange={handleWarehouseDataChange}
                                            className="w-full border rounded-md p-3 focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-lg font-medium mb-2" htmlFor="address">Address</label>
                                        <input
                                            type="text"
                                            id="address"
                                            name="address"
                                            value={warehouseData.address}
                                            onChange={handleWarehouseDataChange}
                                            className="w-full border rounded-md p-3 focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-lg font-medium mb-2" htmlFor="description">Description</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={warehouseData.description}
                                            onChange={handleWarehouseDataChange}
                                            rows="4"
                                            className="w-full border rounded-md p-3 focus:outline-none focus:border-blue-500"
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-lg font-medium mb-2" htmlFor="price">Price</label>
                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            value={warehouseData.price}
                                            onChange={handleWarehouseDataChange}
                                            className="w-full border rounded-md p-3 focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-lg font-medium mb-2">Upload Images</label>
                                            <label htmlFor="image-upload" className="bg-blue-500 text-white font-semibold py-2 px-4 rounded cursor-pointer hover:bg-blue-600 transition duration-300">+</label>
                                        </div>
                                        <input id="image-upload" type="file" onChange={handleImageUpload} accept="image/*" className="hidden" />
                                        {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
                                    </div>
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-lg font-medium mb-2">Upload Videos</label>
                                            <label htmlFor="video-upload" className="bg-blue-500 text-white font-semibold py-2 px-4 rounded cursor-pointer hover:bg-blue-600 transition duration-300">+</label>
                                        </div>
                                        <input id="video-upload" type="file" onChange={handleVideoUpload} accept="video/*" className="hidden" />
                                        {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="button" className="bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition duration-300 mr-4" onClick={() => setShowUploadModal(false)}>Cancel</button>
                                    <button type="submit" className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition duration-300">Submit</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                 {/* Filter buttons */}
                 <div className="flex justify-center mt-4 space-x-2">
                 <button
                            onClick={() => handleFilterChange('All')}
                            className={`px-4 py-2 rounded-lg mr-2 ${
                                filterStatus === 'All' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => handleFilterChange('Pending')}
                            className={`px-4 py-2 rounded-lg mr-2 ${
                                filterStatus === 'Pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => handleFilterChange('Verified')}
                            className={`px-4 py-2 rounded-lg mr-2 ${
                                filterStatus === 'Verified' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            Verified
                        </button>
                        <button
                            onClick={() => handleFilterChange('Rejected')}
                            className={`px-4 py-2 rounded-lg mr-2 ${
                                filterStatus === 'Rejected' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            Rejected
                        </button>
                        </div>
                 
         

    {!loadingWarehouses && userWarehouses.length > 0 && (
        <div className="container mx-auto px-8 py-10 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Your Uploaded Warehouses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userWarehouses.map(warehouse => (
   <div key={warehouse.id} className="bg-white p-4 rounded-lg shadow-md relative">
   <div className="flex justify-between mb-2">
       <h3 className="text-lg font-semibold">{warehouse.name}</h3>
     
   </div>
   <p className="text-gray-600 mb-2">
       <img src={locationIcon} alt="Location Icon" className="inline-block h-4 mr-2" /> {/* Location Icon */}
       <span className="font-bold">Address:</span> {warehouse.address}
   </p>
   <p className="text-gray-600 mb-2">
       <img src={infoIcon} alt="Info Icon" className="inline-block h-4 mr-2" /> {/* Info Icon */}
       <span className="font-bold">Description:</span> {warehouse.description}
   </p>
   <p className="text-gray-600 mb-2">
       <img src={priceTagIcon} alt="Price Tag Icon" className="inline-block h-4 mr-2" /> {/* Price Tag Icon */}
       <span className="font-bold">Price:</span> ₱{warehouse.price}
   </p>

   <p>Status: 
                            {warehouse.status === 'pending' && <span className="status-text" style={{ color: 'orange' }}>Pending</span>}
                            {warehouse.status === 'verified' && <span className="status-text" style={{ color: 'green' }}>Verified</span>}
                            {warehouse.status === 'rejected' && <span className="status-text" style={{ color: 'red' }}>Rejected</span>}
                        </p>
   <div className="flex flex-wrap mt-2">
       {warehouse.images.map((imageUrl, index) => (
           <img key={index} src={imageUrl} alt={`Image ${index + 1}`} className="h-16 w-16 object-cover rounded-md mr-2 mb-2" />
       ))}
   </div>
   <div className="flex flex-wrap mt-2">
       {warehouse.videos.map((videoUrl, index) => (
           <video key={index} src={videoUrl} controls className="h-16 w-16 rounded-md mr-2 mb-2"></video>
       ))}
   </div>
   <span className="font-bold">Upload Date:</span> {warehouse.uploadDate ? new Date(warehouse.uploadDate.toDate()).toLocaleString() : 'Unknown'}


              {/* Conditional rendering of the map pop-up */}
              {showMapPopUp && (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-75 z-50">
        <div className="bg-white p-8 rounded-lg shadow-md relative max-w-4xl w-full">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={toggleMapPopUp}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
            <div className="h-96">
                {/* Embedded map */}
                <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.6986951840404!2d120.5282207144382!3d14.67303299111157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33963fa50cbbad65%3A0xf8bc361a335afd80!2sLBC%20Bataan%20Delivery%20Hub!5e0!3m2!1sen!2sph!4v1715238912145!5m2!1sen!2sph`}
                    width="100%"
                    height="100%"
                    style={{ border: '0' }}
                    allowfullscreen=""
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
        </div>
    </div>
)}

                        <div className="flex justify-end mt-4">
                        <button className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition duration-300" onClick={() => openCarousel(warehouse.images)}>View</button>
                      {/* Button to toggle the display of the map pop-up */}
                      <button className="bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-600 transition duration-300 ml-2" onClick={toggleMapPopUp}>
                                    Map
                                </button>
                           
<button className="bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition duration-300 ml-2" onClick={() => handleDeleteWarehouse(warehouse)}>Delete</button>


                        </div>
                    </div>
                ))}
                
            </div>
        </div>
    )}

               {/* Success Message */}
{successMessage && (
  <div className="success-message">
    <p>{successMessage}</p>
    <button onClick={closeSuccessMessage} className="absolute top-0 right-0 mr-2 mt-2 text-white">&times;</button>
  </div>
)}

                {/* Logout Confirmation Modal */}
                {showConfirmation && (
                    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-75 z-50">
                        <div className="bg-white p-8 rounded-lg shadow-md w-full md:max-w-lg">
                            <h2 className="text-2xl font-bold mb-4">Are you sure you want to log out?</h2>
                            <div className="flex justify-end">
                                <button className="bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded hover:bg-gray-400 transition duration-300 mr-4" onClick={() => setShowConfirmation(false)}>Cancel</button>
                                <button className="bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition duration-300" onClick={handleLogout}>Logout</button>
                            </div>
                        </div>
                    </div>
                )}
                
                {showCarousel && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-75 z-50">
            <div className="bg-white p-8 rounded-lg shadow-md relative">
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={handleClose}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
                <div className="relative overflow-hidden rounded-lg" style={{ maxWidth: '100%', maxHeight: '80vh' }}>
                    <motion.img 
                        key={selectedImageIndex}
                        src={carouselImages[selectedImageIndex]}
                        alt={`Image ${selectedImageIndex + 1}`}
                        style={{ width: '100%', height: 'auto' }}
                        initial={{ opacity: 0, x: slideDirection === 'left' ? '100%' : '-100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: slideDirection === 'left' ? '-100%' : '100%' }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <button className="bg-gray-200 rounded-full p-2" onClick={handlePrev}>
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
        </button>
        <button className="bg-gray-200 rounded-full p-2 mx-4" onClick={handleNext}>
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
        </button>
    </div>
            </div>
        </div>
    )}


            </div>
        );
    }

    export default Dashboard;

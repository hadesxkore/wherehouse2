import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, firestore } from '../firebase'; // Assuming you have Firebase firestore
import notificationIcon from '../images/notification.png';
import './Superadmin.css'; // Import custom styles
import Navigation from './Navigation'; // Import Navigation component

function Superadmin() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [uploadedWarehouses, setUploadedWarehouses] = useState([]);
    const [filterStatus, setFilterStatus] = useState(''); // State variable for filtering status
    const [isLoading, setIsLoading] = useState(true); // State variable to track loading state

    // Function to toggle dropdown menu
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Function to fetch uploaded warehouses based on the selected filter status
    const fetchUploadedWarehouses = async () => {
        setIsLoading(true); // Set loading state to true
        try {
            const warehousesRef = firestore.collection('warehouses');
            let query = warehousesRef;
            if (filterStatus) {
                query = query.where('status', '==', filterStatus);
            }
            const snapshot = await query.get();
            const uploadedWarehousesData = snapshot.docs.map(async doc => {
                const warehouseData = doc.data();
                // Fetch user information associated with this warehouse
                const userRef = await firestore.collection('users').doc(warehouseData.userUid).get();
                const userData = userRef.data();
                return { id: doc.id, user: userData || {}, ...warehouseData }; // Make sure user data is not undefined
            });
            // Wait for all user information to be fetched
            const uploadedWarehousesWithUserData = await Promise.all(uploadedWarehousesData);
            setUploadedWarehouses(uploadedWarehousesWithUserData);
        } catch (error) {
            console.error('Error fetching uploaded warehouses:', error);
        } finally {
            setIsLoading(false); // Set loading state to false after fetching data
        }
    };

    // Function to handle verification of uploaded warehouses
    const handleVerification = async (warehouseId, status) => {
        try {
            // Update warehouse status in Firestore
            await firestore.collection('warehouses').doc(warehouseId).update({ status });
            // Fetch updated warehouses data
            fetchUploadedWarehouses();
            // Add your logic here if needed
        } catch (error) {
            console.error('Error updating warehouse status:', error);
        }
    };
    const confirmAction = (action) => {
        const confirmed = window.confirm('Are you sure you want to proceed?');
        if (confirmed) {
            action();
        }
    };
    

    // Fetch uploaded warehouses on component mount or when filterStatus changes
    useEffect(() => {
        fetchUploadedWarehouses();
    }, [filterStatus]);

    const handleDelete = async (warehouseId) => {
        try {
            const confirmed = window.confirm("Are you sure you want to delete this warehouse?");
            if (!confirmed) return; // If user cancels, do nothing
            
            console.log('Deleting warehouse with ID:', warehouseId);
            // Delete the warehouse document from Firestore
            await firestore.collection('warehouses').doc(warehouseId).delete();
            // Fetch updated warehouses data
            fetchUploadedWarehouses();
            // Remove "Deleted" option from the filter
            setFilterStatus('');
            // Add your logic here if needed
        } catch (error) {
            console.error('Error deleting warehouse:', error);
            alert('An error occurred while deleting the warehouse. Please try again later.');
        }
    };
    

    return (
        <div style={{ backgroundColor: '#eeeeee', minHeight: '100vh' }}>
           <Navigation /> {/* Include Navigation component here */}
            {/* Your Users page content here */}
     
               {/* Filter Buttons */}
               <div className="flex justify-center mt-4 space-x-2">
                {/* Filter buttons code */}
                <button onClick={() => setFilterStatus('')} className={`filter-btn ${filterStatus === '' && 'active'}`}>All</button>
                <button onClick={() => setFilterStatus('pending')} className={`filter-btn ${filterStatus === 'pending' && 'active'}`}>Pending</button>
                <button onClick={() => setFilterStatus('verified')} className={`filter-btn ${filterStatus === 'verified' && 'active'}`}>Verified</button>
                <button onClick={() => setFilterStatus('rejected')} className={`filter-btn ${filterStatus === 'rejected' && 'active'}`}>Rejected</button>
         
            </div>

            {/* Content Section */}
            <div className="superadmin-container">
                <div className="container mx-auto px-8 py-10 border border-gray-600 rounded-lg mt-8">
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : uploadedWarehouses.length === 0 ? (
                        <div className="no-warehouses-messa">
                            <p>No warehouses found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {uploadedWarehouses.map(warehouse => (
                                <div key={warehouse.id} className="uploaded-warehouse bg-white p-4 rounded-lg shadow-md relative">
                                    <div className="flex justify-between mb-2">
                                        <h3 className="text-lg font-semibold">{warehouse.name}</h3>
                                    </div>
                                    <p className="text-gray-600 mb-2">
                                        <span className="font-bold">Address:</span> {warehouse.address}
                                    </p>
                                    <p className="text-gray-600 mb-2">
                                        <span className="font-bold">Description:</span> {warehouse.description}
                                    </p>
                                    <p className="text-gray-600 mb-2">
                                        <span className="font-bold">Price:</span> ₱{warehouse.price}
                                    </p>
                                    <p className="text-gray-600 mb-2">
                                        <span className="font-bold">Uploader:</span> {warehouse.user ? `${warehouse.user.first_name} ${warehouse.user.last_name} (${warehouse.user.contact_number})` : 'Unknown'}
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
                                    <p className="text-gray-600 mt-2">
                                        <span className="font-bold">Upload Date:</span> {warehouse.uploadDate ? new Date(warehouse.uploadDate.toDate()).toLocaleString() : 'Unknown'}
                                    </p>
                                    <div className="verification-buttons mt-2 space-x-3">
                                    <button onClick={() => confirmAction(() => handleVerification(warehouse.id, 'verified'))} disabled={warehouse.status === 'verified'} className="bg-green-500 text-white font-semibold py-2 px-4 rounded-md mr-2">
                                            Confirm
                                        </button>
                                        <button onClick={() => confirmAction(() => handleVerification(warehouse.id, 'rejected'))} disabled={warehouse.status === 'rejected'} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-md">
                                            Reject
                                        </button>
                                        <button onClick={() => handleDelete(warehouse.id)} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-md">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Superadmin;

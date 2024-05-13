// WarehouseCard.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import { firestore } from '../firebase';

const WarehouseCard = ({ warehouse }) => {
    const [uploaderInfo, setUploaderInfo] = useState(null);
    const [truncatedDescription, setTruncatedDescription] = useState('');

    useEffect(() => {
        const fetchUploaderInfo = async () => {
            try {
                const userRef = await firestore.collection('users').doc(warehouse.userUid).get();
                if (userRef.exists) {
                    setUploaderInfo(userRef.data());
                } else {
                    console.log('User not found');
                }
            } catch (error) {
                console.error('Error fetching uploader info:', error);
            }
        };

        fetchUploaderInfo();
    }, [warehouse.userUid]);

    useEffect(() => {
        if (warehouse.description.length > 400) {
            setTruncatedDescription(warehouse.description.substring(0, 400) + '...');
        } else {
            setTruncatedDescription(warehouse.description);
        }
    }, [warehouse.description]);

    return (
        <div className="warehouse-card bg-white p-4 rounded-lg shadow-md relative">
            <div className="flex justify-between mb-2">
                <h3 className="text-lg font-semibold">{warehouse.name}</h3>
            </div>
            <div className="description-container">
                <p className="text-gray-600 mb-2 description">
                    <span className="font-bold">Address:</span> <span className="justify">{warehouse.address}</span>
                </p>
                <p className="text-gray-600 mb-2 description">
                    <span className="font-bold">Description:</span> <span className="justify">{truncatedDescription}</span>
                </p>
            </div>
            <p className="text-gray-600 mb-2">
                <span className="font-bold">Price:</span> ₱{warehouse.price}
            </p>
            <p className="text-gray-600 mb-2">
                <span className="font-bold">Uploader:</span> {uploaderInfo ? `${uploaderInfo.first_name} ${uploaderInfo.last_name} (${uploaderInfo.contact_number})` : 'Unknown'}
            </p>
            {uploaderInfo && uploaderInfo.profileImage && (
                <img src={uploaderInfo.profileImage} alt="Profile" className="h-12 w-12 rounded-full" />
            )}
            <div className="flex items-center mb-2">
                <span className={`font-bold uppercase text-sm ${warehouse.status === 'verified' ? 'text-green-500' : 'text-gray-600'}`}>{warehouse.status}</span>
            </div>
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
            <div className="flex justify-between mt-4 buttons">
                {/* Use Link component to navigate to the chat page with the uploader's ID */}
                <Link
                    to={{
                        pathname: `/chat/${warehouse.userUid}`,
                        state: { lessorId: warehouse.userUid } // Pass lessorId as state
                    }}
                    className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md mr-2"
                >
                    Contact
                </Link>
                <button className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-md">View</button>
            </div>
        </div>
    );
};

export default WarehouseCard;

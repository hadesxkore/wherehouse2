import React from 'react';

function CustomPopUp({ message, onCancel, onConfirm }) {
    return (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
            <div className="bg-white rounded-lg p-8 max-w-md">
                <p className="text-lg font-semibold mb-4 text-black">{message}</p>
                <div className="flex justify-center">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-400 text-white rounded-lg mr-4">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded-lg">Confirm</button>
                </div>
            </div>
            
        </div>
    );
}

export default CustomPopUp;

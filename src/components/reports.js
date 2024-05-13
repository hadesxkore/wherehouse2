import React from 'react';
import Navigation from './Navigation'; // Import Navigation component

function Reports() {
    return (
        <div style={{ backgroundColor: '#eeeeee', minHeight: '100vh' }}>
            <Navigation /> {/* Include Navigation component here */}
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-semibold mb-6">Generate Reports</h1>
                {/* Add your report generation tools and content here */}
            </div>
        </div>
    );
}

export default Reports;
    
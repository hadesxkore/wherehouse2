import React, { useEffect, useState, useRef } from 'react';
import Navigation from './Navigation'; // Import Navigation component
import { firestore } from '../firebase'; // Import Firestore
import Chart from 'chart.js/auto'; // Import Chart from Chart.js (auto version)
import { DateTime } from 'luxon'; // Import Luxon DateTime
import 'chartjs-adapter-luxon'; // Import Luxon date adapter for Chart.js

function Analytics() {
    const [userRegistrationsData, setUserRegistrationsData] = useState([]);
    const [warehouseStatusData, setWarehouseStatusData] = useState({ verified: 0, pending: 0, rejected: 0 });
    const userRegistrationsChartRef = useRef(null);
    const warehouseStatusChartRef = useRef(null);

    useEffect(() => {
        // Subscribe to user registration data changes in real-time
        const unsubscribeUserRegistrations = firestore.collection('users').onSnapshot(snapshot => {
            const userData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const userRegistrations = userData.reduce((acc, user) => {
                // Check if registrationDate exists before accessing toDate()
                if (user.registrationDate) {
                    const registrationDate = DateTime.fromJSDate(user.registrationDate.toDate()).toFormat('yyyy-MM-dd');
                    acc[registrationDate] = (acc[registrationDate] || 0) + 1;
                }
                return acc;
            }, {});
            setUserRegistrationsData(userRegistrations);
        }, error => {
            console.error('Error fetching user registrations data:', error);
        });
    
  
        // Subscribe to warehouse status data changes in real-time
        const unsubscribeWarehouseStatus = firestore.collection('warehouses').onSnapshot(snapshot => {
            const warehouseData = snapshot.docs.map(doc => doc.data());
            const statusCounts = warehouseData.reduce((acc, warehouse) => {
                acc[warehouse.status] = (acc[warehouse.status] || 0) + 1;
                return acc;
            }, {});
            setWarehouseStatusData(statusCounts);
        }, error => {
            console.error('Error fetching warehouse status data:', error);
        });
    
        return () => {
            // Unsubscribe from Firestore listeners when component unmounts
            unsubscribeUserRegistrations();
            unsubscribeWarehouseStatus();
        };
    }, []);
    
    useEffect(() => {
        // Render user registrations trend chart
        const ctxUserRegistrations = userRegistrationsChartRef.current;
        if (ctxUserRegistrations) {
            if (ctxUserRegistrations.chart) {
                ctxUserRegistrations.chart.destroy();
            }
    
            // Convert UTC dates to Philippines time zone (Asia/Manila)
            const today = DateTime.now().setZone('Asia/Manila').toFormat('yyyy-MM-dd');
            const labels = Object.keys(userRegistrationsData);
            if (!labels.includes(today)) {
                labels.push(today);
            }
    
            const datasets = [{
                label: 'User Registrations',
                data: labels.map(date => userRegistrationsData[date] || 0),
                fill: false,
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.1,
                pointRadius: 5,
                pointHoverRadius: 7
            }];
    
            // Render chart
            ctxUserRegistrations.chart = new Chart(ctxUserRegistrations, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day',
                                displayFormats: {
                                    day: 'MMM DD'
                                }
                            },
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Registrations'
                            }
                        }
                    },
                    elements: {
                        line: {
                            borderWidth: 3,
                            tension: 0.2,
                            borderJoinStyle: 'round'
                        }
                    }
                }
            });
        }
    }, [userRegistrationsData]);
    
    
    useEffect(() => {
        // Render warehouse status distribution chart
        const ctxWarehouseStatus = warehouseStatusChartRef.current;
        if (ctxWarehouseStatus) {
            if (ctxWarehouseStatus.chart) {
                ctxWarehouseStatus.chart.destroy();
            }
            ctxWarehouseStatus.chart = new Chart(ctxWarehouseStatus, {
                type: 'bar',
                data: {
                    labels: ['Verified', 'Pending', 'Rejected'],
                    datasets: [{
                        label: 'Warehouse Status',
                        data: [warehouseStatusData.verified, warehouseStatusData.pending, warehouseStatusData.rejected],
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(255, 99, 132, 0.2)'
                        ],
                        borderColor: [
                            'rgb(75, 192, 192)',
                            'rgb(255, 206, 86)',
                            'rgb(255, 99, 132)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }, [warehouseStatusData]);

    return (
        <div style={{ backgroundColor: '#eeeeee', minHeight: '100vh' }}>
            <Navigation /> {/* Include Navigation component here */}
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-semibold mb-6">Analytics</h1>
                <div className="mb-8">
                    <div className="card p-4 bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">User Registrations Trend</h2>
                        <canvas ref={userRegistrationsChartRef} width="800" height="400"></canvas>
                    </div>
                </div>
                <div>
                    <div className="card p-4 bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Warehouse Status Distribution</h2>
                        <canvas ref={warehouseStatusChartRef} width="400" height="200"></canvas>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;

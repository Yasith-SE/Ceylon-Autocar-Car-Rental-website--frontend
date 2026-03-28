import React from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiBriefcase, FiCompass, FiZap } from 'react-icons/fi';

const Category = () => {
    const navigate = useNavigate();

    const categories = [
        { id: 1, name: 'Luxury Sedans', icon: FiStar, desc: 'Premium comfort for executives and special events.', color: 'text-warning', bg: 'bg-warning bg-opacity-10' },
        { id: 2, name: 'Family SUVs', icon: FiBriefcase, desc: 'Spacious and safe for long family road trips.', color: 'text-primary', bg: 'bg-primary bg-opacity-10' },
        { id: 3, name: 'Off-Road 4x4', icon: FiCompass, desc: 'Rugged vehicles for exploring rough terrains.', color: 'text-success', bg: 'bg-success bg-opacity-10' },
        { id: 4, name: 'Electric & Hybrid', icon: FiZap, desc: 'Eco-friendly and cost-effective daily drivers.', color: 'text-info', bg: 'bg-info bg-opacity-10' },
    ];

    return (
        <div className="bg-light min-vh-100 pb-5">
            <Navbar />
            <div className="container" style={{ marginTop: '100px' }}>
                <div className="text-center mb-5">
                    <h2 className="fw-bold">Browse by Category</h2>
                    <p className="text-muted">Find the perfect vehicle for your specific needs.</p>
                </div>

                <div className="row g-4">
                    {categories.map((cat) => (
                        <div key={cat.id} className="col-md-6 col-lg-3">
                            <div 
                                className="card h-100 border-0 shadow-sm rounded-4 text-center p-4 hover-shadow"
                                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                                onClick={() => navigate('/available')} // Redirect to available cars for now
                            >
                                <div className={`d-inline-flex mx-auto align-items-center justify-content-center rounded-circle mb-3 ${cat.bg} ${cat.color}`} style={{ width: '80px', height: '80px' }}>
                                    <cat.icon size={35} />
                                </div>
                                <h5 className="fw-bold">{cat.name}</h5>
                                <p className="text-muted small m-0">{cat.desc}</p>
                                <button className="btn btn-outline-dark rounded-pill btn-sm mt-3 w-100">View Fleet</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Category;
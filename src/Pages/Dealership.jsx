import React from 'react';
import Navbar from '../components/Navbar';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const Dealership = () => {
    const locations = [
        { id: 1, city: 'Colombo', address: '123 Galle Road, Colombo 03', phone: '+94 11 234 5678', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop' },
        { id: 2, city: 'Kandy', address: '45 Peradeniya Road, Kandy', phone: '+94 81 234 5678', img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1964&auto=format&fit=crop' }
    ];

    return (
        <div className="bg-white min-vh-100 pb-5">
            <Navbar />
            <div className="container" style={{ marginTop: '100px' }}>
                <div className="text-center mb-5">
                    <h2 className="fw-bold text-danger">Our Dealership Locations</h2>
                    <p className="text-muted">Visit us at our premium showrooms across Sri Lanka.</p>
                </div>

                <div className="row g-5">
                    {locations.map((loc) => (
                        <div key={loc.id} className="col-md-6">
                            <div className="card border-0 shadow rounded-4 overflow-hidden h-100">
                                <img src={loc.img} alt={loc.city} className="card-img-top" style={{ height: '250px', objectFit: 'cover' }} />
                                <div className="card-body p-4 bg-light">
                                    <h4 className="fw-bold mb-3">{loc.city} Branch</h4>
                                    
                                    <div className="d-flex align-items-center gap-3 mb-2 text-muted">
                                        <FiMapPin className="text-danger" />
                                        <span>{loc.address}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-3 mb-2 text-muted">
                                        <FiPhone className="text-danger" />
                                        <span>{loc.phone}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-3 text-muted">
                                        <FiMail className="text-danger" />
                                        <span>contact@{loc.city.toLowerCase()}.ceylonauto.lk</span>
                                    </div>
                                    
                                    <button className="btn btn-danger rounded-pill w-100 mt-4 fw-bold">Get Directions</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dealership;
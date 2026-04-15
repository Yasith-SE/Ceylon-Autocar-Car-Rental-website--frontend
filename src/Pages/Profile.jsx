import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { FiUser, FiCamera, FiMail, FiMapPin, FiCalendar, FiShield, FiInfo } from 'react-icons/fi';

const Profile = () => {
    const { user, login } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        // Fetch fresh data from the database when the component loads
        if (user?.id) {
            fetch(`http://localhost:8081/api/auth/profile/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    setProfileData(data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching profile:", error);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [user]);

    // Handle the image upload to the Spring Boot backend
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);

        const formData = new FormData();
        formData.append('userId', user.id);
        formData.append('imageFile', file);

        try {
            const response = await fetch('http://localhost:8081/api/auth/update-profile-image', {
                method: 'POST',
                body: formData, // Browser automatically sets the correct multipart headers
            });

            if (response.ok) {
                const newImageUrl = await response.text();
                
                // Update local state and global context so the Navbar updates instantly
                setProfileData({ ...profileData, image: newImageUrl });
                login({ ...user, image: newImageUrl });
            } else {
                alert("Failed to upload image. Check backend console.");
            }
        } catch (error) {
            console.error("Upload Error:", error);
            alert("Error connecting to server.");
        } finally {
            setUploading(false);
        }
    };

    if (!user) return <div className="text-center mt-5">Please login to view profile.</div>;
    
    if (loading) return (
        <div className="bg-light min-vh-100">
            <Navbar />
            <div className="text-center mt-5 py-5">
                <div className="spinner-border text-secondary mt-5" role="status"></div>
            </div>
        </div>
    );

    const displayData = profileData || user;

    return (
        <div className="bg-light min-vh-100" style={{ paddingBottom: '50px' }}>
            <Navbar />
            
            {/* Centered, narrow container to mimic Telegram Web */}
            <div className="container d-flex justify-content-center" style={{ marginTop: '100px' }}>
                <div style={{ maxWidth: '420px', width: '100%' }}>
                    
                    {/* --- HEADER & AVATAR SECTION --- */}
                    <div className="d-flex flex-column align-items-center mb-4">
                        <div className="position-relative mb-3">
                            {/* Avatar */}
                            <div 
                                className="rounded-circle shadow-sm bg-white d-flex align-items-center justify-content-center overflow-hidden" 
                                style={{ width: '120px', height: '120px', border: '2px solid #fff' }}
                            >
                                {displayData.image ? (
                                    <img src={displayData.image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <FiUser size={50} className="text-secondary" />
                                )}
                            </div>

                            {/* Floating Camera Button */}
                            <label 
                                htmlFor="avatarUpload" 
                                className="position-absolute d-flex align-items-center justify-content-center bg-primary text-white rounded-circle shadow" 
                                style={{ width: '36px', height: '36px', bottom: '0', right: '0', cursor: 'pointer', border: '2px solid #fff' }}
                            >
                                {uploading ? (
                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                ) : (
                                    <FiCamera size={18} />
                                )}
                                <input type="file" id="avatarUpload" accept="image/*" className="d-none" onChange={handleImageUpload} disabled={uploading} />
                            </label>
                        </div>
                        
                        <h4 className="fw-bold m-0 text-dark">{displayData.name}</h4>
                        <span className="text-primary small fw-semibold">
                            {displayData.role === 'ADMIN' ? 'Administrator' : 'online'}
                        </span>
                    </div>

                    {/* --- INFORMATION LIST SECTION --- */}
                    <div className="bg-white rounded-4 shadow-sm overflow-hidden">
                        <div className="p-3 bg-light border-bottom text-primary fw-bold" style={{ fontSize: '0.9rem' }}>
                            Info
                        </div>

                        {/* Telegram-style rows */}
                        <div className="px-3">
                            <InfoRow icon={FiMail} value={displayData.email} label="Email" border={true} />
                            <InfoRow icon={FiCalendar} value={displayData.dateOfBirth || "Not provided"} label="Date of Birth" border={true} />
                            <InfoRow icon={FiMapPin} value={displayData.address || "Not provided"} label="Address" border={true} />
                            <InfoRow icon={FiShield} value={`${displayData.role} Access`} label="Account Type" border={false} />
                        </div>
                    </div>

                    {/* Action Button (Optional based on role) */}
                    {displayData.role === 'CUSTOMER' && (
                        <div className="bg-white rounded-4 shadow-sm mt-3 overflow-hidden">
                            <div className="p-3 d-flex align-items-center text-primary" style={{ cursor: 'pointer' }}>
                                <FiInfo size={22} className="me-3" />
                                <span className="fw-normal">View Rental History</span>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

// Reusable component for the Telegram-style data rows
const InfoRow = ({ icon: Icon, value, label, border }) => (
    <div className={`d-flex align-items-center py-3 ${border ? 'border-bottom' : ''}`}>
        <Icon size={24} className="text-secondary me-4" style={{ opacity: 0.7 }} />
        <div className="d-flex flex-column">
            <span className="fw-normal text-dark" style={{ fontSize: '1rem' }}>{value}</span>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>{label}</span>
        </div>
    </div>
);

export default Profile;
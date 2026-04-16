import { useEffect, useState } from 'react';
import useAuth from '../context/useAuth';
import Navbar from '../components/Navbar';
import { FiUser, FiCamera, FiMail, FiMapPin, FiCalendar, FiShield, FiInfo } from 'react-icons/fi';
import { authFetch } from '../utils/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await authFetch(`/auth/profile/${user.id}`);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || 'Could not load profile.');
        }

        setProfileData(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfileData(user);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) {
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('userId', user.id);
    formData.append('imageFile', file);

    try {
      const response = await authFetch('/auth/profile-image', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Profile image upload failed.');
      }

      const nextUser = data.user || {
        ...(profileData || user),
        image: data.imageUrl,
      };
      setProfileData(nextUser);
      updateUser(nextUser);
    } catch (error) {
      console.error('Upload Error:', error);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return <div className="text-center mt-5">Please login to view profile.</div>;
  }

  if (loading) {
    return (
      <div className="bg-light min-vh-100">
        <Navbar />
        <div className="text-center mt-5 py-5">
          <div className="spinner-border text-secondary mt-5" role="status"></div>
        </div>
      </div>
    );
  }

  const displayData = profileData || user;

  return (
    <div className="bg-light min-vh-100" style={{ paddingBottom: '50px' }}>
      <Navbar />

      <div className="container d-flex justify-content-center" style={{ marginTop: '100px' }}>
        <div style={{ maxWidth: '420px', width: '100%' }}>
          <div className="d-flex flex-column align-items-center mb-4">
            <div className="position-relative mb-3">
              <div
                className="rounded-circle shadow-sm bg-white d-flex align-items-center justify-content-center overflow-hidden"
                style={{ width: '120px', height: '120px', border: '2px solid #fff' }}
              >
                {displayData.image ? (
                  <img
                    src={displayData.image}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <FiUser size={50} className="text-secondary" />
                )}
              </div>

              <label
                htmlFor="avatarUpload"
                className="position-absolute d-flex align-items-center justify-content-center bg-primary text-white rounded-circle shadow"
                style={{
                  width: '36px',
                  height: '36px',
                  bottom: '0',
                  right: '0',
                  cursor: 'pointer',
                  border: '2px solid #fff',
                }}
              >
                {uploading ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  <FiCamera size={18} />
                )}
                <input
                  type="file"
                  id="avatarUpload"
                  accept="image/*"
                  className="d-none"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            <h4 className="fw-bold m-0 text-dark">{displayData.name}</h4>
            <span className="text-primary small fw-semibold">
              {displayData.role === 'ADMIN' ? 'Administrator' : 'Customer account'}
            </span>
          </div>

          <div className="bg-white rounded-4 shadow-sm overflow-hidden">
            <div className="p-3 bg-light border-bottom text-primary fw-bold" style={{ fontSize: '0.9rem' }}>
              Info
            </div>

            <div className="px-3">
              <InfoRow icon={FiMail} value={displayData.email} label="Email" border={true} />
              <InfoRow
                icon={FiCalendar}
                value={displayData.dateOfBirth || 'Not provided'}
                label="Date of Birth"
                border={true}
              />
              <InfoRow
                icon={FiMapPin}
                value={displayData.address || 'Not provided'}
                label="Address"
                border={true}
              />
              <InfoRow
                icon={FiShield}
                value={`${displayData.role} Access`}
                label="Account Type"
                border={false}
              />
            </div>
          </div>

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

const InfoRow = ({ icon, value, label, border }) => {
  const IconComponent = icon;

  return (
    <div className={`d-flex align-items-center py-3 ${border ? 'border-bottom' : ''}`}>
      <IconComponent size={24} className="text-secondary me-4" style={{ opacity: 0.7 }} />
      <div className="d-flex flex-column">
        <span className="fw-normal text-dark" style={{ fontSize: '1rem' }}>
          {value}
        </span>
        <span className="text-muted" style={{ fontSize: '0.85rem' }}>
          {label}
        </span>
      </div>
    </div>
  );
};

export default Profile;

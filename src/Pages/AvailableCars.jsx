import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { FiPlus, FiMapPin, FiCalendar } from 'react-icons/fi';

const AvailableCars = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- RENTAL MODAL STATE ---
  const [selectedCar, setSelectedCar] = useState(null);
  const [rentalData, setRentalData] = useState({ pickupLocation: '', dropoffLocation: '', startDate: '', endDate: '' });

  useEffect(() => {
    fetch('http://localhost:8080/api/availablecars')
      .then(response => response.json())
      .then(data => {
        setCars(data);
        setLoading(false);
      })
      .catch(error => setLoading(false));
  }, []);

  const handleRentClick = (car) => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'CUSTOMER') {
      setSelectedCar(car); // Open the modal for the customer
    } else {
      alert("Admins cannot rent cars. Please log in as a Customer.");
    }
  };

  const submitRental = async (e) => {
    e.preventDefault();
    // In the future, this will POST to your Spring Boot /api/rentals endpoint
    console.log("Booking Details:", { carId: selectedCar.id, userId: user.id, ...rentalData });
    alert(`Successfully requested the ${selectedCar.name}! Our team will contact you shortly.`);
    setSelectedCar(null); // Close Modal
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ marginTop: '100px' }}>
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold m-0">Available Cars</h2>
          {user?.role === 'ADMIN' && (
            <Link to="/admin/upload-car" className="btn btn-danger rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm fw-bold">
              <FiPlus size={20} /> Upload Car
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center mt-5 py-5"><div className="spinner-border text-danger"></div></div>
        ) : (
          <div className="row">
            {cars.map((car) => (
              <Card
                key={car.id}
                image={car.image}
                name={car.name}
                price={car.price}
                year={car.year}
                onRent={() => handleRentClick(car)} 
              />
            ))}
          </div>
        )}
      </div>

      {/* --- RENTAL MODAL (OVERLAY) --- */}
      {selectedCar && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-danger text-white rounded-top-4">
                <h5 className="modal-title fw-bold">Rent {selectedCar.name}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedCar(null)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="text-muted small mb-4">Complete the details below to secure your booking at <strong>${selectedCar.price}/day</strong>.</p>
                <form onSubmit={submitRental}>
                  
                  <div className="mb-3 d-flex align-items-center gap-2 border rounded px-3 py-2 bg-light">
                    <FiMapPin className="text-danger" />
                    <input type="text" className="form-control border-0 bg-transparent shadow-none" placeholder="Pick-up Location" required 
                      onChange={(e) => setRentalData({...rentalData, pickupLocation: e.target.value})} />
                  </div>

                  <div className="mb-3 d-flex align-items-center gap-2 border rounded px-3 py-2 bg-light">
                    <FiMapPin className="text-secondary" />
                    <input type="text" className="form-control border-0 bg-transparent shadow-none" placeholder="Drop-off Location" required 
                      onChange={(e) => setRentalData({...rentalData, dropoffLocation: e.target.value})} />
                  </div>

                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label small fw-bold"><FiCalendar /> Start Date</label>
                      <input type="date" className="form-control" required 
                        onChange={(e) => setRentalData({...rentalData, startDate: e.target.value})} />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label small fw-bold"><FiCalendar /> End Date</label>
                      <input type="date" className="form-control" required 
                        onChange={(e) => setRentalData({...rentalData, endDate: e.target.value})} />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-dark w-100 rounded-pill fw-bold py-2 mt-3">Confirm Booking Request</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AvailableCars;
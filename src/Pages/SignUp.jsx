import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useState } from 'react';

const SignUp = () => {
  const navigate = useNavigate();
  
  // 1. Create state to hold the form data
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    email: '',
    password: '',
    address: '',
    postalCode: ''
  });

  const [error, setError] = useState('');

  // 2. Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop page reload
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert("Registration successful! Please login.");
        navigate('/login'); // Send them to the login page
      } else {
        const errorText = await response.text();
        setError(errorText); // Show the error from Spring Boot (e.g., "Email already registered")
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    }
  };

  return (
    <div className="container-fluid bg-white min-vh-100 d-flex flex-column justify-content-center">
      <Navbar />
      {/* Top Logo */}
      <div className="text-center mb-4">
        <h2 className="fw-bold fs-2"><span style={{ color: '#e74c3c' }}>Ceylon</span> AutoCar</h2>
      </div>

      <div className="row align-items-center">
        {/* --- Left Image --- */}
        <div className="col-md-3 d-none d-md-block p-0">
          <div className="position-relative">
            <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop" alt="Woman in car" className="img-fluid w-100" style={{ height: '500px', objectFit: 'cover' }} />
          </div>
        </div>

        {/* --- Center Form --- */}
        <div className="col-12 col-md-6 px-5">
          <h3 className="fw-bold text-center mb-4">Register Here</h3>
          
          {/* Show error message if registration fails */}
          {error && <div className="alert alert-danger text-center py-2">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            {/* Notice the name attributes added to each input! */}
            <div className="mb-3">
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control rounded-pill px-3" placeholder="Name" required />
            </div>
            <div className="mb-3">
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="form-control rounded-pill px-3" required />
            </div>
            <div className="mb-3">
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control rounded-pill px-3" placeholder="Email" required />
            </div>
            <div className="mb-3">
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control rounded-pill px-3" placeholder="Password" required />
            </div>
            <div className="mb-3">
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-control rounded-pill px-3" placeholder="Address" required />
            </div>
            <div className="mb-3">
              <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className="form-control rounded-pill px-3" placeholder="Postal Code" required />
            </div>

            <div className="d-grid gap-2 col-6 mx-auto mt-4">
              <button className="btn btn-danger rounded-pill fw-bold" type="submit">Sign Up</button>
            </div>
          </form>
          
          <div className="text-center mt-3">
            <Link to="/login" className="small text-decoration-none text-muted">Already have an account? Login</Link>
          </div>
        </div>

        {/* --- Right Image --- */}
        <div className="col-md-3 d-none d-md-block p-0">
          <div className="position-relative">
            <img src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop" alt="Sports Car" className="img-fluid w-100" style={{ height: '500px', objectFit: 'cover' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Import context!

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth(); // Get the login function from context
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const userData = await response.json(); // Get the UserDto back
        login(userData); // Save user to global context
        navigate('/'); // Redirect to Home Page
      } else {
        const errorText = await response.text();
        setError(errorText || "Invalid credentials");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    }
  };

  return (
    <div className="container-fluid bg-white min-vh-100 d-flex flex-column justify-content-center">
      <Navbar />
      <div className="text-center mb-5">
        <h2 className="fw-bold fs-2"><span style={{ color: '#e74c3c' }}>Ceylon</span> AutoCar</h2>
      </div>

      <div className="row align-items-center">
        {/* --- Left Image --- */}
        <div className="col-md-3 d-none d-md-block p-0">
          <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop" alt="Woman in car" className="img-fluid w-100" style={{ height: '400px', objectFit: 'cover' }} />
        </div>

        {/* --- Center Form --- */}
        <div className="col-12 col-md-6 px-5">
          <h3 className="fw-bold text-center mb-5">Join Now</h3>
          
          {/* Show error message */}
          {error && <div className="alert alert-danger text-center py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control rounded-pill px-3 py-2" placeholder="Email" required />
            </div>
            <div className="mb-4">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control rounded-pill px-3 py-2" placeholder="Password" required />
            </div>

            <div className="d-grid gap-2 col-6 mx-auto mt-4">
              <button className="btn btn-danger rounded-pill fw-bold py-2" type="submit">Login</button>
            </div>
          </form>

          <div className="text-center mt-3">
             <Link to="/signup" className="small text-decoration-none text-muted">Create new account</Link>
          </div>
        </div>

        {/* --- Right Image --- */}
        <div className="col-md-3 d-none d-md-block p-0">
          <img src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop" alt="Sports Car" className="img-fluid w-100" style={{ height: '400px', objectFit: 'cover' }} />
        </div>
      </div>
    </div>
  );
};

export default Login;
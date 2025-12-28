
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const SignUp = () => {
  return (
    

    <div className="container-fluid bg-white min-vh-100 d-flex flex-column justify-content-center">
        <Navbar />
      {/* Top Logo */}
      <div className="text-center mb-4">
        <h2 className="fw-bold fs-2">
          <span style={{ color: '#e74c3c' }}>Ceylon</span> AutoCar
        </h2>
      </div>

      <div className="row align-items-center">
        
        {/* --- Left Image --- */}
        <div className="col-md-3 d-none d-md-block p-0">
          <div className="position-relative">
            <img 
              src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop" 
              alt="Woman in car" 
              className="img-fluid w-100"
              style={{ height: '500px', objectFit: 'cover' }}
            />
            <div className="position-absolute bottom-0 start-0 p-3">
              <h5 className="fw-bold text-white text-shadow">Ceylon AutoCar</h5>
            </div>
          </div>
        </div>

        {/* --- Center Form --- */}
        <div className="col-12 col-md-6 px-5">
          <h3 className="fw-bold text-center mb-4">Register Here</h3>
          
          <form>
            <div className="mb-3">
              <input type="text" className="form-control rounded-pill px-3" placeholder="Name" />
            </div>
            
            <div className="mb-3">
              <input type="date" className="form-control rounded-pill px-3" placeholder="Birthday" />
            </div>

            <div className="mb-3">
              <input type="email" className="form-control rounded-pill px-3" placeholder="Email" />
            </div>

            <div className="mb-3">
              <input type="password" className="form-control rounded-pill px-3" placeholder="Password" />
            </div>

            <div className="mb-3">
              <input type="text" className="form-control rounded-pill px-3" placeholder="Address" />
            </div>

            <div className="mb-3">
              <input type="text" className="form-control rounded-pill px-3" placeholder="Postal Code" />
            </div>

            <div className="form-check mb-4 d-flex justify-content-center gap-2">
              <input className="form-check-input" type="checkbox" id="rememberMe" />
              <label className="form-check-label small" htmlFor="rememberMe">Remember me</label>
            </div>

            <div className="d-grid gap-2 col-6 mx-auto">
              <button className="btn btn-danger rounded-pill fw-bold" type="submit">
                Sign Up
              </button>
            </div>
          </form>
          
          <div className="text-center mt-3">
            <Link to="/login" className="small text-decoration-none text-muted">Already have an account? Login</Link>
          </div>
        </div>

        {/* --- Right Image --- */}
        <div className="col-md-3 d-none d-md-block p-0">
          <div className="position-relative">
            <img 
              src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop" 
              alt="Sports Car" 
              className="img-fluid w-100"
              style={{ height: '500px', objectFit: 'cover' }}
            />
            <div className="position-absolute top-0 end-0 p-3">
              <h5 className="fw-bold text-danger bg-white px-2 rounded">Ceylon AutoCar</h5>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Logo */}
      <div className="text-center mt-5">
        <h4 className="fw-bold fs-4">
          <span style={{ color: '#fd1900ff' }}>Ceylon</span> AutoCar
        </h4>
      </div>

    </div>
  );
};

export default SignUp;
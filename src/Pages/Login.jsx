
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Login = () => {
  return (
    
    <div className="container-fluid bg-white min-vh-100 d-flex flex-column justify-content-center">
      <Navbar />
      {/* Top Logo */}
      <div className="text-center mb-5">
        <h2 className="fw-bold fs-2">
          <span style={{ color: '#e74c3c' }}>Ceylon</span> AutoCar
        </h2>
      </div>

      <div className="row align-items-center">
        
        {/* --- Left Image --- */}
        <div className="col-md-3 d-none d-md-block p-0">
          <img 
            src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop" 
            alt="Woman in car" 
            className="img-fluid w-100"
            style={{ height: '400px', objectFit: 'cover' }}
          />
        </div>

        {/* --- Center Form --- */}
        <div className="col-12 col-md-6 px-5">
          <h3 className="fw-bold text-center mb-5">Join Now</h3>
          
          <form>
            <div className="mb-4">
              <input type="email" className="form-control rounded-pill px-3 py-2" placeholder="Email" />
            </div>

            <div className="mb-4">
              <input type="password" className="form-control rounded-pill px-3 py-2" placeholder="Password" />
            </div>

            <div className="form-check mb-4 d-flex justify-content-center gap-2">
              <input className="form-check-input" type="checkbox" id="rememberMeLogin" />
              <label className="form-check-label small" htmlFor="rememberMeLogin">Remember me</label>
            </div>

            <div className="d-grid gap-2 col-6 mx-auto">
              <button className="btn btn-danger rounded-pill fw-bold py-2" type="submit">
                Login
              </button>
            </div>
          </form>

          <div className="text-center mt-3">
             <Link to="/signup" className="small text-decoration-none text-muted">Create new account</Link>
          </div>
        </div>

        {/* --- Right Image --- */}
        <div className="col-md-3 d-none d-md-block p-0">
          <img 
            src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop" 
            alt="Sports Car" 
            className="img-fluid w-100"
            style={{ height: '400px', objectFit: 'cover' }}
          />
        </div>

      </div>

      {/* Bottom Logo */}
      <div className="text-center mt-5">
        <h4 className="fw-bold fs-4">
          <span style={{ color: '#fb1a02ff' }}>Ceylon</span> AutoCar
        </h4>
      </div>

    </div>
  );
};

export default Login;
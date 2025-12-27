import { FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";

const Navbar = () => {
   return (
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 py-3 fixed-top">
         <div className="container-fluid">
            <Link className="navbar-brand fw-bold fs-3" to="/">
               <span style={{ color: '#e74c3c' }}>Ceylon</span> AutoCar
            </Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
               <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
               <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-4 fw-medium">
                  <li className="nav-item">
                     
                     <Link className="nav-link" to="/">Home</Link>
                  </li>
                  <li className="nav-item">
                     <Link className="nav-link" to="/available">Available car</Link>
                  </li>
                  <li className="nav-item">
                     <Link className="nav-link" to="/category">Category</Link>
                  </li>
                  <li className="nav-item">
                     <Link className="nav-link" to="/dealership">Dealership</Link>
                  </li>
               </ul>

               <div className="d-flex align-items-center gap-4">
                  <FiSearch className="fs-5 text-dark" style={{ cursor: 'pointer' }} />
                  <button className="btn btn-success rounded-pill px-4 py-2 fw-semibold">
                     Call send us message
                  </button>
               </div>
            </div>
         </div>
      </nav>


   );



}
export default Navbar
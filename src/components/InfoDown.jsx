import { Link } from 'react-router-dom';

const InfoDown = () => {

  return (
    <div className="container py-5">
      <div className="row align-items-center">
        
        {/* --- Left Side: Image with Badge --- */}
        <div className="col-lg-7 position-relative mb-4 mb-lg-0">
          <div className="position-relative">
            <img 
              src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070&auto=format&fit=crop" 
              alt="Cars on track" 
              className="img-fluid rounded shadow-sm w-100"
            />
            
            {/* Red "Book your car Now" button */}
            <div className="position-absolute top-50 start-50 translate-middle">
                <Link to="/login" className='btn btn-danger rounded-pill px-4 py-2 fw-bold shadow'>
                    Book Your Car Now
                </Link>
            </div>
          </div>
        </div>

        {/* --- Right Side: Text & Buttons --- */}
        <div className="col-lg-5 ps-lg-5">
          <h3 className="fw-bold mb-4">
            Before you rent a car from our website:
          </h3>
          
          <ul className="list-unstyled text-secondary mb-4" style={{ lineHeight: '1.8' }}>
            <li className="mb-2">
              • You must select exactly what you need and select the category.
            </li>
            <li className="mb-2">
              • Most important is your license and your National ID.
            </li>
            <li className="mb-2">
              • Select your best car; we will fill your car tank for the first travel.
            </li>
            <li className="mb-2">
              • Everything must be completed in the first form; age limit should be 18+.
            </li>
          </ul>

          {/* Action Buttons */}
          <div className="d-flex flex-column gap-3 align-items-start">
            <Link to="/service" className="btn btn-success rounded-pill px-5 fw-bold">
              View our service &gt;
            </Link>
            
            <Link to="/signup" className="btn btn-danger rounded-pill px-5 fw-bold">
              Customer access
            </Link>
            
            <Link to="/login" className="btn btn-outline-danger rounded-pill px-5 fw-bold">
              Login
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default InfoDown;

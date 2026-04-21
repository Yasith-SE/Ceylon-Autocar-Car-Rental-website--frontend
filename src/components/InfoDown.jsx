import { Link } from 'react-router-dom';

const INFO_ITEMS = [
  'Select the vehicle category that best matches your trip.',
  'Keep your driving license and NIC ready before sending your request.',
  'Review real car images and choose the vehicle that fits your plan.',
  'Complete the request form carefully. Drivers should be 18 or above.',
];

const InfoDown = () => {
  return (
    <div className="container py-5">
      <div className="row align-items-center">
        <div className="col-lg-7 position-relative mb-4 mb-lg-0">
          <div className="position-relative">
            <img
              src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070&auto=format&fit=crop"
              alt="Cars on track"
              className="img-fluid rounded shadow-sm w-100"
            />

            <div className="position-absolute top-50 start-50 translate-middle">
              <Link to="/login" className="btn btn-danger rounded-pill px-4 py-2 fw-bold shadow">
                Book Your Car Now
              </Link>
            </div>
          </div>
        </div>

        <div className="col-lg-5 ps-lg-5">
          <h3 className="fw-bold mb-4">Before you rent a car from our website:</h3>

          <ul className="list-unstyled text-secondary mb-4" style={{ lineHeight: '1.8' }}>
            {INFO_ITEMS.map((item) => (
              <li key={item} className="mb-2">
                {item}
              </li>
            ))}
          </ul>

          <div className="d-flex flex-column gap-3 align-items-start">
            <Link to="/service" className="btn btn-success rounded-pill px-5 fw-bold">
              View our service &gt;
            </Link>

            <Link to="/login" className="btn btn-danger rounded-pill px-5 fw-bold">
              Request account
            </Link>

            <Link to="/login" className="btn btn-outline-danger rounded-pill px-5 fw-bold">
              Manager login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoDown;

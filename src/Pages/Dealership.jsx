import React from 'react';
import {
  FiCalendar,
  FiClock,
  FiHeadphones,
  FiMail,
  FiMapPin,
  FiPhone,
  FiStar,
  FiTool,
} from 'react-icons/fi';
import Navbar from '../components/Navbar';

const branches = [
  {
    id: 1,
    city: 'Colombo Flagship',
    address: '123 Galle Road, Colombo 03',
    phone: '+94 11 234 5678',
    email: 'colombo@ceylonautocar.lk',
    hours: 'Open daily, 8:00 AM - 8:00 PM',
    img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=2070&auto=format&fit=crop',
    map: 'https://maps.google.com/?q=123+Galle+Road+Colombo+03',
  },
  {
    id: 2,
    city: 'Kandy Experience Hub',
    address: '45 Peradeniya Road, Kandy',
    phone: '+94 81 234 5678',
    email: 'kandy@ceylonautocar.lk',
    hours: 'Mon - Sat, 8:30 AM - 7:00 PM',
    img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop',
    map: 'https://maps.google.com/?q=45+Peradeniya+Road+Kandy',
  },
  {
    id: 3,
    city: 'Southern Delivery Lounge',
    address: '88 Matara Road, Galle',
    phone: '+94 91 234 5678',
    email: 'galle@ceylonautocar.lk',
    hours: 'Daily, 9:00 AM - 6:00 PM',
    img: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?q=80&w=2070&auto=format&fit=crop',
    map: 'https://maps.google.com/?q=88+Matara+Road+Galle',
  },
];

const services = [
  {
    title: 'Test-drive style showroom visits',
    description: 'Walk through current stock, finishes, and premium rental options with a specialist.',
    icon: FiStar,
  },
  {
    title: 'Booking and handover support',
    description: 'Get pickup planning, driver verification, and contract help from the dealership team.',
    icon: FiCalendar,
  },
  {
    title: 'After-rental support desk',
    description: 'Rapid issue resolution, roadside coordination, and flexible return assistance.',
    icon: FiHeadphones,
  },
  {
    title: 'Detailing and inspection bay',
    description: 'Every vehicle gets final detailing and a quality pass before delivery or pickup.',
    icon: FiTool,
  },
];

const Dealership = () => {
  return (
    <div
      className="min-vh-100 pb-5"
      style={{
        background:
          'linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(241,245,249,1) 100%)',
      }}
    >
      <Navbar />

      <div className="container" style={{ marginTop: '118px' }}>
        <div className="card border-0 shadow-sm rounded-5 overflow-hidden mb-5">
          <div className="row g-0">
            <div className="col-lg-6">
              <div className="p-4 p-lg-5 h-100 d-flex flex-column justify-content-center">
                <p className="text-uppercase small fw-bold text-danger mb-2">Dealership Network</p>
                <h1 className="fw-bold mb-3">Showroom visits, delivery coordination, and premium support.</h1>
                <p className="text-muted mb-4">
                  Ceylon AutoCar combines a digital fleet with physical branches where customers can
                  inspect cars, verify bookings, and arrange premium handovers.
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <a href="tel:+94112345678" className="btn btn-dark rounded-pill px-4 fw-semibold">
                    Call Concierge
                  </a>
                  <a
                    href="mailto:hello@ceylonautocar.lk"
                    className="btn btn-outline-dark rounded-pill px-4 fw-semibold"
                  >
                    Email Dealership
                  </a>
                </div>
              </div>
            </div>

            <div
              className="col-lg-6"
              style={{
                minHeight: '360px',
                background:
                  'linear-gradient(180deg, rgba(15,23,42,0.1), rgba(15,23,42,0.15)), url(https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop) center/cover',
              }}
            ></div>
          </div>
        </div>

        <div className="row g-4 mb-5">
          {services.map((service) => (
            <div key={service.title} className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm rounded-5 h-100">
                <div className="card-body p-4">
                  <div className="rounded-circle bg-danger bg-opacity-10 text-danger d-inline-flex p-3 mb-3">
                    <service.icon size={24} />
                  </div>
                  <h5 className="fw-bold mb-2">{service.title}</h5>
                  <p className="text-muted small mb-0">{service.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4">
          {branches.map((branch) => (
            <div key={branch.id} className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-5 overflow-hidden h-100">
                <img
                  src={branch.img}
                  alt={branch.city}
                  className="card-img-top"
                  style={{ height: '240px', objectFit: 'cover' }}
                />

                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div>
                      <p className="text-uppercase small fw-bold text-danger mb-1">Branch</p>
                      <h4 className="fw-bold mb-0">{branch.city}</h4>
                    </div>
                    <span className="badge rounded-pill text-bg-light border px-3 py-2">
                      Premium Support
                    </span>
                  </div>

                  <div className="d-grid gap-3 text-muted mb-4">
                    <div className="d-flex gap-3">
                      <FiMapPin className="text-danger mt-1" />
                      <span>{branch.address}</span>
                    </div>
                    <div className="d-flex gap-3">
                      <FiPhone className="text-danger mt-1" />
                      <span>{branch.phone}</span>
                    </div>
                    <div className="d-flex gap-3">
                      <FiMail className="text-danger mt-1" />
                      <span>{branch.email}</span>
                    </div>
                    <div className="d-flex gap-3">
                      <FiClock className="text-danger mt-1" />
                      <span>{branch.hours}</span>
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-auto">
                    <a
                      href={branch.map}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-dark rounded-pill w-100 fw-semibold"
                    >
                      Get Directions
                    </a>
                    <a
                      href={`tel:${branch.phone.replace(/\s+/g, '')}`}
                      className="btn btn-outline-dark rounded-pill w-100 fw-semibold"
                    >
                      Call Branch
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dealership;

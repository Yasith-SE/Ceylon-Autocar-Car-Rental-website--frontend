import { Link } from 'react-router-dom';
import {
  FiBriefcase,
  FiCalendar,
  FiCompass,
  FiHeadphones,
  FiMapPin,
  FiShield,
} from 'react-icons/fi';
import Navbar from '../components/Navbar';

const SERVICE_ITEMS = [
  {
    title: 'Airport Transfers',
    icon: FiMapPin,
    description:
      'Reliable airport pickup and drop-off service with clean vehicles and timely support.',
  },
  {
    title: 'Wedding Car Hire',
    icon: FiCalendar,
    description:
      'Premium vehicles for weddings and special occasions with polished presentation.',
  },
  {
    title: 'Business Travel',
    icon: FiBriefcase,
    description:
      'Comfortable executive transport for meetings, office trips, and professional visits.',
  },
  {
    title: 'Tour And Long Trip Rentals',
    icon: FiCompass,
    description:
      'Flexible rental support for family trips, city-to-city travel, and holiday journeys.',
  },
  {
    title: 'Verified Vehicle Access',
    icon: FiShield,
    description:
      'Real photos, request review, and approval handling help keep bookings clear and safe.',
  },
  {
    title: 'Customer Support',
    icon: FiHeadphones,
    description:
      'Our team helps review requests, confirm availability, and guide customers through booking.',
  },
];

const Service = () => {
  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container" style={{ paddingTop: '140px', paddingBottom: '56px' }}>
        <div className="row g-4 align-items-stretch mb-5">
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-5 h-100">
              <div className="card-body p-4 p-lg-5">
                <p className="text-uppercase small fw-bold text-danger mb-2">Our Services</p>
                <h1 className="fw-bold mb-3">Rental help designed for events, travel, and comfort.</h1>
                <p className="text-muted fs-5 mb-4">
                  Ceylon AutoCar supports airport rides, special occasions, business travel, and
                  customer booking guidance from request to approval.
                </p>

                <div
                  className="rounded-5 p-4 text-white"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(239,68,68,0.86))',
                  }}
                >
                  <div className="fw-semibold mb-2">Simple customer flow</div>
                  <div className="small text-white-50">
                    Browse the cars, review real images, submit your request, and wait for manager
                    approval before the booking is finalized.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div
              className="rounded-5 h-100 overflow-hidden"
              style={{
                minHeight: '360px',
                background:
                  'linear-gradient(180deg, rgba(15,23,42,0.12), rgba(15,23,42,0.3)), url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2080&auto=format&fit=crop) center/cover',
              }}
            />
          </div>
        </div>

        <div className="row g-4 mb-5">
          {SERVICE_ITEMS.map((serviceItem) => {
            const Icon = serviceItem.icon;

            return (
              <div key={serviceItem.title} className="col-md-6 col-xl-4">
                <div className="card border-0 shadow-sm rounded-5 h-100">
                  <div className="card-body p-4">
                    <div
                      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{
                        width: '52px',
                        height: '52px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        color: '#ef4444',
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <h4 className="fw-bold mb-2">{serviceItem.title}</h4>
                    <p className="text-muted mb-0">{serviceItem.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card border-0 shadow-sm rounded-5">
          <div className="card-body p-4 p-lg-5 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            <div>
              <h3 className="fw-bold mb-2">Need a car for your next trip?</h3>
              <p className="text-muted mb-0">
                Explore the fleet, compare real images, and send your request in a few steps.
              </p>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <Link to="/available" className="btn btn-dark rounded-pill px-4 fw-bold">
                Browse Cars
              </Link>
              <Link to="/login" className="btn btn-outline-danger rounded-pill px-4 fw-bold">
                Request Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Service;

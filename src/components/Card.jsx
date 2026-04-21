import { Link } from 'react-router-dom';
import { FiBox, FiCalendar, FiCamera, FiLayers, FiZap } from 'react-icons/fi';

const Card = ({
  car,
  onRent,
  onShowPhotos,
  canRent,
  bookingStatusLabel = canRent ? 'Staff-assisted booking' : 'Customer login required',
  rentButtonLabel = canRent ? 'Request Rental' : 'Login as Customer',
}) => {
  const realPhotoCount = [...new Set([car.image, ...(car.galleryImages || [])].filter(Boolean))]
    .length;

  return (
    <div className="col-12 col-md-6 col-xl-4">
      <div className="card border-0 shadow-sm rounded-5 h-100 overflow-hidden">
        <div className="position-relative">
          <img
            src={car.image}
            className="card-img-top"
            alt={car.name}
            style={{ height: '250px', objectFit: 'cover' }}
          />

          <div className="position-absolute top-0 start-0 p-3 d-flex gap-2 flex-wrap">
            <span
              className="badge rounded-pill px-3 py-2 text-dark"
              style={{ background: car.categoryMeta.surface }}
            >
              {car.categoryLabel}
            </span>
            {car.modelUrl && <span className="badge rounded-pill text-bg-dark px-3 py-2">3D Ready</span>}
            {realPhotoCount > 1 ? (
              <span className="badge rounded-pill bg-light text-dark px-3 py-2">
                <FiCamera className="me-1" />
                {realPhotoCount} Real Photos
              </span>
            ) : null}
          </div>
        </div>

        <div className="card-body d-flex flex-column p-4">
          <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h4 className="fw-bold mb-1">{car.name}</h4>
              <p className="text-muted mb-0">{car.categoryMeta.headline}</p>
            </div>
            <div className="text-end">
              <div className="fw-bold fs-5 text-dark">${car.price}</div>
              <small className="text-muted">per day</small>
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <div className="rounded-4 p-3 bg-light h-100">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <FiCalendar /> Year
                </div>
                <div className="fw-semibold">{car.year}</div>
              </div>
            </div>
            <div className="col-6">
              <div className="rounded-4 p-3 bg-light h-100">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <FiLayers /> Category
                </div>
                <div className="fw-semibold">{car.categoryLabel}</div>
              </div>
            </div>
            <div className="col-6">
              <div className="rounded-4 p-3 bg-light h-100">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <FiZap /> Showroom
                </div>
                <div className="fw-semibold">{car.modelUrl ? 'Interactive 3D' : 'Photo Only'}</div>
              </div>
            </div>
            <div className="col-6">
              <div className="rounded-4 p-3 bg-light h-100">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <FiBox /> Booking
                </div>
                <div className="fw-semibold">{bookingStatusLabel}</div>
              </div>
            </div>
          </div>

          <p className="text-muted small mb-3">
            {car.showroomSummary || car.categoryMeta.description}
          </p>
          <div className="small text-muted mb-4">
            Source: {car.inventorySource === 'LOCAL_UPLOAD' ? 'Uploaded locally' : 'Fleet library'}
          </div>

          <div className="mt-auto d-grid gap-2">
            <div className="d-flex gap-2">
              <button
                onClick={onRent}
                className="btn btn-dark rounded-pill w-100 fw-bold py-2"
              >
                {rentButtonLabel}
              </button>

              <Link
                to={`/showroom?car=${encodeURIComponent(car.id)}`}
                state={{
                  carId: car.id,
                  carName: car.name,
                  carYear: car.year,
                  carPrice: car.price,
                  categoryLabel: car.categoryLabel,
                  carImage: car.image,
                  galleryImages: car.galleryImages,
                  modelUrl: car.modelUrl,
                  performanceProfile: car.performanceProfile,
                  showroomSummary: car.showroomSummary,
                  supportPromptTemplate: car.supportPromptTemplate,
                  partHighlights: car.partHighlights,
                }}
                className={`btn rounded-pill w-100 fw-bold py-2 text-decoration-none text-center ${
                  car.modelUrl ? 'btn-outline-danger' : 'btn-outline-secondary disabled'
                }`}
              >
                3D View
              </Link>
            </div>

            <button
              type="button"
              onClick={onShowPhotos}
              disabled={!realPhotoCount}
              className={`btn rounded-pill fw-bold py-2 ${
                realPhotoCount ? 'btn-outline-dark' : 'btn-outline-secondary'
              }`}
            >
              {realPhotoCount ? `Show Real Images (${realPhotoCount})` : 'No Real Images'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;

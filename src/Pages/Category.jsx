import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiActivity,
  FiBox,
  FiCompass,
  FiLayers,
  FiShield,
  FiStar,
  FiTruck,
  FiZap,
} from 'react-icons/fi';
import Navbar from '../components/Navbar';
import { buildApiUrl } from '../utils/api';
import { enrichVehicleRecord, summarizeCategories } from '../utils/vehicleCatalog';

const ICON_MAP = {
  sports: FiZap,
  sedan: FiStar,
  suv: FiCompass,
  hatchback: FiActivity,
  pickup: FiTruck,
  luxury: FiShield,
};

const Category = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(buildApiUrl('/cars'))
      .then((response) => response.json())
      .then((data) => {
        setCars(data.map((car) => enrichVehicleRecord(car)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categorySummary = useMemo(() => summarizeCategories(cars), [cars]);

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
        <div className="card border-0 shadow-sm rounded-5 overflow-hidden mb-4">
          <div className="row g-0">
            <div className="col-lg-7">
              <div className="p-4 p-lg-5 h-100 d-flex flex-column justify-content-center">
                <p className="text-uppercase small fw-bold text-danger mb-2">Category Garage</p>
                <h1 className="fw-bold mb-3">Find the right body style before you book.</h1>
                <p className="text-muted mb-4">
                  Every uploaded car is grouped into a body-style category so customers can jump
                  straight to sedans, SUVs, sports cars, and more.
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <div className="rounded-4 bg-light px-4 py-3">
                    <div className="text-muted small">Live Categories</div>
                    <div className="fw-bold fs-4">{categorySummary.length}</div>
                  </div>
                  <div className="rounded-4 bg-light px-4 py-3">
                    <div className="text-muted small">Classified Cars</div>
                    <div className="fw-bold fs-4">{cars.length}</div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="col-lg-5"
              style={{
                minHeight: '320px',
                background:
                  'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(239,68,68,0.78)), url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2080&auto=format&fit=crop) center/cover',
              }}
            ></div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger"></div>
          </div>
        ) : (
          <div className="row g-4">
            {categorySummary.map((category) => {
              const Icon = ICON_MAP[category.key] || FiLayers;
              const matchingCars = cars.filter((car) => car.categoryKey === category.key).slice(0, 3);

              return (
                <div key={category.key} className="col-md-6 col-xl-4">
                  <div className="card border-0 shadow-sm rounded-5 h-100">
                    <div className="card-body p-4">
                      <div
                        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                        style={{
                          width: '72px',
                          height: '72px',
                          background: category.surface,
                          color: category.accent,
                        }}
                      >
                        <Icon size={28} />
                      </div>

                      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                        <div>
                          <h4 className="fw-bold mb-1">{category.label}</h4>
                          <p className="text-muted mb-0">{category.headline}</p>
                        </div>
                        <span className="badge rounded-pill text-bg-dark px-3 py-2">
                          {category.total}
                        </span>
                      </div>

                      <p className="text-muted small mb-4">{category.description}</p>

                      <div className="rounded-4 bg-light p-3 mb-4">
                        <div className="small text-muted mb-2">Featured in this category</div>
                        {matchingCars.length ? (
                          <div className="d-flex flex-wrap gap-2">
                            {matchingCars.map((car) => (
                              <span key={car.id} className="badge rounded-pill text-bg-light border px-3 py-2">
                                <FiBox className="me-1" />
                                {car.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="small text-muted">
                            No live cars here yet. Upload one to start this category.
                          </div>
                        )}
                      </div>

                      <button
                        className="btn btn-dark rounded-pill w-100 fw-bold"
                        onClick={() => navigate(`/available?category=${category.key}`)}
                      >
                        View {category.label} Fleet
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;

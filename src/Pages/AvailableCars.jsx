import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiBriefcase,
  FiCalendar,
  FiCamera,
  FiCompass,
  FiFilter,
  FiGlobe,
  FiHeart,
  FiHome,
  FiMapPin,
  FiNavigation,
  FiPlus,
  FiSearch,
  FiShield,
  FiUsers,
} from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import NotificationCenter from '../components/NotificationCenter';
import useAuth from '../context/useAuth';
import useNotifications from '../hooks/useNotifications';
import { authFetch, buildApiUrl } from '../utils/api';
import {
  calculateRentalQuote,
  EMPTY_RENTAL_REQUEST,
  RENTAL_PURPOSE_OPTIONS,
} from '../utils/rentalPricing';
import { loadGoogleMapsPlacesApi } from '../utils/googleMapsPlaces';
import {
  enrichVehicleRecord,
  summarizeCategories,
} from '../utils/vehicleCatalog';
import {
  listStoredVehicles,
  mergeVehicleCollections,
} from '../utils/vehicleStorage';

const PRICE_FORMATTER = new Intl.NumberFormat('en-US');

const PURPOSE_ICON_MAP = {
  wedding: FiHeart,
  trip: FiCompass,
  'foreign-travel': FiGlobe,
  business: FiBriefcase,
  family: FiHome,
  airport: FiNavigation,
  photoshoot: FiCamera,
  'long-tour': FiMapPin,
};

const SRI_LANKA_CENTER = { lat: 7.8731, lng: 80.7718 };

const createEmptyRentalRequest = () => ({ ...EMPTY_RENTAL_REQUEST });

const createDefaultRoutePreview = () => ({
  status: 'idle',
  distanceKm: null,
  durationText: '',
  message: '',
});

const formatTravelDuration = (seconds) => {
  const totalMinutes = Math.max(1, Math.round((Number(seconds) || 0) / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours && minutes) {
    return `${hours}h ${minutes}m`;
  }

  if (hours) {
    return `${hours}h`;
  }

  return `${minutes} min`;
};

const AvailableCars = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [photoViewerCar, setPhotoViewerCar] = useState(null);
  const [photoViewerIndex, setPhotoViewerIndex] = useState(0);
  const [rentalData, setRentalData] = useState(createEmptyRentalRequest);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const pickupInputRef = useRef(null);
  const dropoffInputRef = useRef(null);
  const routeMapRef = useRef(null);
  const routeMapInstanceRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const autocompleteRefs = useRef({ pickup: null, dropoff: null });
  const autocompleteListenersRef = useRef([]);
  const requestedRentalCarId = searchParams.get('rent');
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || '';
  const hasGoogleMapsKey =
    Boolean(googleMapsApiKey) &&
    googleMapsApiKey !== 'your_google_maps_javascript_api_key_here';
  const [mapsStatus, setMapsStatus] = useState(hasGoogleMapsKey ? 'loading' : 'missing_key');
  const [mapsError, setMapsError] = useState('');
  const [routePreview, setRoutePreview] = useState(createDefaultRoutePreview);
  const activeCategory = searchParams.get('category') || 'all';
  const { notifications, notify, dismissNotification } = useNotifications();

  useEffect(() => {
    let isMounted = true;

    const loadCars = async () => {
      setLoading(true);

      try {
        const [localCars, remoteCars] = await Promise.all([
          listStoredVehicles(),
          fetch(buildApiUrl('/cars'))
            .then((response) => (response.ok ? response.json() : []))
            .catch(() => []),
        ]);

        if (!isMounted) {
          return;
        }

        const mergedCars = mergeVehicleCollections(localCars, remoteCars);
        setCars(mergedCars.map((car) => enrichVehicleRecord(car)));
      } catch {
        if (!isMounted) {
          return;
        }

        const localCars = await listStoredVehicles().catch(() => []);
        setCars(localCars.map((car) => enrichVehicleRecord(car)));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCars();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!requestedRentalCarId || !cars.length || user?.role !== 'CUSTOMER') {
      return;
    }

    const targetCar = cars.find((car) => String(car.id) === String(requestedRentalCarId));

    if (!targetCar) {
      return;
    }

    setRentalData(createEmptyRentalRequest());
    setSelectedCar(targetCar);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('rent');
    setSearchParams(nextParams, { replace: true });
  }, [cars, requestedRentalCarId, searchParams, setSearchParams, user?.role]);

  useEffect(() => {
    const flashNotification = location.state?.notification;

    if (!flashNotification) {
      return;
    }

    notify(flashNotification);
    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: {},
    });
  }, [location.pathname, location.search, location.state, navigate, notify]);

  useEffect(() => {
    if (!hasGoogleMapsKey) {
      setMapsStatus('missing_key');
      setMapsError('Add VITE_GOOGLE_MAPS_API_KEY to enable Google Maps location search.');
      return;
    }

    let isActive = true;

    loadGoogleMapsPlacesApi(googleMapsApiKey)
      .then(() => {
        if (!isActive) {
          return;
        }

        setMapsStatus('ready');
        setMapsError('');
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }

        setMapsStatus('error');
        setMapsError(error.message || 'Failed to load Google Maps.');
      });

    return () => {
      isActive = false;
    };
  }, [googleMapsApiKey, hasGoogleMapsKey]);

  const categorySummaries = useMemo(() => summarizeCategories(cars), [cars]);

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const matchesCategory = activeCategory === 'all' || car.categoryKey === activeCategory;
      const referenceText = `${car.name} ${car.categoryLabel} ${car.year}`.toLowerCase();
      const matchesSearch = !searchTerm.trim()
        ? true
        : referenceText.includes(searchTerm.trim().toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, cars, searchTerm]);

  const rentalQuote = useMemo(
    () =>
      calculateRentalQuote({
        baseDailyRate: selectedCar?.price,
        startDate: rentalData.startDate,
        endDate: rentalData.endDate,
        purposeCategory: rentalData.purposeCategory,
        estimatedDistanceKm: rentalData.estimatedDistanceKm,
      }),
    [
      rentalData.endDate,
      rentalData.estimatedDistanceKm,
      rentalData.purposeCategory,
      rentalData.startDate,
      selectedCar?.price,
    ],
  );

  const hasValidDateRange =
    !rentalData.startDate ||
    !rentalData.endDate ||
    new Date(rentalData.endDate).getTime() >= new Date(rentalData.startDate).getTime();

  const routePlannerMessage =
    mapsStatus === 'ready'
      ? routePreview.status === 'ready'
        ? `${routePreview.message}. Distance synced from Google Maps.`
        : routePreview.status === 'loading'
          ? 'Calculating the driving route with Google Maps...'
          : routePreview.status === 'awaiting_selection'
            ? routePreview.message
            : routePreview.status === 'error'
              ? routePreview.message
              : 'Choose both locations from the Google Maps suggestions to preview the route.'
      : mapsStatus === 'missing_key'
        ? 'Add VITE_GOOGLE_MAPS_API_KEY in .env.local to enable Google Maps autocomplete and route previews.'
      : mapsStatus === 'error'
        ? mapsError
        : 'Loading Google Maps...';

  const handleCategorySelect = (categoryKey) => {
    const nextParams = new URLSearchParams(searchParams);

    if (categoryKey === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', categoryKey);
    }

    setSearchParams(nextParams);
  };

  const resetRentalForm = () => {
    setRentalData(createEmptyRentalRequest());
    setRoutePreview(createDefaultRoutePreview());
  };

  const handleRentClick = (car) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'CUSTOMER') {
      notify({
        type: 'warning',
        eyebrow: 'Access Control',
        title: 'Manager dashboard account detected',
        message:
          'The preset manager account manages the fleet. Customer self-service login is disabled in this build.',
      });
      return;
    }

    resetRentalForm();
    setSelectedCar(car);
  };

  const openPhotoViewer = (car, startIndex = 0) => {
    const galleryImages = [...new Set([car.image, ...(car.galleryImages || [])].filter(Boolean))];

    if (!galleryImages.length) {
      notify({
        type: 'warning',
        eyebrow: car.name,
        title: 'No real images available',
        message: 'This listing does not have uploaded real photos yet.',
      });
      return;
    }

    setPhotoViewerCar({
      ...car,
      galleryImages,
    });
    setPhotoViewerIndex(Math.min(Math.max(startIndex, 0), galleryImages.length - 1));
  };

  const closePhotoViewer = () => {
    setPhotoViewerCar(null);
    setPhotoViewerIndex(0);
  };

  const closeRentalModal = () => {
    setSelectedCar(null);
    resetRentalForm();
  };

  const activePhotoGallery = useMemo(
    () => (photoViewerCar ? photoViewerCar.galleryImages || [] : []),
    [photoViewerCar],
  );

  const activePhoto = activePhotoGallery[photoViewerIndex] || '';

  const showPreviousPhoto = () => {
    if (!activePhotoGallery.length) {
      return;
    }

    setPhotoViewerIndex((current) =>
      current === 0 ? activePhotoGallery.length - 1 : current - 1,
    );
  };

  const showNextPhoto = () => {
    if (!activePhotoGallery.length) {
      return;
    }

    setPhotoViewerIndex((current) =>
      current === activePhotoGallery.length - 1 ? 0 : current + 1,
    );
  };

  const updateRentalField = (key, value) => {
    setRentalData((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateLocationField = (kind, value) => {
    setRentalData((current) => ({
      ...current,
      [kind === 'pickup' ? 'pickupLocation' : 'dropoffLocation']: value,
      [kind === 'pickup' ? 'pickupPlaceId' : 'dropoffPlaceId']: '',
      [kind === 'pickup' ? 'pickupCoordinates' : 'dropoffCoordinates']: null,
    }));
  };

  useEffect(() => {
    if (!selectedCar || mapsStatus !== 'ready') {
      return undefined;
    }

    const google = window.google;
    if (!google?.maps?.places) {
      return undefined;
    }

    autocompleteListenersRef.current.forEach((listener) => listener?.remove?.());
    autocompleteListenersRef.current = [];
    autocompleteRefs.current = { pickup: null, dropoff: null };

    const bindAutocomplete = (input, kind) => {
      if (!input) {
        return;
      }

      const autocomplete = new google.maps.places.Autocomplete(input, {
        fields: ['formatted_address', 'geometry', 'name', 'place_id'],
        componentRestrictions: { country: 'lk' },
      });

      const listener = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        const formattedAddress = place?.formatted_address || place?.name || input.value;
        const lat = place?.geometry?.location?.lat?.();
        const lng = place?.geometry?.location?.lng?.();

        setRentalData((current) => ({
          ...current,
          [kind === 'pickup' ? 'pickupLocation' : 'dropoffLocation']: formattedAddress,
          [kind === 'pickup' ? 'pickupPlaceId' : 'dropoffPlaceId']: place?.place_id || '',
          [kind === 'pickup' ? 'pickupCoordinates' : 'dropoffCoordinates']:
            lat != null && lng != null ? { lat, lng } : null,
        }));
      });

      autocompleteRefs.current[kind] = autocomplete;
      autocompleteListenersRef.current.push(listener);
    };

    bindAutocomplete(pickupInputRef.current, 'pickup');
    bindAutocomplete(dropoffInputRef.current, 'dropoff');

    return () => {
      autocompleteListenersRef.current.forEach((listener) => listener?.remove?.());
      autocompleteListenersRef.current = [];
      autocompleteRefs.current = { pickup: null, dropoff: null };
    };
  }, [mapsStatus, selectedCar]);

  useEffect(() => {
    if (!selectedCar || mapsStatus !== 'ready' || !routeMapRef.current) {
      return undefined;
    }

    const google = window.google;
    if (!google?.maps) {
      return undefined;
    }

    const map = new google.maps.Map(routeMapRef.current, {
      center: SRI_LANKA_CENTER,
      zoom: 7,
      disableDefaultUI: true,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      clickableIcons: false,
      gestureHandling: 'cooperative',
    });

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: false,
      preserveViewport: false,
      polylineOptions: {
        strokeColor: '#dc3545',
        strokeOpacity: 0.92,
        strokeWeight: 5,
      },
    });

    directionsRenderer.setMap(map);
    routeMapInstanceRef.current = map;
    directionsServiceRef.current = directionsService;
    directionsRendererRef.current = directionsRenderer;

    return () => {
      directionsRenderer.setMap(null);
      routeMapInstanceRef.current = null;
      directionsServiceRef.current = null;
      directionsRendererRef.current = null;
    };
  }, [mapsStatus, selectedCar]);

  useEffect(() => {
    if (!selectedCar || mapsStatus !== 'ready') {
      return undefined;
    }

    const google = window.google;
    const directionsService = directionsServiceRef.current;
    const directionsRenderer = directionsRendererRef.current;

    if (!google?.maps || !directionsService || !directionsRenderer) {
      return undefined;
    }

    const clearRenderedRoute = () => {
      directionsRenderer.set('directions', null);
      routeMapInstanceRef.current?.setCenter(SRI_LANKA_CENTER);
      routeMapInstanceRef.current?.setZoom(7);
    };

    const hasPickupText = Boolean(rentalData.pickupLocation.trim());
    const hasDropoffText = Boolean(rentalData.dropoffLocation.trim());

    if (!hasPickupText || !hasDropoffText) {
      clearRenderedRoute();
      setRoutePreview(createDefaultRoutePreview());
      return undefined;
    }

    if (!rentalData.pickupPlaceId || !rentalData.dropoffPlaceId) {
      clearRenderedRoute();
      setRoutePreview({
        status: 'awaiting_selection',
        distanceKm: null,
        durationText: '',
        message:
          'Select both locations from the Google Maps dropdown to calculate the driving route automatically.',
      });
      return undefined;
    }

    let cancelled = false;

    setRoutePreview({
      status: 'loading',
      distanceKm: null,
      durationText: '',
      message: '',
    });

    directionsService.route(
      {
        origin: { placeId: rentalData.pickupPlaceId },
        destination: { placeId: rentalData.dropoffPlaceId },
        travelMode: google.maps.TravelMode.DRIVING,
        region: 'LK',
      },
      (result, status) => {
        if (cancelled) {
          return;
        }

        if (status !== 'OK' || !result?.routes?.length) {
          clearRenderedRoute();
          setRoutePreview({
            status: 'error',
            distanceKm: null,
            durationText: '',
            message:
              'Google Maps could not calculate this route yet. You can still type the estimated distance manually.',
          });
          return;
        }

        const primaryRoute = result.routes[0];
        const legs = primaryRoute.legs || [];
        const totalMeters = legs.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0);
        const totalSeconds = legs.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0);
        const distanceKm = Math.max(1, Math.round(totalMeters / 1000));
        const startAddress = legs[0]?.start_address || rentalData.pickupLocation;
        const endAddress = legs[legs.length - 1]?.end_address || rentalData.dropoffLocation;
        const routeLabel = `${startAddress} to ${endAddress}`;

        directionsRenderer.setDirections(result);
        setRoutePreview({
          status: 'ready',
          distanceKm,
          durationText: formatTravelDuration(totalSeconds),
          message: routeLabel,
        });

        setRentalData((current) => {
          const nextDistance = distanceKm ? String(distanceKm) : current.estimatedDistanceKm;
          const nextPlan = current.destinationPlan.trim()
            ? current.destinationPlan
            : `${current.pickupLocation} to ${current.dropoffLocation}`;

          if (
            nextDistance === current.estimatedDistanceKm &&
            nextPlan === current.destinationPlan
          ) {
            return current;
          }

          return {
            ...current,
            estimatedDistanceKm: nextDistance,
            destinationPlan: nextPlan,
          };
        });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [
    mapsStatus,
    rentalData.dropoffLocation,
    rentalData.dropoffPlaceId,
    rentalData.pickupLocation,
    rentalData.pickupPlaceId,
    selectedCar,
  ]);

  const submitRental = async (e) => {
    e.preventDefault();

    if (!hasValidDateRange) {
      notify({
        type: 'error',
        eyebrow: 'Date Check',
        title: 'Fix the booking dates',
        message: 'End date must be the same day or later than the start date.',
      });
      return;
    }

    const selectedCarName = selectedCar.name;
    const rentalPayload = {
      carId: selectedCar.id,
      userId: user.id,
      carName: selectedCar.name,
      customerName: user.name,
      ...rentalData,
      estimatedDistanceKm: Number(rentalData.estimatedDistanceKm) || 0,
      rentalDays: rentalQuote.rentalDays,
      approximateMonths: Number(rentalQuote.approximateMonths.toFixed(1)),
      quotedBaseDailyRate: rentalQuote.baseDailyRate,
      quotedAdjustedDailyRate: rentalQuote.adjustedDailyRate,
      estimatedTotal: rentalQuote.estimatedTotal,
      purposeLabel: rentalQuote.purposeMeta.label,
      durationRateLabel: rentalQuote.durationMeta.label,
      distanceRateLabel: rentalQuote.distanceMeta.label,
      routeDistanceSource: routePreview.status === 'ready' ? 'GOOGLE_MAPS' : 'MANUAL',
      googleRouteDistanceKm: routePreview.status === 'ready' ? routePreview.distanceKm : null,
      googleRouteDurationText: routePreview.status === 'ready' ? routePreview.durationText : '',
    };

    try {
      const response = await authFetch('/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rentalPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create rental request');
      }

      closeRentalModal();
      notify({
        type: 'success',
        eyebrow: selectedCarName,
        title: 'Rental request sent to staff',
        message: `Estimated total: $${PRICE_FORMATTER.format(
          rentalQuote.estimatedTotal,
        )}. Our team will review the booking and confirm the final schedule.`,
        duration: 5600,
      });
    } catch (error) {
      notify({
        type: 'error',
        eyebrow: selectedCarName,
        title: 'Rental request failed',
        message:
          error.message ||
          'The backend could not save this rental request right now. Please try again.',
        duration: 5600,
      });
    }
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Navbar />
      <NotificationCenter
        notifications={notifications}
        onDismiss={dismissNotification}
      />

      <div className="container" style={{ marginTop: '118px' }}>
        <div className="row g-4 align-items-stretch mb-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-5 h-100">
              <div className="card-body p-4 p-lg-5">
                <p className="text-uppercase small fw-bold text-danger mb-2">Fleet Explorer</p>
                <h1 className="fw-bold mb-3">Browse rental-ready vehicles with live 3D previews.</h1>
                <p className="text-muted mb-4">
                  Filter by body style, inspect supported cars in the showroom, and send booking
                  requests as a customer through showroom staff.
                </p>

                <div className="row g-3">
                  <div className="col-md-8">
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-white border-end-0 rounded-start-4">
                        <FiSearch />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 rounded-end-4"
                        placeholder="Search by vehicle name, year, or category..."
                        value={searchTerm}
                        onChange={(e) => {
                          const nextValue = e.target.value;
                          setSearchTerm(nextValue);

                          const nextParams = new URLSearchParams(searchParams);
                          if (nextValue.trim()) {
                            nextParams.set('q', nextValue.trim());
                          } else {
                            nextParams.delete('q');
                          }

                          setSearchParams(nextParams, { replace: true });
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    {user?.role === 'ADMIN' ? (
                      <Link
                        to="/admin/upload-car"
                        className="btn btn-danger btn-lg rounded-pill w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                      >
                        <FiPlus /> Upload Car
                      </Link>
                    ) : (
                      <div className="rounded-4 bg-dark text-white h-100 d-flex align-items-center px-4">
                        <small className="mb-0">
                          {user?.role === 'CUSTOMER'
                            ? 'Choose your car, add your trip plan, and send the request to receive a clearer rental estimate.'
                            : 'Browse the fleet, review the real images, and request customer access when you are ready.'}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-5 h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-2 text-danger fw-semibold mb-3">
                  <FiFilter /> Fleet Insights
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="rounded-4 bg-light p-3">
                      <div className="text-muted small mb-1">Total Cars</div>
                      <div className="fw-bold fs-3">{cars.length}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="rounded-4 bg-light p-3">
                      <div className="text-muted small mb-1">3D Ready</div>
                      <div className="fw-bold fs-3">{cars.filter((car) => car.modelUrl).length}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="rounded-4 bg-light p-3">
                      <div className="text-muted small mb-1">Customers</div>
                      <div className="fw-bold fs-3">
                        <FiUsers />
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="rounded-4 bg-light p-3">
                      <div className="text-muted small mb-1">Admin Tools</div>
                      <div className="fw-bold fs-3">
                        <FiShield />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-4 border mt-4 p-3">
                  <div className="fw-semibold mb-2">Smart Rental Questions</div>
                  <div className="small text-muted">
                    The booking form now asks what the car is for, where the customer plans to go,
                    the expected travel distance, and lets the customer inspect real photos before estimating the quote.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleCategorySelect('all')}
            className={`btn rounded-pill px-4 fw-semibold ${
              activeCategory === 'all' ? 'btn-dark' : 'btn-outline-dark'
            }`}
          >
            All Categories
          </button>
          {categorySummaries.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => handleCategorySelect(category.key)}
              className={`btn rounded-pill px-4 fw-semibold ${
                activeCategory === category.key ? 'btn-danger' : 'btn-outline-secondary'
              }`}
            >
              {category.label} ({category.total})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center mt-5 py-5">
            <div className="spinner-border text-danger"></div>
          </div>
        ) : filteredCars.length ? (
          <div className="row g-4">
            {filteredCars.map((car) => (
              <Card
                key={car.id}
                car={car}
                onRent={() => handleRentClick(car)}
                onShowPhotos={() => openPhotoViewer(car)}
                canRent={user?.role === 'CUSTOMER'}
                bookingStatusLabel={
                  user?.role === 'CUSTOMER'
                    ? 'Purpose-based booking'
                    : 'Customer account required'
                }
                rentButtonLabel={
                  user?.role === 'CUSTOMER'
                    ? 'Plan Rental Request'
                    : 'Customer Login'
                }
              />
            ))}
          </div>
        ) : (
          <div className="card border-0 shadow-sm rounded-5 text-center p-5">
            <h3 className="fw-bold mb-2">No cars match this filter</h3>
            <p className="text-muted mb-4">
              Try another category or clear your search to see more of the fleet.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                handleCategorySelect('all');
              }}
              className="btn btn-dark rounded-pill px-4 align-self-center"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {photoViewerCar && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.72)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 shadow-lg rounded-5 overflow-hidden">
              <div className="modal-header border-0 px-4 pt-4 pb-0">
                <div>
                  <p className="text-uppercase small fw-bold text-danger mb-1">Real Car Images</p>
                  <h4 className="modal-title fw-bold mb-1">{photoViewerCar.name}</h4>
                  <div className="small text-muted">
                    Uploaded photos {activePhotoGallery.length ? photoViewerIndex + 1 : 0} of{' '}
                    {activePhotoGallery.length}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closePhotoViewer}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="rounded-5 overflow-hidden bg-dark position-relative mb-4">
                  {activePhoto ? (
                    <img
                      src={activePhoto}
                      alt={`${photoViewerCar.name} real view ${photoViewerIndex + 1}`}
                      className="w-100"
                      style={{ maxHeight: '68vh', objectFit: 'contain', background: '#111827' }}
                    />
                  ) : null}

                  {activePhotoGallery.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={showPreviousPhoto}
                        className="btn btn-light rounded-pill position-absolute top-50 start-0 translate-middle-y ms-3 px-3 fw-semibold"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={showNextPhoto}
                        className="btn btn-light rounded-pill position-absolute top-50 end-0 translate-middle-y me-3 px-3 fw-semibold"
                      >
                        Next
                      </button>
                    </>
                  ) : null}
                </div>

                {activePhotoGallery.length > 1 ? (
                  <div className="row g-3">
                    {activePhotoGallery.map((galleryImage, index) => (
                      <div key={`${galleryImage}-${index}`} className="col-6 col-md-3">
                        <button
                          type="button"
                          onClick={() => setPhotoViewerIndex(index)}
                          className="btn p-0 border-0 rounded-4 overflow-hidden w-100 bg-transparent"
                          style={{
                            outline:
                              photoViewerIndex === index
                                ? '3px solid rgba(239, 68, 68, 0.9)'
                                : '1px solid rgba(15, 23, 42, 0.08)',
                          }}
                        >
                          <img
                            src={galleryImage}
                            alt={`${photoViewerCar.name} thumbnail ${index + 1}`}
                            className="w-100"
                            style={{ height: '120px', objectFit: 'cover' }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCar && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 shadow-lg rounded-5 overflow-hidden">
              <div className="row g-0">
                <div className="col-lg-4">
                  <div className="h-100 position-relative">
                    <img
                      src={selectedCar.image}
                      alt={selectedCar.name}
                      className="w-100 h-100 object-fit-cover"
                      style={{ minHeight: '100%' }}
                    />

                    <div
                      className="position-absolute bottom-0 start-0 end-0 p-4 text-white"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0.88))',
                      }}
                    >
                      <p className="text-uppercase small fw-bold mb-2" style={{ letterSpacing: '0.12em' }}>
                        Smart Rental Quote
                      </p>
                      <h3 className="fw-bold mb-2">{selectedCar.name}</h3>
                      <div className="d-flex flex-wrap gap-2">
                        <span className="badge rounded-pill text-bg-light px-3 py-2 text-dark">
                          Base daily rate: ${PRICE_FORMATTER.format(Number(selectedCar.price) || 0)}
                        </span>
                        <span className="badge rounded-pill bg-danger-subtle text-danger-emphasis px-3 py-2">
                          {rentalQuote.rentalDays} day{rentalQuote.rentalDays > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-8">
                  <div
                    className="d-flex flex-column"
                    style={{ maxHeight: 'min(88vh, 980px)' }}
                  >
                    <div className="modal-header border-0 pb-0 px-4 pt-4">
                      <div>
                        <p className="text-uppercase small fw-bold text-danger mb-1">Rental Request</p>
                        <h4 className="modal-title fw-bold">
                          Staff-Assisted Booking for {selectedCar.name}
                        </h4>
                      </div>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={closeRentalModal}
                      ></button>
                    </div>

                    <div className="modal-body p-4 overflow-auto">
                      <div className="rounded-4 bg-light p-3 mb-4">
                        <div className="fw-semibold mb-1">Why we ask these questions</div>
                        <div className="small text-muted">
                          Customers use cars for weddings, trips, family functions, foreign guest
                          travel, airport pickups, business visits, and more. The estimate changes
                          with rental dates and months, travel distance, and the purpose of the trip.
                        </div>
                      </div>

                      <form onSubmit={submitRental}>
                        <div className="mb-4">
                          <label className="form-label fw-semibold">Rental Purpose Category</label>
                          <div className="row g-2">
                            {RENTAL_PURPOSE_OPTIONS.map((option) => {
                              const Icon = PURPOSE_ICON_MAP[option.key] || FiCompass;
                              const isActive = rentalData.purposeCategory === option.key;

                              return (
                                <div key={option.key} className="col-md-6">
                                  <button
                                    type="button"
                                    onClick={() => updateRentalField('purposeCategory', option.key)}
                                    className="btn w-100 text-start rounded-4 p-3 h-100"
                                    style={{
                                      border: isActive
                                        ? `2px solid ${option.accentColor}`
                                        : '1px solid rgba(15, 23, 42, 0.08)',
                                      background: isActive ? `${option.accentColor}10` : '#fff',
                                    }}
                                  >
                                    <div className="d-flex align-items-start gap-3">
                                      <span
                                        className="rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{
                                          width: '40px',
                                          height: '40px',
                                          background: `${option.accentColor}18`,
                                          color: option.accentColor,
                                        }}
                                      >
                                        <Icon />
                                      </span>
                                      <span>
                                        <span className="d-block fw-semibold text-dark">
                                          {option.label}
                                        </span>
                                        <span className="d-block small text-muted">
                                          {option.description}
                                        </span>
                                      </span>
                                    </div>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            What will you use this car for?
                          </label>
                          <textarea
                            className="form-control rounded-4"
                            rows="3"
                            placeholder="Example: Wedding at Mount Lavinia Hotel, 6 hours, bride and groom transport."
                            required
                            value={rentalData.purposeDetails}
                            onChange={(e) => updateRentalField('purposeDetails', e.target.value)}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-semibold">
                            Where are you going / travel plan
                          </label>
                          <input
                            type="text"
                            className="form-control rounded-4"
                            placeholder="Example: Colombo to Kandy and back, or airport pickup to Galle."
                            required
                            value={rentalData.destinationPlan}
                            onChange={(e) => updateRentalField('destinationPlan', e.target.value)}
                          />
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-semibold">Pick-up Location</label>
                            <div className="d-flex align-items-center gap-2 border rounded-4 px-3 py-3 bg-light">
                              <FiMapPin className="text-danger" />
                              <input
                                ref={pickupInputRef}
                                type="text"
                                className="form-control border-0 bg-transparent shadow-none"
                                placeholder={
                                  mapsStatus === 'ready'
                                    ? 'Search pick-up location with Google Maps'
                                    : 'Pick-up Location'
                                }
                                autoComplete="off"
                                required
                                value={rentalData.pickupLocation}
                                onChange={(e) => updateLocationField('pickup', e.target.value)}
                              />
                            </div>
                            {rentalData.pickupLocation ? (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  rentalData.pickupLocation,
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="small text-decoration-none d-inline-block mt-2"
                              >
                                Open pick-up in Google Maps
                              </a>
                            ) : null}
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-semibold">Drop-off Location</label>
                            <div className="d-flex align-items-center gap-2 border rounded-4 px-3 py-3 bg-light">
                              <FiMapPin className="text-secondary" />
                              <input
                                ref={dropoffInputRef}
                                type="text"
                                className="form-control border-0 bg-transparent shadow-none"
                                placeholder={
                                  mapsStatus === 'ready'
                                    ? 'Search drop-off location with Google Maps'
                                    : 'Drop-off Location'
                                }
                                autoComplete="off"
                                required
                                value={rentalData.dropoffLocation}
                                onChange={(e) => updateLocationField('dropoff', e.target.value)}
                              />
                            </div>
                            {rentalData.dropoffLocation ? (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  rentalData.dropoffLocation,
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="small text-decoration-none d-inline-block mt-2"
                              >
                                Open drop-off in Google Maps
                              </a>
                            ) : null}
                          </div>
                        </div>

                        <div className="rounded-4 border overflow-hidden bg-white mb-4">
                          <div className="d-flex justify-content-between align-items-start gap-3 p-3 border-bottom bg-light">
                            <div>
                              <div className="fw-semibold">Google Maps Route Planner</div>
                              <div className="small text-muted">
                                Select both places from the Maps suggestions to preview the drive
                                and auto-fill the estimated KM.
                              </div>
                            </div>

                            <div className="d-flex flex-wrap justify-content-end gap-2">
                              <span
                                className={`badge rounded-pill px-3 py-2 ${
                                  mapsStatus === 'ready'
                                    ? 'bg-success-subtle text-success-emphasis'
                                    : 'bg-secondary-subtle text-secondary-emphasis'
                                }`}
                              >
                                {mapsStatus === 'ready' ? 'Maps Ready' : 'Manual Mode'}
                              </span>
                              {routePreview.status === 'ready' ? (
                                <>
                                  <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis px-3 py-2">
                                    {routePreview.distanceKm} km
                                  </span>
                                  <span className="badge rounded-pill bg-danger-subtle text-danger-emphasis px-3 py-2">
                                    {routePreview.durationText}
                                  </span>
                                </>
                              ) : null}
                            </div>
                          </div>

                          {mapsStatus === 'ready' ? (
                            <>
                              <div ref={routeMapRef} style={{ height: '220px', width: '100%' }} />
                              <div className="p-3">
                                <div
                                  className={`small ${
                                    routePreview.status === 'error'
                                      ? 'text-danger'
                                      : routePreview.status === 'ready'
                                        ? 'text-success'
                                        : 'text-muted'
                                  }`}
                                >
                                  {routePlannerMessage}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="p-3">
                              {mapsStatus === 'loading' ? (
                                <div className="d-flex align-items-center gap-2 small text-muted">
                                  <span
                                    className="spinner-border spinner-border-sm text-danger"
                                    aria-hidden="true"
                                  ></span>
                                  <span>{routePlannerMessage}</span>
                                </div>
                              ) : (
                                <div
                                  className={`small ${
                                    mapsStatus === 'error' ? 'text-danger' : 'text-muted'
                                  }`}
                                >
                                  {routePlannerMessage}
                                </div>
                              )}

                              {mapsStatus === 'missing_key' ? (
                                <div className="small text-muted mt-2">
                                  Keep manual typing enabled for now, or add
                                  <code className="mx-1">VITE_GOOGLE_MAPS_API_KEY</code>
                                  in `.env.local` to turn on autocomplete and route previews.
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>

                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <label className="form-label small fw-bold">
                              <FiCalendar /> Start Date
                            </label>
                            <input
                              type="date"
                              className="form-control rounded-4"
                              required
                              value={rentalData.startDate}
                              onChange={(e) => updateRentalField('startDate', e.target.value)}
                            />
                          </div>

                          <div className="col-md-4 mb-3">
                            <label className="form-label small fw-bold">
                              <FiCalendar /> End Date
                            </label>
                            <input
                              type="date"
                              className={`form-control rounded-4 ${
                                hasValidDateRange ? '' : 'is-invalid'
                              }`}
                              min={rentalData.startDate || undefined}
                              required
                              value={rentalData.endDate}
                              onChange={(e) => updateRentalField('endDate', e.target.value)}
                            />
                            {!hasValidDateRange ? (
                              <div className="invalid-feedback">
                                End date must be the same day or later than start date.
                              </div>
                            ) : null}
                          </div>

                          <div className="col-md-4 mb-3">
                            <label className="form-label small fw-bold">
                              Estimated Distance (KM)
                            </label>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              className="form-control rounded-4"
                              placeholder="120"
                              required
                              value={rentalData.estimatedDistanceKm}
                              onChange={(e) =>
                                updateRentalField('estimatedDistanceKm', e.target.value)
                              }
                            />
                            {routePreview.status === 'ready' ? (
                              <div className="small text-success mt-2">
                                Auto-filled from Google Maps route. You can still adjust it
                                manually.
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="rounded-4 border p-4 bg-light mb-4">
                          <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                            <div>
                              <div className="fw-semibold">Live Price Estimate</div>
                              <div className="small text-muted">
                                This quote changes with purpose category, booking duration, and
                                expected distance.
                              </div>
                            </div>
                            <span className="badge rounded-pill text-bg-dark px-3 py-2">
                              {rentalQuote.rentalDays} day{rentalQuote.rentalDays > 1 ? 's' : ''}
                            </span>
                          </div>

                          <div className="row g-2 mb-3">
                            <div className="col-md-6">
                              <div className="rounded-4 bg-white p-3 h-100 border">
                                <div className="small text-muted mb-1">Base Daily Rate</div>
                                <div className="fw-semibold">
                                  ${PRICE_FORMATTER.format(rentalQuote.baseDailyRate)}
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="rounded-4 bg-white p-3 h-100 border">
                                <div className="small text-muted mb-1">Adjusted Daily Rate</div>
                                <div className="fw-semibold text-danger">
                                  ${PRICE_FORMATTER.format(rentalQuote.adjustedDailyRate)}
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="rounded-4 bg-white p-3 h-100 border">
                                <div className="small text-muted mb-1">Duration Band</div>
                                <div className="fw-semibold">{rentalQuote.durationMeta.label}</div>
                                <div className="small text-muted">
                                  {rentalQuote.approximateMonths >= 1
                                    ? `${rentalQuote.approximateMonths.toFixed(1)} month estimate`
                                    : `${rentalQuote.rentalDays} calendar days`}
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="rounded-4 bg-white p-3 h-100 border">
                                <div className="small text-muted mb-1">Distance Band</div>
                                <div className="fw-semibold">{rentalQuote.distanceMeta.label}</div>
                                <div className="small text-muted">
                                  {PRICE_FORMATTER.format(rentalQuote.distanceKm)} km planned
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="d-flex flex-wrap gap-2 mb-3">
                            <span className="badge rounded-pill bg-danger-subtle text-danger-emphasis px-3 py-2">
                              {rentalQuote.purposeMeta.label}
                            </span>
                            <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis px-3 py-2">
                              {rentalQuote.durationMeta.label}
                            </span>
                            <span className="badge rounded-pill bg-success-subtle text-success-emphasis px-3 py-2">
                              {rentalQuote.distanceMeta.label}
                            </span>
                          </div>

                          <div className="rounded-4 bg-dark text-white p-3">
                            <div className="small text-white-50 mb-1">Estimated Total</div>
                            <div className="fw-bold fs-3">
                              ${PRICE_FORMATTER.format(rentalQuote.estimatedTotal)}
                            </div>
                            <div className="small text-white-50">
                              Base total without adjustments: $
                              {PRICE_FORMATTER.format(rentalQuote.baseTotal)}
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={!hasValidDateRange}
                          className="btn btn-dark w-100 rounded-pill fw-bold py-3 mt-2"
                        >
                          Send Detailed Request to Staff
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableCars;

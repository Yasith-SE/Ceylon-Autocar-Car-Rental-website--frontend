import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCheckCircle,
  FiImage,
  FiLayers,
  FiMessageSquare,
  FiUploadCloud,
  FiZap,
} from 'react-icons/fi';
import Navbar from '../components/Navbar';
import NotificationCenter from '../components/NotificationCenter';
import useNotifications from '../hooks/useNotifications';
import useAuth from '../context/useAuth';
import { authFetch } from '../utils/api';
import {
  PERFORMANCE_SPEC_FIELDS,
  VEHICLE_CATEGORIES,
  getVehicleCategoryMeta,
  inferVehicleCategory,
  resolveVehiclePerformance,
} from '../utils/vehicleCatalog';
import {
  getDefaultShowroomSummary,
  getDefaultSupportPrompt,
  saveVehicleUpload,
} from '../utils/vehicleStorage';

const EMPTY_PERFORMANCE_SPEC = PERFORMANCE_SPEC_FIELDS.reduce((state, field) => {
  state[field.key] = '';
  return state;
}, {});

const UploadCar = () => {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [modelFile, setModelFile] = useState(null);
  const [showroomSummary, setShowroomSummary] = useState(getDefaultShowroomSummary());
  const [supportPromptTemplate, setSupportPromptTemplate] = useState(getDefaultSupportPrompt());
  const [partHighlights, setPartHighlights] = useState('Bonnet, Doors, Wheels');
  const [manualCategory, setManualCategory] = useState('');
  const [isCategoryManual, setIsCategoryManual] = useState(false);
  const [performanceInputs, setPerformanceInputs] = useState(EMPTY_PERFORMANCE_SPEC);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { notifications, notify, dismissNotification } = useNotifications();
  const { user } = useAuth();

  const imagePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : ''),
    [imageFile],
  );
  const galleryPreviews = useMemo(
    () => galleryFiles.map((file) => URL.createObjectURL(file)),
    [galleryFiles],
  );

  const detectedCategory = useMemo(
    () =>
      inferVehicleCategory({
        name,
        imageName: imageFile?.name,
        existingCategory: '',
      }),
    [imageFile?.name, name],
  );

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(
    () => () => {
      galleryPreviews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    },
    [galleryPreviews],
  );

  const selectedCategoryKey = isCategoryManual ? manualCategory : detectedCategory.key;
  const selectedCategoryMeta = getVehicleCategoryMeta(selectedCategoryKey);
  const previewPerformance = useMemo(
    () =>
      resolveVehiclePerformance({
        name,
        year,
        category: selectedCategoryKey,
        ...performanceInputs,
      }),
    [name, performanceInputs, selectedCategoryKey, year],
  );
  const previewGallery = [imagePreview, ...galleryPreviews].filter(Boolean);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (user?.role !== 'ADMIN') {
      notify({
        type: 'error',
        eyebrow: 'Access Denied',
        title: 'Only admins can publish cars',
        message: 'Customer accounts are not allowed to upload or publish vehicle listings.',
      });
      return;
    }

    if (!imageFile || !modelFile) {
      notify({
        type: 'warning',
        eyebrow: 'Upload Check',
        title: 'Add both required files',
        message: 'Please select both a main vehicle image and a .glb 3D model file.',
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('year', year);
    formData.append('price', price);
    formData.append('category', selectedCategoryKey);
    formData.append('showroomSummary', showroomSummary);
    formData.append('supportPromptTemplate', supportPromptTemplate);
    formData.append('partHighlights', partHighlights);
    formData.append('imageFile', imageFile);
    formData.append('modelFile', modelFile);
    galleryFiles.forEach((file) => {
      formData.append('galleryFiles', file);
    });
    Object.entries(performanceInputs).forEach(([key, value]) => {
      if (String(value).trim()) {
        formData.append(key, value);
      }
    });

    let remoteSaved = false;
    let backendUnavailable = false;
    let remoteErrorMessage = '';
    let localSaved = false;

    try {
      const response = await authFetch('/cars', {
        method: 'POST',
        body: formData,
      });

      remoteSaved = response.ok;

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        remoteErrorMessage =
          data.message || 'The backend rejected this upload. Please check your permissions.';
      }
    } catch {
      backendUnavailable = true;
    }

    if (!remoteSaved && !backendUnavailable) {
      notify({
        type: 'error',
        eyebrow: 'Upload Failed',
        title: 'Vehicle publish was rejected',
        message: remoteErrorMessage,
      });
      setLoading(false);
      return;
    }

    if (backendUnavailable) {
      try {
        await saveVehicleUpload({
          name,
          year,
          price,
          category: selectedCategoryKey,
          imageFile,
          detailImageFiles: galleryFiles,
          modelFile,
          performanceInputs,
          showroomSummary,
          supportPromptTemplate,
          partHighlights,
        });
        localSaved = true;
      } catch {
        localSaved = false;
      }
    }

    if (remoteSaved || localSaved) {
      navigate('/available', {
        state: {
          notification: {
            type: 'success',
            eyebrow: name || 'New Vehicle',
            title: 'Car published successfully',
            message: remoteSaved
              ? 'The listing is live with its showroom summary, real image gallery, and rental support prompt.'
              : 'The backend is offline, but the car was saved locally with its gallery and showroom settings.',
            duration: 5800,
          },
        },
      });
      return;
    }

    notify({
      type: 'error',
      eyebrow: 'Upload Failed',
      title: 'Vehicle publish did not complete',
      message: 'The server and local storage fallback both failed. Please try again.',
    });
    setLoading(false);
  };

  return (
    <div
      className="min-vh-100"
      style={{
        background:
          'linear-gradient(135deg, rgba(15,23,42,0.03), rgba(239,68,68,0.07), rgba(249,115,22,0.06))',
      }}
    >
      <Navbar />
      <NotificationCenter
        notifications={notifications}
        onDismiss={dismissNotification}
      />

      <div className="container" style={{ paddingTop: '128px', paddingBottom: '48px' }}>
        <div className="row g-4 align-items-stretch">
          <div className="col-xl-7">
            <div className="card border-0 shadow-lg rounded-5">
              <div className="card-body p-4 p-lg-5">
                <div className="mb-4">
                  <p className="text-uppercase small fw-bold text-danger mb-2">Admin Upload</p>
                  <h2 className="fw-bold mb-2">Publish a final showroom-ready vehicle</h2>
                  <p className="text-muted mb-0">
                    Save the hero image, real image gallery, 3D model, and polished showroom copy
                    so customers can inspect the car properly before they chat or book.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label fw-semibold">Car Name</label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-4"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="e.g. Nissan GT-R Nismo"
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Year</label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-4"
                        value={year}
                        onChange={(event) => setYear(event.target.value)}
                        placeholder="2024"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Price / Day ($)</label>
                      <input
                        type="number"
                        className="form-control form-control-lg rounded-4"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        placeholder="275"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <div className="d-flex justify-content-between align-items-center">
                        <label className="form-label fw-semibold">Body Category</label>
                        <button
                          type="button"
                          className="btn btn-link btn-sm text-decoration-none"
                          onClick={() => {
                            setIsCategoryManual(false);
                            setManualCategory('');
                          }}
                        >
                          Use Smart Suggestion
                        </button>
                      </div>
                      <select
                        className="form-select form-select-lg rounded-4"
                        value={selectedCategoryKey}
                        onChange={(event) => {
                          setManualCategory(event.target.value);
                          setIsCategoryManual(true);
                        }}
                      >
                        <option value="uncategorized">Manual Review</option>
                        {VEHICLE_CATEGORIES.map((item) => (
                          <option key={item.key} value={item.key}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <div
                        className="rounded-4 p-3 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3"
                        style={{ background: selectedCategoryMeta.surface }}
                      >
                        <div>
                          <div className="d-flex align-items-center gap-2 fw-semibold text-dark mb-1">
                            <FiZap /> Suggested Category: {selectedCategoryMeta.label}
                          </div>
                          <p className="small text-muted mb-0">
                            {detectedCategory.reason}. Confidence: {detectedCategory.confidence}.
                            You can still override it manually before publishing.
                          </p>
                        </div>

                        <span className="badge rounded-pill text-bg-light px-3 py-2">
                          {selectedCategoryMeta.headline}
                        </span>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Main Vehicle Photo</label>
                      <input
                        type="file"
                        className="form-control form-control-lg rounded-4"
                        accept="image/*"
                        onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">3D Showroom Model (.GLB)</label>
                      <input
                        type="file"
                        className="form-control form-control-lg rounded-4"
                        accept=".glb,.gltf"
                        onChange={(event) => setModelFile(event.target.files?.[0] || null)}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Real Vehicle Gallery Images
                      </label>
                      <input
                        type="file"
                        className="form-control form-control-lg rounded-4"
                        accept="image/*"
                        multiple
                        onChange={(event) =>
                          setGalleryFiles(Array.from(event.target.files || []))
                        }
                      />
                      <div className="small text-muted mt-2">
                        Upload extra real photos so customers can compare the 3D view with the
                        actual car before booking.
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Showroom Summary</label>
                      <textarea
                        className="form-control rounded-4"
                        rows="3"
                        value={showroomSummary}
                        onChange={(event) => setShowroomSummary(event.target.value)}
                        placeholder="Describe the car using polished rental-ready language."
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Support Chat Starter</label>
                      <textarea
                        className="form-control rounded-4"
                        rows="3"
                        value={supportPromptTemplate}
                        onChange={(event) => setSupportPromptTemplate(event.target.value)}
                        placeholder="This becomes the quick message customers can send to support."
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Editable Part Highlights
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-4"
                        value={partHighlights}
                        onChange={(event) => setPartHighlights(event.target.value)}
                        placeholder="Bonnet, Doors, Spoiler, Mirror Caps"
                      />
                      <div className="small text-muted mt-2">
                        Use comma-separated labels to describe the main parts customers can
                        customize in the showroom.
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="rounded-4 border p-4">
                        <div className="d-flex align-items-center gap-2 fw-semibold mb-2">
                          <FiZap /> Real-World Performance Specs
                        </div>
                        <p className="text-muted small mb-3">
                          Keep these values realistic. The showroom board now shows standard
                          real-world metrics instead of game-only numbers.
                        </p>

                        <div className="row g-3">
                          {PERFORMANCE_SPEC_FIELDS.map((field) => (
                            <div key={field.key} className="col-md-6">
                              <label className="form-label fw-semibold">
                                {field.label} ({field.unit})
                              </label>
                              <input
                                type="number"
                                min={field.min}
                                max={field.max}
                                step={field.step}
                                className="form-control rounded-4"
                                value={performanceInputs[field.key]}
                                onChange={(event) =>
                                  setPerformanceInputs((current) => ({
                                    ...current,
                                    [field.key]: event.target.value,
                                  }))
                                }
                                placeholder={field.placeholder}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="rounded-4 bg-light p-3">
                        <div className="d-flex align-items-center gap-2 fw-semibold mb-2">
                          <FiLayers /> Showroom model requirements
                        </div>
                        <p className="text-muted small mb-0">
                          For separate part editing, export the GLB with distinct mesh names such
                          as <code>door</code>, <code>hood</code>, <code>bonnet</code>,{' '}
                          <code>trunk</code>, <code>wheel</code>, <code>spoiler</code>,{' '}
                          <code>mirror</code>, <code>skirt</code>, <code>front bumper</code>, or{' '}
                          <code>rear bumper</code>.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-danger rounded-pill fw-bold px-4 py-3 mt-4"
                    disabled={loading}
                  >
                    {loading ? 'Uploading vehicle...' : 'Publish Car Listing'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-xl-5">
            <div className="card border-0 shadow-lg rounded-5 h-100 overflow-hidden">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Vehicle preview"
                  className="w-100"
                  style={{ height: '280px', objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="d-flex flex-column align-items-center justify-content-center text-center p-5"
                  style={{
                    height: '280px',
                    background:
                      'linear-gradient(135deg, rgba(15,23,42,0.88), rgba(239,68,68,0.72))',
                    color: '#fff',
                  }}
                >
                  <FiUploadCloud size={48} className="mb-3" />
                  <h4 className="fw-bold">Live Vehicle Preview</h4>
                  <p className="text-white-50 mb-0">
                    Add a main photo to preview how the car will appear in the finished showroom.
                  </p>
                </div>
              )}

              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                  <div>
                    <p className="text-uppercase small fw-bold text-danger mb-2">Listing Snapshot</p>
                    <h3 className="fw-bold mb-1">{name || 'New Vehicle'}</h3>
                    <p className="text-muted mb-0">{selectedCategoryMeta.description}</p>
                  </div>
                  <span
                    className="badge rounded-pill px-3 py-2 text-dark"
                    style={{ background: selectedCategoryMeta.surface }}
                  >
                    {selectedCategoryMeta.label}
                  </span>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-sm-6">
                    <div className="rounded-4 bg-light p-3 h-100">
                      <div className="text-muted small mb-1">Year</div>
                      <div className="fw-semibold">{year || 'Not set'}</div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="rounded-4 bg-light p-3 h-100">
                      <div className="text-muted small mb-1">Rate</div>
                      <div className="fw-semibold">{price ? `$${price} / day` : 'Not set'}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-4 border p-3 mb-4">
                  <div className="d-flex align-items-center gap-2 fw-semibold mb-2">
                    <FiImage /> Real Image Gallery
                  </div>
                  {previewGallery.length ? (
                    <div className="d-flex flex-wrap gap-2">
                      {previewGallery.map((previewUrl, index) => (
                        <img
                          key={previewUrl}
                          src={previewUrl}
                          alt={`Preview ${index + 1}`}
                          className="rounded-4 border"
                          style={{ width: '88px', height: '72px', objectFit: 'cover' }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="small text-muted">
                      The main photo and extra gallery images will appear here.
                    </div>
                  )}
                </div>

                <div className="rounded-4 border p-3 mb-4">
                  <div className="d-flex align-items-center gap-2 fw-semibold mb-2">
                    <FiMessageSquare /> Standard Showroom Copy
                  </div>
                  <p className="text-muted small mb-3">{showroomSummary}</p>
                  <div className="small text-muted">
                    Support starter: <strong>{supportPromptTemplate}</strong>
                  </div>
                </div>

                <div className="rounded-4 border p-3 mb-4">
                  <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
                    <div>
                      <div className="fw-semibold">Showroom Performance Preview</div>
                      <div className="small text-muted">{previewPerformance.sourceLabel}</div>
                    </div>
                    <span className="badge rounded-pill text-bg-dark px-3 py-2">
                      Rental-ready stats
                    </span>
                  </div>

                  <div className="row g-2">
                    {PERFORMANCE_SPEC_FIELDS.map((field) => (
                      <div key={field.key} className="col-sm-6">
                        <div className="rounded-4 bg-light p-3 h-100">
                          <div className="text-muted small mb-1">{field.label}</div>
                          <div className="fw-semibold">
                            {previewPerformance[field.key]}
                            {field.unit === '/10' ? field.unit : ` ${field.unit}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-4 border p-3">
                  <div className="d-flex align-items-center gap-2 fw-semibold mb-3">
                    <FiCheckCircle /> Publish checklist
                  </div>
                  <div className="small text-muted d-grid gap-2">
                    <span>{imageFile ? 'Main vehicle photo attached' : 'Add a main listing photo'}</span>
                    <span>{galleryFiles.length ? `${galleryFiles.length} real gallery photos attached` : 'Optional real gallery photos are still empty'}</span>
                    <span>{modelFile ? '3D model attached' : 'Add a GLB showroom model'}</span>
                    <span>{partHighlights.trim() ? 'Editable part highlights are ready' : 'Add editable part labels'}</span>
                    <span>Performance board uses real-world metrics only</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadCar;

import { buildBackendAssetUrl } from './api';

const VEHICLE_DB_NAME = 'ceylon-autocar-vehicle-library';
const VEHICLE_STORE_NAME = 'vehicles';
const VEHICLE_DB_VERSION = 1;

const DEFAULT_SHOWROOM_SUMMARY =
  'A polished rental-ready showroom build with live 3D interaction, real photo support, and a customer-focused booking flow.';
const DEFAULT_SUPPORT_PROMPT =
  'Hello, I am interested in this car. Please share availability, rental requirements, and the best package for my trip.';

const createId = (prefix = 'vehicle') => {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const normalizeText = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const parseStringArray = (value, options = {}) => {
  const { preserveAssetUrls = false } = options;

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return [];
    }

    if (preserveAssetUrls && /^(data:|blob:)/i.test(trimmedValue)) {
      return [trimmedValue];
    }

    if (trimmedValue.startsWith('[')) {
      try {
        return parseStringArray(JSON.parse(trimmedValue), options);
      } catch {
        return trimmedValue
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    return trimmedValue
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const uniqueStrings = (values) => [...new Set(values.filter(Boolean))];

const normalizeAssetValue = (value = '') => {
  const trimmedValue = String(value || '').trim();

  if (!trimmedValue) {
    return '';
  }

  if (/^(data:|blob:)/i.test(trimmedValue)) {
    return trimmedValue;
  }

  return buildBackendAssetUrl(trimmedValue);
};

const normalizeVehicleRecord = (vehicle = {}) => {
  const galleryImages = uniqueStrings([
    normalizeAssetValue(vehicle.image),
    ...parseStringArray(vehicle.galleryImages, { preserveAssetUrls: true }).map((item) =>
      normalizeAssetValue(item),
    ),
    ...parseStringArray(vehicle.realImages, { preserveAssetUrls: true }).map((item) =>
      normalizeAssetValue(item),
    ),
  ]);
  const partHighlights = uniqueStrings(parseStringArray(vehicle.partHighlights));

  return {
    ...vehicle,
    id: String(vehicle.id || createId('vehicle')),
    name: String(vehicle.name || 'Untitled Vehicle').trim(),
    year: String(vehicle.year || '').trim(),
    price: Number(vehicle.price) || 0,
    category: String(vehicle.category || vehicle.categoryKey || 'uncategorized').trim(),
    image: galleryImages[0] || '',
    galleryImages,
    modelUrl: normalizeAssetValue(vehicle.modelUrl),
    showroomSummary: String(vehicle.showroomSummary || DEFAULT_SHOWROOM_SUMMARY).trim(),
    supportPromptTemplate: String(
      vehicle.supportPromptTemplate || DEFAULT_SUPPORT_PROMPT,
    ).trim(),
    partHighlights,
    inventorySource: String(vehicle.inventorySource || 'LOCAL').trim(),
    createdAt: vehicle.createdAt || new Date().toISOString(),
  };
};

const DEFAULT_VEHICLES = [
  normalizeVehicleRecord({
    id: 'demo-bmw-m4',
    name: 'BMW M4 Coupe',
    year: '2024',
    price: 400,
    category: 'sports',
    image:
      'https://images.unsplash.com/photo-1617531653520-4893f7f6cf5d?q=80&w=1600&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1617531653520-4893f7f6cf5d?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1600&auto=format&fit=crop',
    ],
    modelUrl: '/generic_car.glb',
    horsepower: 503,
    topSpeed: 180,
    zeroToSixty: 3.8,
    quarterMile: 11.8,
    brakePower: 9.1,
    brakeResponse: 8.8,
    showroomSummary:
      'Premium coupe with separate door panels, bonnet interaction, detailed color zones, and a clean rental-ready presentation.',
    supportPromptTemplate:
      'Hello, I want to rent the BMW M4 Coupe. Please share the daily rate, deposit, and availability for my dates.',
    partHighlights: ['Bonnet', 'Front doors', 'Front splitter', 'Rear diffuser', 'Wheels'],
    inventorySource: 'LOCAL_DEMO',
    createdAt: '2026-01-03T09:00:00.000Z',
  }),
  normalizeVehicleRecord({
    id: 'demo-nissan-gtr',
    name: 'Nissan GT-R Nismo',
    year: '2024',
    price: 500,
    category: 'sports',
    image:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1600&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1600&auto=format&fit=crop',
    ],
    modelUrl: '/nissan_350z_rocket_bunny.glb',
    horsepower: 600,
    topSpeed: 205,
    zeroToSixty: 2.9,
    quarterMile: 11,
    brakePower: 9.6,
    brakeResponse: 9.3,
    showroomSummary:
      'Track-focused GT-R setup with dramatic aero details, separate panel detection, and a real-photo gallery for customer confidence.',
    supportPromptTemplate:
      'Hello, I am interested in the Nissan GT-R Nismo. Please confirm availability, mileage limits, and the best package for a weekend rental.',
    partHighlights: ['Doors', 'Bonnet', 'Spoiler', 'Front bumper', 'Rear diffuser', 'Mirror caps'],
    inventorySource: 'LOCAL_DEMO',
    createdAt: '2026-01-08T10:30:00.000Z',
  }),
  normalizeVehicleRecord({
    id: 'demo-toyota-supra',
    name: 'Toyota GR Supra',
    year: '2023',
    price: 300,
    category: 'sports',
    image:
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1600&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=1600&auto=format&fit=crop',
    ],
    modelUrl: '/generic_car.glb',
    horsepower: 382,
    topSpeed: 155,
    zeroToSixty: 3.9,
    quarterMile: 12.4,
    brakePower: 8.7,
    brakeResponse: 8.5,
    showroomSummary:
      'Balanced sports coupe with a softer street-focused setup, detail finish controls, and a real image strip customers can browse before booking.',
    supportPromptTemplate:
      'Hello, I would like to know the Toyota GR Supra rental options, deposit amount, and delivery availability.',
    partHighlights: ['Doors', 'Side skirts', 'Mirror caps', 'Wheels'],
    inventorySource: 'LOCAL_DEMO',
    createdAt: '2026-01-12T15:45:00.000Z',
  }),
];

const openVehicleDb = () =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }

    const request = window.indexedDB.open(VEHICLE_DB_NAME, VEHICLE_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(VEHICLE_STORE_NAME)) {
        db.createObjectStore(VEHICLE_STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Vehicle database could not open.'));
  });

const withStore = async (mode, handler) => {
  const db = await openVehicleDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(VEHICLE_STORE_NAME, mode);
    const store = transaction.objectStore(VEHICLE_STORE_NAME);

    let settled = false;

    const finishResolve = (value) => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };

    const finishReject = (error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    };

    transaction.oncomplete = () => finishResolve(undefined);
    transaction.onerror = () =>
      finishReject(transaction.error || new Error('Vehicle store transaction failed.'));
    transaction.onabort = () =>
      finishReject(transaction.error || new Error('Vehicle store transaction aborted.'));

    Promise.resolve(handler(store, finishResolve, finishReject)).catch(finishReject);
  }).finally(() => {
    db.close();
  });
};

const getAllStoredVehiclesRaw = async () =>
  withStore('readonly', (store, resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error('Could not read vehicles.'));
  });

const getStoredVehicleRawById = async (vehicleId) =>
  withStore('readonly', (store, resolve, reject) => {
    const request = store.get(vehicleId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error('Could not read the vehicle.'));
  });

const saveVehicleRaw = async (vehicle) =>
  withStore('readwrite', (store, resolve, reject) => {
    const request = store.put(vehicle);
    request.onsuccess = () => resolve(vehicle);
    request.onerror = () => reject(request.error || new Error('Could not save the vehicle.'));
  });

const countStoredVehicles = async () =>
  withStore('readonly', (store, resolve, reject) => {
    const request = store.count();
    request.onsuccess = () => resolve(Number(request.result || 0));
    request.onerror = () => reject(request.error || new Error('Could not count vehicles.'));
  });

const vehicleAssetsNeedRepair = (originalVehicle = {}, normalizedVehicle = {}) => {
  const originalImage = String(originalVehicle.image || '').trim();
  const originalModelUrl = String(originalVehicle.modelUrl || '').trim();
  const originalGalleryImages = uniqueStrings([
    originalImage,
    ...parseStringArray(originalVehicle.galleryImages, { preserveAssetUrls: true }),
    ...parseStringArray(originalVehicle.realImages, { preserveAssetUrls: true }),
  ]);

  if (originalImage !== normalizedVehicle.image) {
    return true;
  }

  if (originalModelUrl !== normalizedVehicle.modelUrl) {
    return true;
  }

  if (originalGalleryImages.length !== normalizedVehicle.galleryImages.length) {
    return true;
  }

  return originalGalleryImages.some(
    (galleryImage, index) => galleryImage !== normalizedVehicle.galleryImages[index],
  );
};

const repairStoredVehicle = async (vehicle) => {
  const normalizedVehicle = normalizeVehicleRecord(vehicle);

  if (vehicleAssetsNeedRepair(vehicle, normalizedVehicle)) {
    await saveVehicleRaw(normalizedVehicle).catch(() => {});
  }

  return normalizedVehicle;
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('File conversion failed.'));
    reader.readAsDataURL(file);
  });

export const seedLocalVehicleLibrary = async () => {
  const existingCount = await countStoredVehicles().catch(() => 0);

  if (existingCount > 0) {
    return;
  }

  await Promise.all(DEFAULT_VEHICLES.map((vehicle) => saveVehicleRaw(vehicle)));
};

export const listStoredVehicles = async () => {
  await seedLocalVehicleLibrary().catch(() => {});
  const storedVehicles = await getAllStoredVehiclesRaw().catch(() => []);
  const repairedVehicles = [];

  for (const vehicle of storedVehicles) {
    repairedVehicles.push(await repairStoredVehicle(vehicle));
  }

  return repairedVehicles
    .sort(
      (leftVehicle, rightVehicle) =>
        new Date(rightVehicle.createdAt || 0).getTime() -
        new Date(leftVehicle.createdAt || 0).getTime(),
    );
};

export const findStoredVehicleById = async (vehicleId) => {
  if (!vehicleId) {
    return null;
  }

  await seedLocalVehicleLibrary().catch(() => {});
  const vehicle = await getStoredVehicleRawById(String(vehicleId)).catch(() => null);
  return vehicle ? repairStoredVehicle(vehicle) : null;
};

export const saveVehicleUpload = async ({
  name,
  year,
  price,
  category,
  imageFile,
  detailImageFiles = [],
  modelFile,
  performanceInputs = {},
  showroomSummary,
  supportPromptTemplate,
  partHighlights,
}) => {
  const heroImage = await fileToDataUrl(imageFile);
  const extraImages = await Promise.all(
    detailImageFiles.slice(0, 8).map((file) => fileToDataUrl(file)),
  );
  const modelUrl = modelFile ? await fileToDataUrl(modelFile) : '';

  const record = normalizeVehicleRecord({
    id: createId('vehicle'),
    name,
    year,
    price,
    category,
    image: heroImage,
    galleryImages: [heroImage, ...extraImages],
    modelUrl,
    showroomSummary,
    supportPromptTemplate,
    partHighlights,
    inventorySource: 'LOCAL_UPLOAD',
    createdAt: new Date().toISOString(),
    ...performanceInputs,
  });

  await saveVehicleRaw(record);
  return record;
};

const mergeVehiclePair = (preferredVehicle, secondaryVehicle) =>
  normalizeVehicleRecord({
    ...secondaryVehicle,
    ...preferredVehicle,
    galleryImages: uniqueStrings([
      ...parseStringArray(preferredVehicle.galleryImages),
      preferredVehicle.image,
      ...parseStringArray(secondaryVehicle.galleryImages),
      secondaryVehicle.image,
    ]),
    partHighlights: uniqueStrings([
      ...parseStringArray(secondaryVehicle.partHighlights),
      ...parseStringArray(preferredVehicle.partHighlights),
    ]),
  });

export const mergeVehicleCollections = (preferredVehicles = [], secondaryVehicles = []) => {
  const mergedMap = new Map();

  [...secondaryVehicles, ...preferredVehicles].forEach((vehicle) => {
    const normalizedVehicle = normalizeVehicleRecord(vehicle);
    const dedupeKey = `${normalizeText(normalizedVehicle.name)}-${
      normalizedVehicle.year || ''
    }-${normalizedVehicle.price || 0}`;
    const existingVehicle = mergedMap.get(dedupeKey);

    mergedMap.set(
      dedupeKey,
      existingVehicle
        ? mergeVehiclePair(normalizedVehicle, existingVehicle)
        : normalizedVehicle,
    );
  });

  return [...mergedMap.values()].sort(
    (leftVehicle, rightVehicle) =>
      new Date(rightVehicle.createdAt || 0).getTime() -
      new Date(leftVehicle.createdAt || 0).getTime(),
  );
};

export const getDefaultShowroomSummary = () => DEFAULT_SHOWROOM_SUMMARY;

export const getDefaultSupportPrompt = () => DEFAULT_SUPPORT_PROMPT;

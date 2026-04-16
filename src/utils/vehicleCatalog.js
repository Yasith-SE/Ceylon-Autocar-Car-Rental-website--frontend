export const VEHICLE_CATEGORIES = [
  {
    key: 'sports',
    label: 'Sports',
    headline: 'Track-inspired coupes and performance builds',
    description: 'Low, aggressive cars built for style, speed, and showroom impact.',
    accent: '#ef4444',
    surface: 'rgba(239, 68, 68, 0.12)',
    keywords: [
      'sports',
      'sport',
      'coupe',
      'roadster',
      'convertible',
      'nismo',
      'gtr',
      'gt-r',
      '350z',
      '370z',
      'supra',
      'mustang',
      'camaro',
      'brz',
      '86',
      'rx7',
      'rx-7',
      'ferrari',
      'lamborghini',
      'mclaren',
      'porsche',
    ],
  },
  {
    key: 'sedan',
    label: 'Sedan',
    headline: 'Balanced daily comfort with premium practicality',
    description: 'Refined everyday cars for city drives, business trips, and families.',
    accent: '#2563eb',
    surface: 'rgba(37, 99, 235, 0.12)',
    keywords: [
      'sedan',
      'saloon',
      'civic',
      'corolla',
      'accord',
      'camry',
      'prius',
      'elantra',
      'sonata',
      'a4',
      'a6',
      '3 series',
      '5 series',
      'model s',
    ],
  },
  {
    key: 'suv',
    label: 'SUV',
    headline: 'High-riding utility vehicles for comfort and road presence',
    description: 'Confident family and adventure-ready vehicles with space and versatility.',
    accent: '#0891b2',
    surface: 'rgba(8, 145, 178, 0.12)',
    keywords: [
      'suv',
      'crossover',
      '4x4',
      'jeep',
      'wrangler',
      'fortuner',
      'prado',
      'land cruiser',
      'rav4',
      'cr-v',
      'sportage',
      'tucson',
      'cx-5',
      'x5',
      'range rover',
      'discovery',
    ],
  },
  {
    key: 'hatchback',
    label: 'Hatchback',
    headline: 'Compact city cars with efficient, flexible packaging',
    description: 'Smart urban cars that stay practical without taking up too much space.',
    accent: '#14b8a6',
    surface: 'rgba(20, 184, 166, 0.12)',
    keywords: [
      'hatchback',
      'hatch',
      'golf',
      'fit',
      'jazz',
      'yaris',
      'polo',
      'swift',
      'mini',
      'mazda2',
      'mazda 2',
    ],
  },
  {
    key: 'pickup',
    label: 'Pickup',
    headline: 'Utility trucks for work, cargo, and heavy-duty travel',
    description: 'Durable trucks built to carry gear, crews, and weekend adventure loads.',
    accent: '#f97316',
    surface: 'rgba(249, 115, 22, 0.12)',
    keywords: [
      'pickup',
      'truck',
      'ute',
      'hilux',
      'ranger',
      'navara',
      'amarok',
      'l200',
      'd-max',
      'dmax',
      'raptor',
    ],
  },
  {
    key: 'luxury',
    label: 'Luxury',
    headline: 'Executive comfort and flagship prestige',
    description: 'High-end cabins, polished finishes, and premium transport experiences.',
    accent: '#a855f7',
    surface: 'rgba(168, 85, 247, 0.12)',
    keywords: [
      'luxury',
      'executive',
      'premium',
      'limousine',
      'maybach',
      's class',
      's-class',
      '7 series',
      'a8',
      'ghost',
      'phantom',
      'continental',
    ],
  },
];

export const SHOWROOM_SWATCHES = [
  { label: 'Velocity Yellow', value: '#f4c20d' },
  { label: 'Racing Red', value: '#d7263d' },
  { label: 'Midnight Black', value: '#15181d' },
  { label: 'Pearl White', value: '#f4f5f7' },
  { label: 'Ocean Blue', value: '#2563eb' },
  { label: 'Gunmetal', value: '#4b5563' },
  { label: 'Electric Lime', value: '#84cc16' },
  { label: 'Sunset Orange', value: '#f97316' },
];

export const PERFORMANCE_SPEC_FIELDS = [
  {
    key: 'horsepower',
    label: 'Horsepower',
    unit: 'HP',
    placeholder: '565',
    min: 60,
    max: 2000,
    step: '1',
  },
  {
    key: 'topSpeed',
    label: 'Top Speed',
    unit: 'MPH',
    placeholder: '196',
    min: 70,
    max: 280,
    step: '1',
  },
  {
    key: 'zeroToSixty',
    label: '0 - 60 MPH',
    unit: 'SEC',
    placeholder: '2.9',
    min: 2,
    max: 15,
    step: '0.1',
  },
  {
    key: 'quarterMile',
    label: '1/4 Mile',
    unit: 'SEC',
    placeholder: '11.0',
    min: 8,
    max: 20,
    step: '0.1',
  },
  {
    key: 'brakePower',
    label: 'Brake Power',
    unit: '/10',
    placeholder: '9.4',
    min: 1,
    max: 10,
    step: '0.1',
  },
  {
    key: 'brakeResponse',
    label: 'Brake Response',
    unit: '/10',
    placeholder: '9.1',
    min: 1,
    max: 10,
    step: '0.1',
  },
];

const DEFAULT_CATEGORY = {
  key: 'uncategorized',
  label: 'Uncategorized',
  headline: 'Body style needs a manual review',
  description: 'This listing does not match a strong body-style signal yet.',
  accent: '#64748b',
  surface: 'rgba(100, 116, 139, 0.12)',
};

const CATEGORY_PERFORMANCE_BASELINES = {
  sports: {
    horsepower: 420,
    topSpeed: 182,
    zeroToSixty: 4,
    quarterMile: 12.1,
    brakePower: 8.9,
    brakeResponse: 8.6,
  },
  sedan: {
    horsepower: 220,
    topSpeed: 139,
    zeroToSixty: 7.1,
    quarterMile: 15.3,
    brakePower: 7.2,
    brakeResponse: 6.9,
  },
  suv: {
    horsepower: 285,
    topSpeed: 146,
    zeroToSixty: 7.2,
    quarterMile: 15.1,
    brakePower: 7.5,
    brakeResponse: 7.2,
  },
  hatchback: {
    horsepower: 175,
    topSpeed: 129,
    zeroToSixty: 7.7,
    quarterMile: 15.8,
    brakePower: 6.9,
    brakeResponse: 6.8,
  },
  pickup: {
    horsepower: 265,
    topSpeed: 124,
    zeroToSixty: 8.4,
    quarterMile: 16.3,
    brakePower: 7.1,
    brakeResponse: 6.8,
  },
  luxury: {
    horsepower: 390,
    topSpeed: 166,
    zeroToSixty: 4.8,
    quarterMile: 13.1,
    brakePower: 8.3,
    brakeResponse: 8,
  },
  uncategorized: {
    horsepower: 250,
    topSpeed: 142,
    zeroToSixty: 6.8,
    quarterMile: 14.7,
    brakePower: 7.3,
    brakeResponse: 7,
  },
};

const PERFORMANCE_PRESETS = [
  {
    matchers: ['gt r nismo', 'gtr nismo', 'nissan gt r', 'nissan gtr', 'gt-r'],
    values: {
      horsepower: 600,
      topSpeed: 205,
      zeroToSixty: 2.9,
      quarterMile: 11,
      brakePower: 9.6,
      brakeResponse: 9.3,
    },
  },
  {
    matchers: ['350z', 'nis350z', 'fairlady z'],
    values: {
      horsepower: 306,
      topSpeed: 155,
      zeroToSixty: 5.1,
      quarterMile: 13.7,
      brakePower: 8,
      brakeResponse: 7.7,
    },
  },
  {
    matchers: ['370z'],
    values: {
      horsepower: 332,
      topSpeed: 155,
      zeroToSixty: 4.7,
      quarterMile: 13.3,
      brakePower: 8.2,
      brakeResponse: 7.9,
    },
  },
  {
    matchers: ['porsche 911 gt3 rs', '911 gt3 rs', 'gt3 rs'],
    values: {
      horsepower: 518,
      topSpeed: 184,
      zeroToSixty: 3,
      quarterMile: 11.1,
      brakePower: 9.8,
      brakeResponse: 9.5,
    },
  },
  {
    matchers: ['supra', 'gr supra'],
    values: {
      horsepower: 382,
      topSpeed: 155,
      zeroToSixty: 3.9,
      quarterMile: 12.4,
      brakePower: 8.7,
      brakeResponse: 8.5,
    },
  },
  {
    matchers: ['mustang gt', 'mustang'],
    values: {
      horsepower: 480,
      topSpeed: 155,
      zeroToSixty: 4.1,
      quarterMile: 12.4,
      brakePower: 8.4,
      brakeResponse: 8,
    },
  },
  {
    matchers: ['camaro ss', 'camaro zl1', 'camaro'],
    values: {
      horsepower: 455,
      topSpeed: 165,
      zeroToSixty: 4,
      quarterMile: 12.3,
      brakePower: 8.5,
      brakeResponse: 8.1,
    },
  },
  {
    matchers: ['mclaren'],
    values: {
      horsepower: 612,
      topSpeed: 204,
      zeroToSixty: 3,
      quarterMile: 10.9,
      brakePower: 9.6,
      brakeResponse: 9.4,
    },
  },
  {
    matchers: ['ferrari'],
    values: {
      horsepower: 660,
      topSpeed: 205,
      zeroToSixty: 3,
      quarterMile: 10.8,
      brakePower: 9.7,
      brakeResponse: 9.4,
    },
  },
  {
    matchers: ['lamborghini', 'huracan', 'aventador'],
    values: {
      horsepower: 640,
      topSpeed: 202,
      zeroToSixty: 3,
      quarterMile: 10.9,
      brakePower: 9.7,
      brakeResponse: 9.3,
    },
  },
  {
    matchers: ['civic type r', 'type r'],
    values: {
      horsepower: 315,
      topSpeed: 169,
      zeroToSixty: 5.1,
      quarterMile: 13.6,
      brakePower: 8.4,
      brakeResponse: 8.2,
    },
  },
];

const PERFORMANCE_FIELD_NAME_MAP = {
  horsepower: ['horsepower', 'horsePower', 'hp'],
  topSpeed: ['topSpeed', 'topSpeedMph', 'top_speed', 'top_speed_mph'],
  zeroToSixty: [
    'zeroToSixty',
    'zeroTo60',
    'zero_to_sixty',
    'zero_to_60',
    'acceleration0To60',
    'acceleration_0_60',
  ],
  quarterMile: [
    'quarterMile',
    'quarterMileSeconds',
    'quarter_mile',
    'quarter_mile_seconds',
  ],
  brakePower: ['brakePower', 'brakingPower', 'brake_power'],
  brakeResponse: ['brakeResponse', 'brakingResponse', 'brake_response'],
};

const PERFORMANCE_KEY_COUNT = Object.keys(PERFORMANCE_FIELD_NAME_MAP).length;

const normalizeText = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const parseNumericValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number.parseFloat(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const clampValue = (value, min, max) => Math.min(max, Math.max(min, value));

const roundToStep = (value, step = 1) =>
  Math.round(value / step) * step;

const readNumericField = (vehicle, fieldNames) => {
  for (const fieldName of fieldNames) {
    const numericValue = parseNumericValue(vehicle?.[fieldName]);

    if (numericValue !== null) {
      return numericValue;
    }
  }

  return null;
};

const findPerformancePreset = (referenceText = '') =>
  PERFORMANCE_PRESETS.find((preset) =>
    preset.matchers.some((matcher) => referenceText.includes(matcher)),
  );

const sanitizePerformanceProfile = (values) => ({
  horsepower: Math.round(clampValue(values.horsepower, 60, 2000)),
  topSpeed: Math.round(clampValue(values.topSpeed, 70, 280)),
  zeroToSixty: roundToStep(clampValue(values.zeroToSixty, 2, 15), 0.1),
  quarterMile: roundToStep(clampValue(values.quarterMile, 8, 20), 0.1),
  brakePower: roundToStep(clampValue(values.brakePower, 1, 10), 0.1),
  brakeResponse: roundToStep(clampValue(values.brakeResponse, 1, 10), 0.1),
});

export const normalizeVehicleCategory = (value = '') => {
  const normalizedValue = normalizeText(value);
  const directMatch = VEHICLE_CATEGORIES.find(
    (category) =>
      category.key === normalizedValue ||
      category.label.toLowerCase() === normalizedValue,
  );

  return directMatch?.key || DEFAULT_CATEGORY.key;
};

export const getVehicleCategoryMeta = (value = '') => {
  const categoryKey = normalizeVehicleCategory(value);
  return (
    VEHICLE_CATEGORIES.find((category) => category.key === categoryKey) ||
    DEFAULT_CATEGORY
  );
};

export const inferVehicleCategory = ({
  name = '',
  imageName = '',
  existingCategory = '',
}) => {
  if (existingCategory) {
    const existingMeta = getVehicleCategoryMeta(existingCategory);
    return {
      key: existingMeta.key,
      label: existingMeta.label,
      confidence: 'Confirmed',
      reason: 'Saved on the listing',
    };
  }

  const referenceText = normalizeText(`${name} ${imageName}`);
  let bestMatch = DEFAULT_CATEGORY;
  let bestScore = 0;

  VEHICLE_CATEGORIES.forEach((category) => {
    const score = category.keywords.reduce((total, keyword) => {
      return total + (referenceText.includes(keyword) ? 1 : 0);
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  });

  if (!bestScore) {
    return {
      key: DEFAULT_CATEGORY.key,
      label: DEFAULT_CATEGORY.label,
      confidence: 'Low',
      reason: 'No strong body-style keyword detected',
    };
  }

  return {
    key: bestMatch.key,
    label: bestMatch.label,
    confidence: bestScore > 1 ? 'High' : 'Medium',
    reason: `Detected from listing keywords in "${name || imageName}"`,
  };
};

export const enrichVehicleRecord = (vehicle = {}) => {
  const inferredCategory = inferVehicleCategory({
    name: vehicle.name,
    imageName: vehicle.image,
    existingCategory: vehicle.category,
  });
  const categoryMeta = getVehicleCategoryMeta(inferredCategory.key);
  const performanceProfile = resolveVehiclePerformance({
    ...vehicle,
    categoryKey: categoryMeta.key,
    categoryLabel: categoryMeta.label,
  });

  return {
    ...vehicle,
    categoryKey: categoryMeta.key,
    categoryLabel: categoryMeta.label,
    categoryMeta,
    performanceProfile,
  };
};

export const resolveVehiclePerformance = (vehicle = {}) => {
  const categoryMeta = getVehicleCategoryMeta(
    vehicle.categoryKey || vehicle.categoryLabel || vehicle.category,
  );
  const referenceText = normalizeText(
    `${vehicle.name} ${vehicle.categoryLabel || categoryMeta.label} ${vehicle.year}`,
  );
  const matchedPreset = findPerformancePreset(referenceText);
  const fallbackProfile =
    matchedPreset?.values ||
    CATEGORY_PERFORMANCE_BASELINES[categoryMeta.key] ||
    CATEGORY_PERFORMANCE_BASELINES.uncategorized;

  const explicitValues = Object.entries(PERFORMANCE_FIELD_NAME_MAP).reduce(
    (values, [key, fieldNames]) => {
      const numericValue = readNumericField(vehicle, fieldNames);

      if (numericValue !== null) {
        values[key] = numericValue;
      }

      return values;
    },
    {},
  );

  const explicitValueCount = Object.keys(explicitValues).length;
  let source = 'category';
  let sourceLabel = 'Category-based showroom estimate';
  let note =
    'Real-world rental showroom estimate generated from the vehicle category.';

  if (matchedPreset) {
    source = 'preset';
    sourceLabel = 'Model-based showroom estimate';
    note =
      'Real-world rental showroom estimate matched from the vehicle name and class.';
  }

  if (explicitValueCount > 0) {
    source = explicitValueCount === PERFORMANCE_KEY_COUNT ? 'listing' : 'mixed';
    sourceLabel =
      explicitValueCount === PERFORMANCE_KEY_COUNT
        ? 'Vehicle listing spec'
        : 'Listing spec with showroom estimate';
    note =
      explicitValueCount === PERFORMANCE_KEY_COUNT
        ? 'Saved vehicle specs are powering this showroom board.'
        : 'Saved vehicle specs are shown first, with any missing values estimated for continuity.';
  }

  return {
    ...sanitizePerformanceProfile({
      ...fallbackProfile,
      ...explicitValues,
    }),
    source,
    sourceLabel,
    note,
  };
};

export const summarizeCategories = (vehicles = []) => {
  const base = VEHICLE_CATEGORIES.map((category) => ({
    ...category,
    total: 0,
  }));

  vehicles.forEach((vehicle) => {
    const enrichedVehicle = enrichVehicleRecord(vehicle);
    const match = base.find((category) => category.key === enrichedVehicle.categoryKey);

    if (match) {
      match.total += 1;
    }
  });

  return base;
};

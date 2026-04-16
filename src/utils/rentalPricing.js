const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const RENTAL_PURPOSE_OPTIONS = [
  {
    key: 'wedding',
    label: 'Wedding / Bridal',
    description: 'Premium event hire for weddings, bridal entry, or formal celebrations.',
    multiplier: 1.22,
    accentColor: '#d7263d',
  },
  {
    key: 'trip',
    label: 'Trip / Vacation',
    description: 'Leisure travel for outstation trips, sightseeing, and relaxed getaways.',
    multiplier: 1.08,
    accentColor: '#2563eb',
  },
  {
    key: 'foreign-travel',
    label: 'Foreign Guest Travel',
    description: 'Touring Sri Lanka with overseas guests, airport arrivals, or hosted travel.',
    multiplier: 1.12,
    accentColor: '#0f766e',
  },
  {
    key: 'business',
    label: 'Business / Executive',
    description: 'Meetings, client pickups, and professional corporate use.',
    multiplier: 1.05,
    accentColor: '#111827',
  },
  {
    key: 'family',
    label: 'Family Function',
    description: 'Temple visits, family events, homecoming functions, or day-outs.',
    multiplier: 1,
    accentColor: '#7c3aed',
  },
  {
    key: 'airport',
    label: 'Airport Transfer',
    description: 'Short transfers for airport pickup, drop-off, and city hotel movement.',
    multiplier: 0.96,
    accentColor: '#f97316',
  },
  {
    key: 'photoshoot',
    label: 'Photoshoot / Video',
    description: 'Brand shoots, wedding shoots, reels, and other appearance-focused sessions.',
    multiplier: 1.18,
    accentColor: '#db2777',
  },
  {
    key: 'long-tour',
    label: 'Long Tour / Pilgrimage',
    description: 'Multi-city journeys, long tours, or long-distance religious travel.',
    multiplier: 1.15,
    accentColor: '#84cc16',
  },
];

export const EMPTY_RENTAL_REQUEST = {
  pickupLocation: '',
  pickupPlaceId: '',
  pickupCoordinates: null,
  dropoffLocation: '',
  dropoffPlaceId: '',
  dropoffCoordinates: null,
  destinationPlan: '',
  purposeCategory: 'trip',
  purposeDetails: '',
  estimatedDistanceKm: '120',
  startDate: '',
  endDate: '',
};

const SHORT_HIRE_META = {
  key: 'short',
  label: 'Short hire premium',
  description: 'Very short bookings keep the daily rate a little higher.',
  multiplier: 1.08,
};

const NORMAL_HIRE_META = {
  key: 'standard',
  label: 'Standard duration rate',
  description: 'Normal booking duration keeps the base daily rate unchanged.',
  multiplier: 1,
};

const getDurationMeta = (days) => {
  if (days <= 2) {
    return SHORT_HIRE_META;
  }

  if (days <= 6) {
    return NORMAL_HIRE_META;
  }

  if (days <= 13) {
    return {
      key: 'weekly',
      label: 'Weekly stay discount',
      description: 'Week-long hires receive a mild daily rate discount.',
      multiplier: 0.97,
    };
  }

  if (days <= 29) {
    return {
      key: 'fortnight',
      label: 'Extended stay discount',
      description: 'Two-week and multi-week bookings lower the daily rate further.',
      multiplier: 0.92,
    };
  }

  if (days <= 59) {
    return {
      key: 'monthly',
      label: 'Monthly booking rate',
      description: 'Month-long bookings move to a more discounted daily rate.',
      multiplier: 0.84,
    };
  }

  return {
    key: 'long-term',
    label: 'Long-term booking rate',
    description: 'Two-month and longer bookings get the strongest duration discount.',
    multiplier: 0.78,
  };
};

const getDistanceMeta = (distanceKm) => {
  if (distanceKm <= 60) {
    return {
      key: 'city',
      label: 'City usage',
      description: 'Short local travel keeps the estimate slightly lower.',
      multiplier: 0.96,
    };
  }

  if (distanceKm <= 150) {
    return {
      key: 'standard',
      label: 'Standard distance',
      description: 'Normal inter-city use keeps the base travel rate unchanged.',
      multiplier: 1,
    };
  }

  if (distanceKm <= 300) {
    return {
      key: 'extended',
      label: 'Extended travel distance',
      description: 'Medium outstation travel adds a modest distance adjustment.',
      multiplier: 1.07,
    };
  }

  if (distanceKm <= 600) {
    return {
      key: 'long',
      label: 'Long-distance route',
      description: 'Long routes increase the quote to reflect heavier car usage.',
      multiplier: 1.14,
    };
  }

  return {
    key: 'touring',
    label: 'Touring distance surcharge',
    description: 'Very long routes increase the quote further for wear, planning, and support.',
    multiplier: 1.22,
  };
};

export const getPurposeMeta = (purposeKey) =>
  RENTAL_PURPOSE_OPTIONS.find((option) => option.key === purposeKey) ||
  RENTAL_PURPOSE_OPTIONS[1];

export const getInclusiveRentalDays = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return 1;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 1;
  }

  const diffInDays = Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY);
  return Math.max(1, diffInDays + 1);
};

export const calculateRentalQuote = ({
  baseDailyRate,
  startDate,
  endDate,
  purposeCategory,
  estimatedDistanceKm,
}) => {
  const normalizedBaseDailyRate = Math.max(0, Number(baseDailyRate) || 0);
  const rentalDays = getInclusiveRentalDays(startDate, endDate);
  const approximateMonths = rentalDays / 30;
  const purposeMeta = getPurposeMeta(purposeCategory);
  const normalizedDistanceKm = Math.max(0, Number(estimatedDistanceKm) || 0);
  const durationMeta = getDurationMeta(rentalDays);
  const distanceMeta = getDistanceMeta(normalizedDistanceKm);
  const adjustedDailyRate =
    normalizedBaseDailyRate *
    durationMeta.multiplier *
    purposeMeta.multiplier *
    distanceMeta.multiplier;
  const estimatedTotal = adjustedDailyRate * rentalDays;

  return {
    rentalDays,
    approximateMonths,
    distanceKm: normalizedDistanceKm,
    baseDailyRate: normalizedBaseDailyRate,
    adjustedDailyRate: Math.round(adjustedDailyRate),
    estimatedTotal: Math.round(estimatedTotal),
    baseTotal: Math.round(normalizedBaseDailyRate * rentalDays),
    purposeMeta,
    durationMeta,
    distanceMeta,
  };
};

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import * as THREE from 'three';
import {
  FiActivity,
  FiBox,
  FiCamera,
  FiClock,
  FiDisc,
  FiDroplet,
  FiLayers,
  FiMessageSquare,
  FiMove,
  FiRotateCcw,
  FiShield,
  FiSliders,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from 'react-icons/fi';
import Navbar from '../components/Navbar';
import useAuth from '../context/useAuth';
import { buildApiUrl } from '../utils/api';
import {
  SHOWROOM_SWATCHES,
  enrichVehicleRecord,
  getVehicleCategoryMeta,
  resolveVehiclePerformance,
} from '../utils/vehicleCatalog';
import {
  findStoredVehicleById,
  listStoredVehicles,
  mergeVehicleCollections,
} from '../utils/vehicleStorage';

const DOOR_KEYWORDS = ['door'];
const DOOR_EXCLUDE_KEYWORDS = [
  'underdoor',
  'doorpanel',
  'door panel',
  'doortrim',
  'door trim',
  'doorcard',
  'door card',
  'doorglass',
  'glass',
  'handle',
  'interior',
  'hinge',
  'seal',
];
const DOOR_PANEL_KEYWORDS = [
  'doorpanel',
  'door panel',
  'doortrim',
  'door trim',
  'doorcard',
  'door card',
];
const DOOR_GLASS_KEYWORDS = ['doorglass', 'door glass'];
const DOOR_LINK_EXCLUDE_KEYWORDS = [
  'interior mirror',
  'mirror interior',
  'windshield',
  'sideglass',
  'side glass',
  'backlight',
];
const HOOD_KEYWORDS = ['hood', 'bonnet'];
const TRUNK_KEYWORDS = ['trunk', 'boot', 'tailgate', 'hatch'];
const PANEL_EXCLUDE_KEYWORDS = ['glass', 'window', 'frame'];
const WHEEL_KEYWORDS = ['wheel', 'rim', 'tire', 'tyre'];
const WHEEL_EXCLUDE_KEYWORDS = [
  'steering',
  'wheelarch',
  'wheel arch',
  'mudguard',
];
const SPOILER_KEYWORDS = ['spoiler', 'wing'];
const SKIRT_KEYWORDS = ['skirt', 'underdoor', 'rocker'];
const MIRROR_KEYWORDS = [
  'mirror',
  'side mirror',
  'sidemirror',
  'wing mirror',
  'wingmirror',
];
const MIRROR_EXCLUDE_KEYWORDS = ['glass', 'window', 'indicator', 'light'];
const FRONT_BUMPER_KEYWORDS = [
  'front bumper',
  'bumper front',
  'bumperfront',
  'bumper f',
  'front lip',
  'splitter',
];
const REAR_BUMPER_KEYWORDS = [
  'rear bumper',
  'bumper rear',
  'bumperrear',
  'bumper r',
  'diffuser',
];

const PART_OPEN_ANGLES = {
  door: THREE.MathUtils.degToRad(78),
  hood: THREE.MathUtils.degToRad(42),
  trunk: THREE.MathUtils.degToRad(46),
};

const DEFAULT_TUNING_VALUES = {
  rideHeight: 50,
  tireSize: 50,
  wheelTrack: 50,
  spoilerSize: 50,
  skirtSize: 50,
  mirrorSize: 50,
  frontBumperDepth: 50,
  rearBumperDepth: 50,
};

const DEFAULT_TUNING_SUPPORT = {
  wheelCount: 0,
  spoilerCount: 0,
  skirtCount: 0,
  mirrorCount: 0,
  frontBumperCount: 0,
  rearBumperCount: 0,
  rideHeightMode: 'global',
  paintZones: {},
};

const PERFORMANCE_CARD_ROWS = [
  {
    key: 'horsepower',
    label: 'Horsepower',
    icon: FiZap,
    accentColor: '#f59e0b',
    min: 60,
    max: 1000,
    format: (value) => `${INTEGER_FORMATTER.format(value)} HP`,
  },
  {
    key: 'topSpeed',
    label: 'Top Speed',
    icon: FiTrendingUp,
    accentColor: '#ef4444',
    min: 70,
    max: 230,
    format: (value) => `${INTEGER_FORMATTER.format(value)} MPH`,
  },
  {
    key: 'zeroToSixty',
    label: '0 - 60 MPH',
    icon: FiClock,
    accentColor: '#2563eb',
    min: 2,
    max: 10,
    inverse: true,
    format: (value) => `${value.toFixed(1)} SEC`,
  },
  {
    key: 'quarterMile',
    label: '1/4 Mile',
    icon: FiActivity,
    accentColor: '#0891b2',
    min: 8,
    max: 18,
    inverse: true,
    format: (value) => `${value.toFixed(1)} SEC`,
  },
  {
    key: 'brakePower',
    label: 'Brake Power',
    icon: FiShield,
    accentColor: '#16a34a',
    min: 1,
    max: 10,
    format: (value) => `${value.toFixed(1)}/10`,
  },
  {
    key: 'brakeResponse',
    label: 'Brake Response',
    icon: FiDisc,
    accentColor: '#a855f7',
    min: 1,
    max: 10,
    format: (value) => `${value.toFixed(1)}/10`,
  },
];

const INTEGER_FORMATTER = new Intl.NumberFormat('en-US');

const GARAGE_TABS = [
  { key: 'body', label: 'Body Kits', icon: FiLayers },
  { key: 'panels', label: 'Panels', icon: FiBox },
  { key: 'paint', label: 'Paint & Wrap', icon: FiDroplet },
  { key: 'builds', label: 'Build Presets', icon: FiZap },
];

const PANEL_SNAPSHOT_OPTIONS = [
  { label: 'Closed', value: 0 },
  { label: 'Peek', value: 0.45 },
  { label: 'Open', value: 1 },
];

const PAINT_FINISH_PRESETS = [
  {
    key: 'gloss',
    label: 'Gloss',
    description: 'Bright showroom reflections with a polished clear-coat feel.',
    roughness: 0.2,
    metalness: 0.52,
    clearcoat: 0.85,
    accentColor: '#f8fafc',
  },
  {
    key: 'satin',
    label: 'Satin',
    description: 'Balanced sheen for a premium street build look.',
    roughness: 0.34,
    metalness: 0.42,
    clearcoat: 0.52,
    accentColor: '#cbd5f5',
  },
  {
    key: 'stealth',
    label: 'Stealth',
    description: 'Low-gloss finish with a darker, modern performance vibe.',
    roughness: 0.58,
    metalness: 0.18,
    clearcoat: 0.18,
    accentColor: '#94a3b8',
  },
];

const BODY_VARIATION_GROUPS = [
  {
    key: 'frontBumperDepth',
    label: 'Front Splitter',
    icon: FiLayers,
    accentColor: '#ef4444',
    supportKey: 'frontBumperCount',
    hint: 'Push the front bumper and splitter forward in stepped button presets.',
    options: [
      { label: 'Factory', value: 50 },
      { label: 'Street', value: 62 },
      { label: 'Track', value: 78 },
      { label: 'Attack', value: 92 },
    ],
  },
  {
    key: 'rearBumperDepth',
    label: 'Rear Diffuser',
    icon: FiLayers,
    accentColor: '#0891b2',
    supportKey: 'rearBumperCount',
    hint: 'Add more rear diffuser aggression without turning the showroom into a game scene.',
    options: [
      { label: 'Factory', value: 50 },
      { label: 'Street', value: 60 },
      { label: 'Track', value: 76 },
      { label: 'Wide', value: 90 },
    ],
  },
  {
    key: 'skirtSize',
    label: 'Side Skirts',
    icon: FiBox,
    accentColor: '#16a34a',
    supportKey: 'skirtCount',
    hint: 'Button-driven skirt depth presets for street, aero, and wide-body looks.',
    options: [
      { label: 'Factory', value: 50 },
      { label: 'Street', value: 62 },
      { label: 'Aero', value: 76 },
      { label: 'Wide', value: 90 },
    ],
  },
  {
    key: 'spoilerSize',
    label: 'Rear Wing',
    icon: FiTrendingUp,
    accentColor: '#f59e0b',
    supportKey: 'spoilerCount',
    hint: 'Select spoiler presence and size from cleaner to more aggressive presets.',
    options: [
      { label: 'Low', value: 38 },
      { label: 'Street', value: 50 },
      { label: 'GT', value: 74 },
      { label: 'Extreme', value: 94 },
    ],
  },
  {
    key: 'mirrorSize',
    label: 'Mirror Caps',
    icon: FiBox,
    accentColor: '#64748b',
    supportKey: 'mirrorCount',
    hint: 'Tuck the mirrors in or stretch them slightly for a race-car style silhouette.',
    options: [
      { label: 'Compact', value: 38 },
      { label: 'Factory', value: 50 },
      { label: 'Track', value: 62 },
      { label: 'Extended', value: 76 },
    ],
  },
  {
    key: 'rideHeight',
    label: 'Ride Height',
    icon: FiMove,
    accentColor: '#f97316',
    hint: 'Quick suspension presets instead of manual slider tuning.',
    options: [
      { label: 'Raised', value: 78 },
      { label: 'Street', value: 50 },
      { label: 'Low', value: 34 },
      { label: 'Show', value: 16 },
    ],
  },
  {
    key: 'wheelTrack',
    label: 'Wheel Stance',
    icon: FiDisc,
    accentColor: '#2563eb',
    supportKey: 'wheelCount',
    hint: 'Dial the stance from tucked to wide-body using button presets.',
    options: [
      { label: 'Tucked', value: 24 },
      { label: 'Factory', value: 50 },
      { label: 'Street', value: 68 },
      { label: 'Wide', value: 88 },
    ],
  },
  {
    key: 'tireSize',
    label: 'Wheel Fitment',
    icon: FiDisc,
    accentColor: '#8b5cf6',
    supportKey: 'wheelCount',
    hint: 'Use preset fitment sizes for OEM, street, or show-car wheel presence.',
    options: [
      { label: 'Slim', value: 34 },
      { label: 'Factory', value: 50 },
      { label: 'Street', value: 68 },
      { label: 'Show', value: 88 },
    ],
  },
];

const GARAGE_BUILD_PRESETS = [
  {
    key: 'street',
    label: 'Street Hero',
    accentColor: '#ef4444',
    description: 'Balanced street build with mild aero and gloss highlights.',
    finishKey: 'gloss',
    panelMode: 'doors-open',
    tuning: {
      rideHeight: 44,
      tireSize: 62,
      wheelTrack: 66,
      spoilerSize: 64,
      skirtSize: 66,
      mirrorSize: 50,
      frontBumperDepth: 66,
      rearBumperDepth: 62,
    },
    paint: {
      body: '#d7263d',
      hood: '#15181d',
      frontBumper: '#d7263d',
      rearBumper: '#15181d',
      mirror: '#15181d',
      spoiler: '#15181d',
      skirt: '#15181d',
    },
  },
  {
    key: 'track',
    label: 'Track Attack',
    accentColor: '#f59e0b',
    description: 'Sharper aero, wider stance, and a more aggressive splitter and wing.',
    finishKey: 'gloss',
    panelMode: 'display-open',
    tuning: {
      rideHeight: 28,
      tireSize: 72,
      wheelTrack: 84,
      spoilerSize: 88,
      skirtSize: 80,
      mirrorSize: 58,
      frontBumperDepth: 88,
      rearBumperDepth: 82,
    },
    paint: {
      body: '#f4c20d',
      hood: '#15181d',
      frontBumper: '#f4c20d',
      rearBumper: '#15181d',
      mirror: '#15181d',
      spoiler: '#15181d',
      skirt: '#15181d',
    },
  },
  {
    key: 'stealth',
    label: 'Stealth Spec',
    accentColor: '#94a3b8',
    description: 'Muted satin finish with tucked body details and a darker theme.',
    finishKey: 'stealth',
    panelMode: 'doors-open',
    tuning: {
      rideHeight: 36,
      tireSize: 60,
      wheelTrack: 62,
      spoilerSize: 52,
      skirtSize: 58,
      mirrorSize: 44,
      frontBumperDepth: 58,
      rearBumperDepth: 56,
    },
    paint: {
      body: '#15181d',
      hood: '#15181d',
      frontBumper: '#15181d',
      rearBumper: '#4b5563',
      mirror: '#4b5563',
      spoiler: '#4b5563',
      skirt: '#4b5563',
    },
  },
  {
    key: 'show',
    label: 'Showroom Shine',
    accentColor: '#2563eb',
    description: 'Lower stance, brighter paint, and a cleaner display-ready presentation.',
    finishKey: 'satin',
    panelMode: 'doors-open',
    tuning: {
      rideHeight: 18,
      tireSize: 82,
      wheelTrack: 74,
      spoilerSize: 56,
      skirtSize: 68,
      mirrorSize: 54,
      frontBumperDepth: 62,
      rearBumperDepth: 60,
    },
    paint: {
      body: '#f4f5f7',
      hood: '#2563eb',
      frontBumper: '#f4f5f7',
      rearBumper: '#2563eb',
      mirror: '#2563eb',
      spoiler: '#2563eb',
      skirt: '#2563eb',
    },
  },
];

const FRONT_HINT_KEYWORDS = [
  'front',
  'headlight',
  'hood',
  'bonnet',
  'grille',
  'radiator',
  'bumper f',
  'bumperfront',
  'foglight',
];

const REAR_HINT_KEYWORDS = [
  'rear',
  'tail',
  'trunk',
  'boot',
  'tailgate',
  'exhaust',
  'bumper r',
  'bumperrear',
  'reverse',
];

const PAINT_INCLUDE_KEYWORDS = [
  'body',
  'paint',
  'chassis',
  'shell',
  'door',
  'hood',
  'bonnet',
  'trunk',
  'boot',
  'tailgate',
  'fender',
  'quarter',
  'roof',
  'bumper',
  'panel',
];

const PAINT_EXCLUDE_KEYWORDS = [
  'glass',
  'window',
  'windshield',
  'light',
  'lamp',
  'indicator',
  'headlight',
  'taillight',
  'wheel',
  'rim',
  'tyre',
  'tire',
  'brake',
  'caliper',
  'mirror',
  'interior',
  'seat',
  'dash',
  'gauge',
  'engine',
  'exhaust',
  'grille',
  'plate',
  'logo',
  'carpet',
  'pedal',
  'screw',
  'underbody',
  'underdoor',
  'spoiler',
  'wiper',
  'needle',
  'frame',
  'signal',
  'fog',
];

const PAINT_ZONE_DEFINITIONS = [
  {
    key: 'body',
    label: 'Body',
    accentColor: '#ef4444',
    hint: 'Primary shell paint across the doors, quarter panels, roof, and main body.',
    includeKeywords: PAINT_INCLUDE_KEYWORDS,
    excludeKeywords: PAINT_EXCLUDE_KEYWORDS,
    defaultColor: SHOWROOM_SWATCHES[0].value,
  },
  {
    key: 'hood',
    label: 'Bonnet',
    accentColor: '#f59e0b',
    hint: 'Independent bonnet or hood finish for carbon-look or contrast setups.',
    includeKeywords: HOOD_KEYWORDS,
    excludeKeywords: [...PANEL_EXCLUDE_KEYWORDS, ...PAINT_EXCLUDE_KEYWORDS],
    defaultColor: SHOWROOM_SWATCHES[2].value,
  },
  {
    key: 'frontBumper',
    label: 'Front Bumper',
    accentColor: '#2563eb',
    hint: 'Front bumper, lip, or splitter pieces matched from the model mesh names.',
    includeKeywords: FRONT_BUMPER_KEYWORDS,
    excludeKeywords: PAINT_EXCLUDE_KEYWORDS,
    defaultColor: SHOWROOM_SWATCHES[0].value,
  },
  {
    key: 'rearBumper',
    label: 'Rear Bumper',
    accentColor: '#0891b2',
    hint: 'Rear bumper or diffuser pieces for two-tone street and drift builds.',
    includeKeywords: REAR_BUMPER_KEYWORDS,
    excludeKeywords: PAINT_EXCLUDE_KEYWORDS,
    defaultColor: SHOWROOM_SWATCHES[0].value,
  },
  {
    key: 'mirror',
    label: 'Side Mirrors',
    accentColor: '#64748b',
    hint: 'Mirror caps and housings, separated from the body for accent finishes.',
    includeKeywords: MIRROR_KEYWORDS,
    excludeKeywords: ['glass', 'window', 'indicator', 'light'],
    defaultColor: SHOWROOM_SWATCHES[2].value,
  },
  {
    key: 'spoiler',
    label: 'Spoiler',
    accentColor: '#111827',
    hint: 'Rear wing or ducktail finish to pair with the spoiler size slider.',
    includeKeywords: SPOILER_KEYWORDS,
    excludeKeywords: ['light', 'glass'],
    defaultColor: SHOWROOM_SWATCHES[2].value,
  },
  {
    key: 'skirt',
    label: 'Side Skirts',
    accentColor: '#16a34a',
    hint: 'Rocker panels and skirt trim for lower body-kit accents.',
    includeKeywords: SKIRT_KEYWORDS,
    excludeKeywords: ['glass', 'light', 'wheel'],
    defaultColor: SHOWROOM_SWATCHES[2].value,
  },
];

const DEFAULT_PAINT_SUPPORT = PAINT_ZONE_DEFINITIONS.reduce((state, zone) => {
  state[zone.key] = 0;
  return state;
}, {});

const DEFAULT_PAINT_VALUES = PAINT_ZONE_DEFINITIONS.reduce((state, zone) => {
  state[zone.key] = zone.defaultColor;
  return state;
}, {});

const createDefaultTuningValues = () => ({ ...DEFAULT_TUNING_VALUES });

const createDefaultPaintValues = () => ({ ...DEFAULT_PAINT_VALUES });

const createDefaultTuningSupport = () => ({
  ...DEFAULT_TUNING_SUPPORT,
  paintZones: { ...DEFAULT_PAINT_SUPPORT },
});

const createDefaultPartValues = (parts = []) =>
  parts.reduce((state, part) => {
    state[part.id] = part.partType === 'door' ? 1 : 0;
    return state;
  }, {});

const PART_TYPE_ORDER = {
  hood: 0,
  door: 1,
  trunk: 2,
};

const normalizeName = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const hasKeyword = (value, keywords) =>
  keywords.some((keyword) => value.includes(keyword));

const getMetricProgress = (value, min, max, inverse = false) => {
  const normalized = THREE.MathUtils.clamp((value - min) / (max - min), 0, 1);
  return inverse ? 1 - normalized : normalized;
};

const getObjectBox = (object) => new THREE.Box3().setFromObject(object);

const pickEdgeValue = (box, axis, sign) =>
  sign >= 0 ? box.max[axis] : box.min[axis];

const createPointFromBox = (center, overrides) => {
  const point = center.clone();
  Object.entries(overrides).forEach(([axis, value]) => {
    point[axis] = value;
  });
  return point;
};

const getAxisVector = (axis, sign = 1) => {
  const vector = new THREE.Vector3();
  vector[axis] = sign;
  return vector;
};

const getMaterials = (material) =>
  (Array.isArray(material) ? material : [material]).filter(Boolean);

const getAverage = (values) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

const getBoxVolume = (box) => {
  const size = box.getSize(new THREE.Vector3());
  return size.x * size.y * size.z;
};

const getObjectMetrics = (object) => {
  const box = getObjectBox(object);
  return {
    box,
    center: box.getCenter(new THREE.Vector3()),
    size: box.getSize(new THREE.Vector3()),
    volume: getBoxVolume(box),
  };
};

const getCenteredSliderValue = (value) =>
  (Math.min(100, Math.max(0, Number(value) || 0)) - 50) / 50;

const getEasedCenteredSliderValue = (value) => {
  const centeredValue = getCenteredSliderValue(value);
  const magnitude = Math.abs(centeredValue);
  return Math.sign(centeredValue) * THREE.MathUtils.smootherstep(magnitude, 0, 1);
};

const getCenteredScaleFromSlider = (value, minScale, maxScale) => {
  const clampedValue = Math.min(100, Math.max(0, Number(value) || 0));

  if (clampedValue === 50) {
    return 1;
  }

  if (clampedValue < 50) {
    return THREE.MathUtils.lerp(minScale, 1, clampedValue / 50);
  }

  return THREE.MathUtils.lerp(1, maxScale, (clampedValue - 50) / 50);
};

const selectLargestMatches = (matches, limit = 1) =>
  [...matches]
    .sort(
      (leftObject, rightObject) =>
        getObjectMetrics(rightObject).volume - getObjectMetrics(leftObject).volume,
    )
    .slice(0, limit);

const getTopLevelMatches = (root, includeKeywords, excludeKeywords = []) => {
  const matches = [];

  root.traverse((object) => {
    if (object === root || !object.name) {
      return;
    }

    const objectName = normalizeName(object.name);
    if (
      hasKeyword(objectName, includeKeywords) &&
      !hasKeyword(objectName, excludeKeywords)
    ) {
      matches.push(object);
    }
  });

  const matchSet = new Set(matches);

  return matches.filter((object) => {
    let parent = object.parent;

    while (parent) {
      if (matchSet.has(parent)) {
        return false;
      }
      parent = parent.parent;
    }

    const box = getObjectBox(object);
    return !box.isEmpty();
  });
};

const getTopLevelMatchesByPredicate = (root, predicate) => {
  const matches = [];

  root.traverse((object) => {
    if (object === root || !object.name) {
      return;
    }

    const objectName = normalizeName(object.name);
    if (predicate(object, objectName)) {
      matches.push(object);
    }
  });

  const matchSet = new Set(matches);

  return matches.filter((object) => {
    let parent = object.parent;

    while (parent) {
      if (matchSet.has(parent)) {
        return false;
      }
      parent = parent.parent;
    }

    const box = getObjectBox(object);
    return !box.isEmpty();
  });
};

const isDescendantOf = (object, potentialAncestor) => {
  let parent = object?.parent || null;

  while (parent) {
    if (parent === potentialAncestor) {
      return true;
    }

    parent = parent.parent;
  }

  return false;
};

const hasPositionHint = (name = '') =>
  /(^| )front( |$)|(^| )rear( |$)|(^| )back( |$)| lf | rf | lr | rr /.test(
    ` ${normalizeName(name)} `,
  );

const collectDoorLinkedObjects = (root, primaryDoorObject, axes) => {
  const primaryMetrics = getObjectMetrics(primaryDoorObject);
  const primarySideSign =
    Math.sign(primaryMetrics.center[axes.widthAxis] - axes.carCenter[axes.widthAxis]) || 1;
  const primaryIsFront =
    (primaryMetrics.center[axes.longAxis] - axes.carCenter[axes.longAxis]) * axes.frontSign >= 0;
  const primarySideLabel = getSideLabel(primaryDoorObject.name, primarySideSign);
  const primaryPositionLabel = getPositionLabel(primaryDoorObject.name, primaryIsFront);
  const longitudinalThreshold = Math.max(primaryMetrics.size[axes.longAxis] * 1.35, 0.52);

  return getTopLevelMatchesByPredicate(root, (object, objectName) => {
    if (
      object === primaryDoorObject ||
      isDescendantOf(object, primaryDoorObject) ||
      isDescendantOf(primaryDoorObject, object)
    ) {
      return false;
    }

    const isDoorPanel = hasKeyword(objectName, DOOR_PANEL_KEYWORDS);
    const isDoorGlass = hasKeyword(objectName, DOOR_GLASS_KEYWORDS);
    const isDoorHandle = objectName.includes('door') && objectName.includes('handle');
    const isSideMirror = hasKeyword(objectName, MIRROR_KEYWORDS) && !objectName.includes('interior');

    if (!(isDoorPanel || isDoorGlass || isDoorHandle || isSideMirror)) {
      return false;
    }

    if (hasKeyword(objectName, DOOR_LINK_EXCLUDE_KEYWORDS)) {
      return false;
    }

    const candidateMetrics = getObjectMetrics(object);
    const candidateSideSign =
      Math.sign(candidateMetrics.center[axes.widthAxis] - axes.carCenter[axes.widthAxis]) || 1;
    const candidateSideLabel = getSideLabel(object.name, candidateSideSign);

    if (candidateSideLabel !== primarySideLabel) {
      return false;
    }

    const longitudinalOffset = Math.abs(
      candidateMetrics.center[axes.longAxis] - primaryMetrics.center[axes.longAxis],
    );

    if (longitudinalOffset > longitudinalThreshold) {
      return false;
    }

    if (hasPositionHint(object.name)) {
      const candidateIsFront =
        (candidateMetrics.center[axes.longAxis] - axes.carCenter[axes.longAxis]) *
          axes.frontSign >=
        0;

      if (getPositionLabel(object.name, candidateIsFront) !== primaryPositionLabel) {
        return false;
      }
    }

    return true;
  }).sort(
    (leftObject, rightObject) =>
      getObjectMetrics(rightObject).volume - getObjectMetrics(leftObject).volume,
  );
};

const selectDoorAssemblies = (root, axes) => {
  const groupedByDoor = new Map();

  getTopLevelMatches(root, DOOR_KEYWORDS, DOOR_EXCLUDE_KEYWORDS).forEach((object) => {
    const { center, volume } = getObjectMetrics(object);
    const sideSign =
      Math.sign(center[axes.widthAxis] - axes.carCenter[axes.widthAxis]) || 1;
    const isFront =
      (center[axes.longAxis] - axes.carCenter[axes.longAxis]) * axes.frontSign >= 0;
    const sideLabel = getSideLabel(object.name, sideSign);
    const positionLabel = getPositionLabel(object.name, isFront);
    const key = `${positionLabel}-${sideLabel}`;
    const currentSelection = groupedByDoor.get(key);

    if (!currentSelection || volume > currentSelection.volume) {
      groupedByDoor.set(key, { object, volume });
    }
  });

  return [...groupedByDoor.values()].map((item) => item.object);
};

const selectPrimaryPanelMatches = (root, includeKeywords, excludeKeywords = []) =>
  selectLargestMatches(getTopLevelMatches(root, includeKeywords, excludeKeywords), 1);

const selectMirrors = (root, axes) => {
  const groupedBySide = new Map();

  getTopLevelMatches(root, MIRROR_KEYWORDS, MIRROR_EXCLUDE_KEYWORDS).forEach((object) => {
    const { center, volume } = getObjectMetrics(object);
    const sideSign =
      Math.sign(center[axes.widthAxis] - axes.carCenter[axes.widthAxis]) || 1;
    const sideLabel = getSideLabel(object.name, sideSign);
    const currentSelection = groupedBySide.get(sideLabel);

    if (!currentSelection || volume > currentSelection.volume) {
      groupedBySide.set(sideLabel, { object, volume });
    }
  });

  return [...groupedBySide.values()].map((item) => item.object);
};

const inferCarAxes = (root) => {
  const carBox = getObjectBox(root);
  const carCenter = carBox.getCenter(new THREE.Vector3());
  const size = carBox.getSize(new THREE.Vector3());
  const longAxis = size.z >= size.x ? 'z' : 'x';
  const widthAxis = longAxis === 'z' ? 'x' : 'z';
  const frontSamples = [];
  const rearSamples = [];

  root.traverse((object) => {
    if (object === root || !object.name) {
      return;
    }

    const objectName = normalizeName(object.name);
    if (
      !hasKeyword(objectName, FRONT_HINT_KEYWORDS) &&
      !hasKeyword(objectName, REAR_HINT_KEYWORDS)
    ) {
      return;
    }

    const center = getObjectBox(object).getCenter(new THREE.Vector3());

    if (hasKeyword(objectName, FRONT_HINT_KEYWORDS)) {
      frontSamples.push(center[longAxis]);
    }

    if (hasKeyword(objectName, REAR_HINT_KEYWORDS)) {
      rearSamples.push(center[longAxis]);
    }
  });

  const frontSign =
    frontSamples.length > 0 && rearSamples.length > 0
      ? getAverage(frontSamples) >= getAverage(rearSamples)
        ? 1
        : -1
      : 1;

  return { carCenter, longAxis, widthAxis, frontSign };
};

const toParentLocalAxis = (parent, worldAxis) => {
  const localAxis = worldAxis.clone();

  if (parent) {
    const parentQuaternion = new THREE.Quaternion();
    parent.getWorldQuaternion(parentQuaternion);
    localAxis.applyQuaternion(parentQuaternion.invert());
  }

  return localAxis.normalize();
};

const getRotationDirection = ({
  axisWorld,
  hingePoint,
  samplePoint,
  preferredDirection,
}) => {
  const baseVector = samplePoint.clone().sub(hingePoint);
  const delta = baseVector
    .clone()
    .applyAxisAngle(axisWorld, THREE.MathUtils.degToRad(8))
    .sub(baseVector);

  if (preferredDirection) {
    return delta.dot(preferredDirection) >= 0 ? 1 : -1;
  }

  return delta.y >= 0 ? 1 : -1;
};

const getSideLabel = (name, sideSign) => {
  const normalized = normalizeName(name);

  if (/(^| )left( |$)|(^| )l( |$)| lh /.test(` ${normalized} `)) {
    return 'Left';
  }

  if (/(^| )right( |$)|(^| )r( |$)| rh /.test(` ${normalized} `)) {
    return 'Right';
  }

  return sideSign >= 0 ? 'Right' : 'Left';
};

const getPositionLabel = (name, isFront) => {
  const normalized = normalizeName(name);

  if (/(^| )front( |$)| lf | rf /.test(` ${normalized} `)) {
    return 'Front';
  }

  if (/(^| )rear( |$)|(^| )back( |$)| lr | rr /.test(` ${normalized} `)) {
    return 'Rear';
  }

  return isFront ? 'Front' : 'Rear';
};

const createPivotGroup = (object, anchorPoint) => {
  const parent = object.parent;
  if (!parent) {
    return null;
  }

  const pivot = new THREE.Group();
  pivot.position.copy(parent.worldToLocal(anchorPoint.clone()));
  parent.add(pivot);
  pivot.updateMatrixWorld(true);
  pivot.attach(object);
  return pivot;
};

const createDoorController = (root, object, axes, countsBySide) => {
  const box = getObjectBox(object);
  const center = box.getCenter(new THREE.Vector3());
  const sideSign =
    Math.sign(center[axes.widthAxis] - axes.carCenter[axes.widthAxis]) || 1;
  const isFront =
    (center[axes.longAxis] - axes.carCenter[axes.longAxis]) * axes.frontSign >= 0;
  const sideLabel = getSideLabel(object.name, sideSign);
  const positionLabel = getPositionLabel(object.name, isFront);
  const includePosition = countsBySide[sideLabel] > 1;
  const label = includePosition
    ? `${positionLabel} ${sideLabel} Door`
    : `${sideLabel} Door`;
  const hingePoint = createPointFromBox(center, {
    [axes.longAxis]: pickEdgeValue(box, axes.longAxis, axes.frontSign),
    [axes.widthAxis]: pickEdgeValue(box, axes.widthAxis, sideSign),
    y: center.y,
  });
  const latchPoint = createPointFromBox(center, {
    [axes.longAxis]: pickEdgeValue(box, axes.longAxis, -axes.frontSign),
    [axes.widthAxis]: pickEdgeValue(box, axes.widthAxis, sideSign),
    y: center.y,
  });
  const axisWorld = new THREE.Vector3(0, 1, 0);
  const openSign = getRotationDirection({
    axisWorld,
    hingePoint,
    samplePoint: latchPoint,
    preferredDirection: getAxisVector(axes.widthAxis, sideSign),
  });
  const linkedObjects = collectDoorLinkedObjects(root, object, axes);
  const pivot = createPivotGroup(object, hingePoint);

  if (!pivot) {
    return null;
  }

  linkedObjects.forEach((linkedObject) => {
    if (linkedObject?.parent && linkedObject.parent !== pivot) {
      pivot.attach(linkedObject);
    }
  });

  return {
    id: `${label.toLowerCase().replace(/\s+/g, '-')}-${Math.abs(
      Math.round(center[axes.widthAxis] * 100),
    )}`,
    label,
    partType: 'door',
    angle: PART_OPEN_ANGLES.door * openSign,
    axis: toParentLocalAxis(pivot.parent, axisWorld),
    pivot,
    baseQuaternion: pivot.quaternion.clone(),
    progress: 0,
  };
};

const createPanelController = (object, partType, label, axes) => {
  const box = getObjectBox(object);
  const center = box.getCenter(new THREE.Vector3());
  const hingeEdgeSign = partType === 'hood' ? -axes.frontSign : axes.frontSign;
  const latchEdgeSign = -hingeEdgeSign;
  const hingePoint = createPointFromBox(center, {
    [axes.longAxis]: pickEdgeValue(box, axes.longAxis, hingeEdgeSign),
    y: box.max.y,
  });
  const latchPoint = createPointFromBox(center, {
    [axes.longAxis]: pickEdgeValue(box, axes.longAxis, latchEdgeSign),
    y: box.max.y,
  });
  const axisWorld = getAxisVector(axes.widthAxis, 1);
  const openSign = getRotationDirection({
    axisWorld,
    hingePoint,
    samplePoint: latchPoint,
  });
  const pivot = createPivotGroup(object, hingePoint);

  if (!pivot) {
    return null;
  }

  return {
    id: `${partType}-${normalizeName(object.name || label).replace(/\s+/g, '-')}-${Math.abs(
      Math.round(center[axes.longAxis] * 100),
    )}`,
    label,
    partType,
    angle: PART_OPEN_ANGLES[partType] * openSign,
    axis: toParentLocalAxis(pivot.parent, axisWorld),
    pivot,
    baseQuaternion: pivot.quaternion.clone(),
    progress: 0,
  };
};

const createTuneController = (object, kind, label) => {
  const center = getObjectBox(object).getCenter(new THREE.Vector3());
  const pivot = createPivotGroup(object, center);

  if (!pivot) {
    return null;
  }

  return {
    id: `${kind}-${normalizeName(object.name || label).replace(/\s+/g, '-')}`,
    label,
    kind,
    pivot,
    basePosition: pivot.position.clone(),
    baseScale: pivot.scale.clone(),
  };
};

const createBodyKitController = (object, kind, label, axes, directionSign) => {
  const controller = createTuneController(object, kind, label);

  if (!controller) {
    return null;
  }

  return {
    ...controller,
    longitudinalAxis: toParentLocalAxis(
      controller.pivot.parent,
      getAxisVector(axes.longAxis, directionSign),
    ),
    verticalAxis: toParentLocalAxis(controller.pivot.parent, new THREE.Vector3(0, -1, 0)),
  };
};

const createWheelController = (object, axes) => {
  const center = getObjectBox(object).getCenter(new THREE.Vector3());
  const sideSign =
    Math.sign(center[axes.widthAxis] - axes.carCenter[axes.widthAxis]) || 1;
  const controller = createTuneController(object, 'wheel', 'Wheel');

  if (!controller) {
    return null;
  }

  return {
    ...controller,
    lateralAxis: toParentLocalAxis(
      controller.pivot.parent,
      getAxisVector(axes.widthAxis, sideSign),
    ),
    suspensionAxis: toParentLocalAxis(controller.pivot.parent, new THREE.Vector3(0, -1, 0)),
  };
};

const selectWheelAssemblies = (root, axes) => {
  const carBox = getObjectBox(root);
  const carSize = carBox.getSize(new THREE.Vector3());
  const candidates = getTopLevelMatches(
    root,
    WHEEL_KEYWORDS,
    WHEEL_EXCLUDE_KEYWORDS,
  )
    .map((object) => {
      const box = getObjectBox(object);
      const center = box.getCenter(new THREE.Vector3());
      const sideOffset = Math.abs(
        center[axes.widthAxis] - axes.carCenter[axes.widthAxis],
      );
      const longitudinalOffset = Math.abs(
        center[axes.longAxis] - axes.carCenter[axes.longAxis],
      );

      return {
        object,
        center,
        volume: getBoxVolume(box),
        sideOffset,
        longitudinalOffset,
      };
    })
    .filter(
      (item) =>
        item.center.y <= carBox.max.y - carSize.y * 0.18 &&
        item.sideOffset >= carSize[axes.widthAxis] * 0.18 &&
        item.longitudinalOffset >= carSize[axes.longAxis] * 0.14,
    );

  const groupedByCorner = new Map();

  candidates.forEach((item) => {
    const sideSign =
      Math.sign(item.center[axes.widthAxis] - axes.carCenter[axes.widthAxis]) || 1;
    const isFront =
      (item.center[axes.longAxis] - axes.carCenter[axes.longAxis]) *
        axes.frontSign >=
      0;
    const cornerKey = `${isFront ? 'front' : 'rear'}-${
      sideSign >= 0 ? 'right' : 'left'
    }`;
    const current = groupedByCorner.get(cornerKey);

    if (!current || item.volume > current.volume) {
      groupedByCorner.set(cornerKey, item);
    }
  });

  return [...groupedByCorner.values()].map((item) => item.object);
};

const collectZoneMaterials = (root, includeKeywords, excludeKeywords = []) => {
  const materials = new Set();

  root.traverse((object) => {
    if (!object.isMesh) {
      return;
    }

    getMaterials(object.material).forEach((material) => {
      if (!material?.color) {
        return;
      }

      const materialKey = normalizeName(`${object.name} ${material.name}`);

      if (
        hasKeyword(materialKey, includeKeywords) &&
        !hasKeyword(materialKey, excludeKeywords)
      ) {
        materials.add(material);
      }
    });
  });

  return [...materials];
};

const collectPaintMaterials = (root) =>
  collectZoneMaterials(root, PAINT_INCLUDE_KEYWORDS, PAINT_EXCLUDE_KEYWORDS);

const collectPaintZoneMaterials = (root) =>
  PAINT_ZONE_DEFINITIONS.reduce((zones, zone) => {
    zones[zone.key] =
      zone.key === 'body'
        ? collectPaintMaterials(root)
        : collectZoneMaterials(root, zone.includeKeywords, zone.excludeKeywords);
    return zones;
  }, {});

const collectExclusivePaintZoneMaterials = (root) => {
  const zones = collectPaintZoneMaterials(root);
  const detailMaterials = new Set();

  PAINT_ZONE_DEFINITIONS.filter((zone) => zone.key !== 'body').forEach((zone) => {
    (zones[zone.key] || []).forEach((material) => {
      detailMaterials.add(material);
    });
  });

  zones.body = (zones.body || []).filter((material) => !detailMaterials.has(material));

  return zones;
};

const cloneModelMaterials = (root) => {
  root.traverse((object) => {
    if (!object.isMesh || !object.material) {
      return;
    }

    if (Array.isArray(object.material)) {
      object.material = object.material.map((material) =>
        material ? material.clone() : material,
      );
    } else {
      object.material = object.material.clone();
    }

    object.castShadow = true;
    object.receiveShadow = true;
  });
};

const GarageSlider = ({
  icon: Icon = FiSliders,
  label,
  value,
  onChange,
  displayValue,
  hint,
  minLabel,
  maxLabel,
  disabled = false,
  accentColor = '#111827',
  min = 0,
  max = 100,
  step = 1,
}) => (
  <div
    className="rounded-4 border p-3"
    style={{
      background: disabled ? 'rgba(248,249,250,0.96)' : '#ffffff',
      opacity: disabled ? 0.72 : 1,
    }}
  >
    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
      <div className="d-flex align-items-center gap-2 fw-semibold">
        <span
          className="d-inline-flex align-items-center justify-content-center rounded-circle"
          style={{
            width: '38px',
            height: '38px',
            background: `${accentColor}16`,
            color: accentColor,
          }}
        >
          {React.createElement(Icon)}
        </span>
        <span>{label}</span>
      </div>

      <span
        className="badge rounded-pill text-dark"
        style={{ background: `${accentColor}20` }}
      >
        {displayValue}
      </span>
    </div>

    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="form-range m-0"
      style={{ accentColor }}
    />

    <div className="d-flex justify-content-between small text-muted mt-2">
      <span>{minLabel}</span>
      <span>{maxLabel}</span>
    </div>

    {hint ? <div className="small text-muted mt-2">{hint}</div> : null}
  </div>
);

const PerformanceStatRow = ({
  icon: Icon,
  label,
  valueLabel,
  progress,
  accentColor,
}) => (
  <div
    className="rounded-4 p-3"
    style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}
  >
    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
      <div className="d-flex align-items-center gap-2 fw-semibold text-white">
        <span
          className="d-inline-flex align-items-center justify-content-center rounded-circle"
          style={{
            width: '36px',
            height: '36px',
            background: `${accentColor}22`,
            color: accentColor,
          }}
        >
          {React.createElement(Icon)}
        </span>
        <span style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
      </div>

      <span
        className="badge rounded-pill px-3 py-2"
        style={{
          background: `${accentColor}22`,
          color: '#ffffff',
          border: `1px solid ${accentColor}3d`,
        }}
      >
        {valueLabel}
      </span>
    </div>

    <div
      className="rounded-pill overflow-hidden"
      style={{ height: '10px', background: 'rgba(148,163,184,0.22)' }}
    >
      <div
        className="h-100 rounded-pill"
        style={{
          width: `${Math.round(progress * 100)}%`,
          minWidth: progress > 0 ? '10px' : 0,
          background: `linear-gradient(90deg, ${accentColor}, rgba(255,255,255,0.95))`,
          boxShadow: `0 0 18px ${accentColor}66`,
        }}
      />
    </div>
  </div>
);

const CustomizerTabButton = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="btn rounded-pill px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2"
    style={{
      background: isActive ? 'rgba(239,68,68,0.22)' : 'rgba(255,255,255,0.08)',
      color: '#ffffff',
      border: isActive
        ? '1px solid rgba(248,113,113,0.55)'
        : '1px solid rgba(255,255,255,0.08)',
    }}
  >
    {React.createElement(Icon)}
    <span>{label}</span>
  </button>
);

const VariationButtonGroup = ({
  icon: Icon,
  label,
  hint,
  accentColor,
  badge,
  options,
  activeValue,
  onSelect,
  disabled = false,
}) => (
  <div
    className="rounded-4 p-3"
    style={{
      background: disabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.08)',
      opacity: disabled ? 0.48 : 1,
    }}
  >
    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
      <div className="d-flex align-items-start gap-2">
        <span
          className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
          style={{
            width: '38px',
            height: '38px',
            background: `${accentColor}1f`,
            color: accentColor,
          }}
        >
          {React.createElement(Icon)}
        </span>

        <div>
          <div className="fw-semibold text-white">{label}</div>
          <div className="small" style={{ color: 'rgba(226,232,240,0.72)' }}>
            {hint}
          </div>
        </div>
      </div>

      {badge ? (
        <span
          className="badge rounded-pill px-3 py-2"
          style={{
            background: `${accentColor}1f`,
            color: '#ffffff',
            border: `1px solid ${accentColor}40`,
          }}
        >
          {badge}
        </span>
      ) : null}
    </div>

    <div className="d-flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = activeValue === option.value;

        return (
          <button
            key={`${label}-${option.label}`}
            type="button"
            onClick={() => onSelect(option.value)}
            disabled={disabled}
            className="btn btn-sm rounded-pill px-3 py-2 fw-semibold"
            style={{
              background: isActive ? accentColor : 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              border: isActive
                ? `1px solid ${accentColor}`
                : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  </div>
);

const PanelPartCard = ({
  part,
  value,
  onSelect,
}) => (
  <div
    className="rounded-4 p-3"
    style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}
  >
    <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
      <div>
        <div className="fw-semibold text-white">{part.label}</div>
        <div className="small" style={{ color: 'rgba(226,232,240,0.72)' }}>
          {part.partType === 'door'
            ? 'Open or close this door like a garage inspection view.'
            : `Control the ${part.label.toLowerCase()} panel position.`}
        </div>
      </div>

      <span
        className="badge rounded-pill px-3 py-2"
        style={{
          background: 'rgba(239,68,68,0.18)',
          color: '#ffffff',
          border: '1px solid rgba(248,113,113,0.3)',
        }}
      >
        {Math.round((value ?? 0) * 100)}%
      </span>
    </div>

    <div className="d-flex flex-wrap gap-2">
      {PANEL_SNAPSHOT_OPTIONS.map((option) => {
        const isActive = Math.abs((value ?? 0) - option.value) < 0.01;

        return (
          <button
            key={`${part.id}-${option.label}`}
            type="button"
            onClick={() => onSelect(option.value)}
            className="btn btn-sm rounded-pill px-3 py-2 fw-semibold"
            style={{
              background: isActive ? '#ef4444' : 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              border: isActive
                ? '1px solid #ef4444'
                : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  </div>
);

class ModelSceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    this.props.onError?.(error);
  }

  componentDidUpdate(previousProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }

    return this.props.children;
  }
}

const RealCarModel = ({
  modelPath,
  paintValues,
  partValues,
  tuningValues,
  paintFinishKey,
  onSetupDetected,
}) => {
  const { scene } = useGLTF(modelPath);
  const model = useMemo(() => scene.clone(true), [scene]);
  const modelWrapperRef = useRef();
  const initializedRef = useRef(false);
  const panelControllersRef = useRef([]);
  const tuningControllersRef = useRef({
    wheels: [],
    spoilers: [],
    skirts: [],
    mirrors: [],
    frontBumpers: [],
    rearBumpers: [],
  });
  const paintZoneMaterialsRef = useRef({});
  const carSizeRef = useRef(new THREE.Vector3(1, 1, 1));
  const axesRef = useRef({ longAxis: 'z', widthAxis: 'x' });

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    cloneModelMaterials(model);
    model.updateMatrixWorld(true);

    const axes = inferCarAxes(model);
    const carBox = getObjectBox(model);
    carSizeRef.current = carBox.getSize(new THREE.Vector3());
    axesRef.current = axes;

    const doorMatches = selectDoorAssemblies(model, axes);
    const hoodMatches = selectPrimaryPanelMatches(
      model,
      HOOD_KEYWORDS,
      PANEL_EXCLUDE_KEYWORDS,
    );
    const trunkMatches = selectPrimaryPanelMatches(
      model,
      TRUNK_KEYWORDS,
      PANEL_EXCLUDE_KEYWORDS,
    );

    const doorDescriptors = doorMatches.map((object) => {
      const center = getObjectBox(object).getCenter(new THREE.Vector3());
      const sideSign =
        Math.sign(center[axes.widthAxis] - axes.carCenter[axes.widthAxis]) || 1;
      const sideLabel = getSideLabel(object.name, sideSign);

      return { object, sideLabel };
    });

    const countsBySide = doorDescriptors.reduce((totals, item) => {
      totals[item.sideLabel] = (totals[item.sideLabel] || 0) + 1;
      return totals;
    }, {});

    const panelControllers = [
      ...doorMatches
        .map((object) => createDoorController(model, object, axes, countsBySide))
        .filter(Boolean),
      ...hoodMatches
        .map((object) => createPanelController(object, 'hood', 'Bonnet', axes))
        .filter(Boolean),
      ...trunkMatches
        .map((object) => createPanelController(object, 'trunk', 'Trunk', axes))
        .filter(Boolean),
    ];

    const wheelControllers = selectWheelAssemblies(model, axes)
      .map((object) => createWheelController(object, axes))
      .filter(Boolean);

    const spoilerControllers = getTopLevelMatches(model, SPOILER_KEYWORDS)
      .map((object) => createTuneController(object, 'spoiler', 'Spoiler'))
      .filter(Boolean);

    const skirtControllers = getTopLevelMatches(model, SKIRT_KEYWORDS)
      .map((object) => createTuneController(object, 'skirt', 'Side Skirt'))
      .filter(Boolean);

    const mirrorControllers = selectMirrors(
      model,
      axes,
    )
      .map((object) => createTuneController(object, 'mirror', 'Side Mirror'))
      .filter(Boolean);

    const frontBumperControllers = selectPrimaryPanelMatches(
      model,
      FRONT_BUMPER_KEYWORDS,
      PAINT_EXCLUDE_KEYWORDS,
    )
      .map((object) =>
        createBodyKitController(object, 'front-bumper', 'Front Bumper', axes, axes.frontSign),
      )
      .filter(Boolean);

    const rearBumperControllers = selectPrimaryPanelMatches(
      model,
      REAR_BUMPER_KEYWORDS,
      PAINT_EXCLUDE_KEYWORDS,
    )
      .map((object) =>
        createBodyKitController(object, 'rear-bumper', 'Rear Bumper', axes, -axes.frontSign),
      )
      .filter(Boolean);

    const paintZoneMaterials = collectExclusivePaintZoneMaterials(model);

    panelControllersRef.current = panelControllers;
    tuningControllersRef.current = {
      wheels: wheelControllers,
      spoilers: spoilerControllers,
      skirts: skirtControllers,
      mirrors: mirrorControllers,
      frontBumpers: frontBumperControllers,
      rearBumpers: rearBumperControllers,
    };
    paintZoneMaterialsRef.current = paintZoneMaterials;

    onSetupDetected({
      parts: panelControllers.map(({ id, label, partType }) => ({
        id,
        label,
        partType,
      })),
      tuning: {
        wheelCount: wheelControllers.length,
        spoilerCount: spoilerControllers.length,
        skirtCount: skirtControllers.length,
        mirrorCount: mirrorControllers.length,
        frontBumperCount: frontBumperControllers.length,
        rearBumperCount: rearBumperControllers.length,
        rideHeightMode: wheelControllers.length ? 'suspension' : 'global',
        paintZones: PAINT_ZONE_DEFINITIONS.reduce((zones, zone) => {
          zones[zone.key] = paintZoneMaterials[zone.key]?.length || 0;
          return zones;
        }, {}),
      },
    });
  }, [model, onSetupDetected]);

  useEffect(() => {
    const finishPreset =
      PAINT_FINISH_PRESETS.find((preset) => preset.key === paintFinishKey) ||
      PAINT_FINISH_PRESETS[0];

    PAINT_ZONE_DEFINITIONS.forEach((zone) => {
      const nextColor = paintValues?.[zone.key] ?? zone.defaultColor;

      (paintZoneMaterialsRef.current[zone.key] || []).forEach((material) => {
        material.color.set(nextColor);

        if ('roughness' in material) {
          material.roughness = finishPreset.roughness;
        }

        if ('metalness' in material) {
          material.metalness = finishPreset.metalness;
        }

        if ('clearcoat' in material) {
          material.clearcoat = finishPreset.clearcoat;
        }

        material.needsUpdate = true;
      });
    });
  }, [paintFinishKey, paintValues]);

  useFrame((_, delta) => {
    panelControllersRef.current.forEach((controller) => {
      const target = Math.min(
        1,
        Math.max(0, Number(partValues[controller.id] ?? 0)),
      );
      controller.progress = THREE.MathUtils.damp(
        controller.progress,
        target,
        controller.partType === 'door' ? 5.6 : 4.9,
        delta,
      );
      const easedProgress = THREE.MathUtils.smootherstep(controller.progress, 0, 1);

      const swing = new THREE.Quaternion().setFromAxisAngle(
        controller.axis,
        controller.angle * easedProgress,
      );

      controller.pivot.quaternion
        .copy(controller.baseQuaternion)
        .multiply(swing);
    });

    const wheelScale = getCenteredScaleFromSlider(
      tuningValues.tireSize,
      0.78,
      1.24,
    );
    const spoilerScale = getCenteredScaleFromSlider(
      tuningValues.spoilerSize,
      0.72,
      1.34,
    );
    const skirtScale = getCenteredScaleFromSlider(
      tuningValues.skirtSize,
      0.8,
      1.24,
    );
    const mirrorScale = getCenteredScaleFromSlider(
      tuningValues.mirrorSize,
      0.76,
      1.28,
    );
    const suspensionTravel =
      carSizeRef.current.y *
      0.085 *
      getEasedCenteredSliderValue(tuningValues.rideHeight);
    const bodySettleOffset =
      tuningControllersRef.current.wheels.length > 0
        ? suspensionTravel * 0.16
        : suspensionTravel * 0.56;
    const wheelTrackOffset =
      carSizeRef.current[axesRef.current.widthAxis] *
      0.05 *
      getEasedCenteredSliderValue(tuningValues.wheelTrack);
    const skirtDrop =
      carSizeRef.current.y *
      0.035 *
      getEasedCenteredSliderValue(tuningValues.skirtSize);
    const frontBumperAggression = getEasedCenteredSliderValue(
      tuningValues.frontBumperDepth,
    );
    const rearBumperAggression = getEasedCenteredSliderValue(
      tuningValues.rearBumperDepth,
    );

    if (modelWrapperRef.current) {
      modelWrapperRef.current.position.y = THREE.MathUtils.damp(
        modelWrapperRef.current.position.y,
        bodySettleOffset,
        6.2,
        delta,
      );
    }

    tuningControllersRef.current.wheels.forEach((controller) => {
      const targetPosition = controller.basePosition
        .clone()
        .addScaledVector(controller.lateralAxis, wheelTrackOffset)
        .addScaledVector(controller.suspensionAxis, suspensionTravel);

      controller.pivot.position.x = THREE.MathUtils.damp(
        controller.pivot.position.x,
        targetPosition.x,
        5,
        delta,
      );
      controller.pivot.position.y = THREE.MathUtils.damp(
        controller.pivot.position.y,
        targetPosition.y,
        5,
        delta,
      );
      controller.pivot.position.z = THREE.MathUtils.damp(
        controller.pivot.position.z,
        targetPosition.z,
        5,
        delta,
      );
      controller.pivot.scale.x = THREE.MathUtils.damp(
        controller.pivot.scale.x,
        controller.baseScale.x * wheelScale,
        5,
        delta,
      );
      controller.pivot.scale.y = THREE.MathUtils.damp(
        controller.pivot.scale.y,
        controller.baseScale.y * wheelScale,
        5,
        delta,
      );
      controller.pivot.scale.z = THREE.MathUtils.damp(
        controller.pivot.scale.z,
        controller.baseScale.z * wheelScale,
        5,
        delta,
      );
    });

    tuningControllersRef.current.frontBumpers.forEach((controller) => {
      const aggression =
        frontBumperAggression >= 0
          ? 1 + frontBumperAggression * 0.12
          : 1 + frontBumperAggression * 0.05;
      const targetPosition = controller.basePosition
        .clone()
        .addScaledVector(
          controller.longitudinalAxis,
          carSizeRef.current[axesRef.current.longAxis] * 0.028 * frontBumperAggression,
        )
        .addScaledVector(
          controller.verticalAxis,
          carSizeRef.current.y * 0.016 * frontBumperAggression,
        );

      controller.pivot.position.x = THREE.MathUtils.damp(
        controller.pivot.position.x,
        targetPosition.x,
        4.9,
        delta,
      );
      controller.pivot.position.y = THREE.MathUtils.damp(
        controller.pivot.position.y,
        targetPosition.y,
        4.9,
        delta,
      );
      controller.pivot.position.z = THREE.MathUtils.damp(
        controller.pivot.position.z,
        targetPosition.z,
        4.9,
        delta,
      );
      controller.pivot.scale.x = THREE.MathUtils.damp(
        controller.pivot.scale.x,
        controller.baseScale.x * aggression,
        4.9,
        delta,
      );
      controller.pivot.scale.y = THREE.MathUtils.damp(
        controller.pivot.scale.y,
        controller.baseScale.y * aggression,
        4.9,
        delta,
      );
      controller.pivot.scale.z = THREE.MathUtils.damp(
        controller.pivot.scale.z,
        controller.baseScale.z * aggression,
        4.9,
        delta,
      );
    });

    tuningControllersRef.current.rearBumpers.forEach((controller) => {
      const aggression =
        rearBumperAggression >= 0
          ? 1 + rearBumperAggression * 0.12
          : 1 + rearBumperAggression * 0.05;
      const targetPosition = controller.basePosition
        .clone()
        .addScaledVector(
          controller.longitudinalAxis,
          carSizeRef.current[axesRef.current.longAxis] * 0.026 * rearBumperAggression,
        )
        .addScaledVector(
          controller.verticalAxis,
          carSizeRef.current.y * 0.014 * rearBumperAggression,
        );

      controller.pivot.position.x = THREE.MathUtils.damp(
        controller.pivot.position.x,
        targetPosition.x,
        4.9,
        delta,
      );
      controller.pivot.position.y = THREE.MathUtils.damp(
        controller.pivot.position.y,
        targetPosition.y,
        4.9,
        delta,
      );
      controller.pivot.position.z = THREE.MathUtils.damp(
        controller.pivot.position.z,
        targetPosition.z,
        4.9,
        delta,
      );
      controller.pivot.scale.x = THREE.MathUtils.damp(
        controller.pivot.scale.x,
        controller.baseScale.x * aggression,
        4.9,
        delta,
      );
      controller.pivot.scale.y = THREE.MathUtils.damp(
        controller.pivot.scale.y,
        controller.baseScale.y * aggression,
        4.9,
        delta,
      );
      controller.pivot.scale.z = THREE.MathUtils.damp(
        controller.pivot.scale.z,
        controller.baseScale.z * aggression,
        4.9,
        delta,
      );
    });

    tuningControllersRef.current.spoilers.forEach((controller) => {
      controller.pivot.position.x = THREE.MathUtils.damp(
        controller.pivot.position.x,
        controller.basePosition.x,
        5,
        delta,
      );
      controller.pivot.position.y = THREE.MathUtils.damp(
        controller.pivot.position.y,
        controller.basePosition.y,
        5,
        delta,
      );
      controller.pivot.position.z = THREE.MathUtils.damp(
        controller.pivot.position.z,
        controller.basePosition.z,
        5,
        delta,
      );
      controller.pivot.scale.x = THREE.MathUtils.damp(
        controller.pivot.scale.x,
        controller.baseScale.x * spoilerScale,
        4.8,
        delta,
      );
      controller.pivot.scale.y = THREE.MathUtils.damp(
        controller.pivot.scale.y,
        controller.baseScale.y * spoilerScale,
        4.8,
        delta,
      );
      controller.pivot.scale.z = THREE.MathUtils.damp(
        controller.pivot.scale.z,
        controller.baseScale.z * spoilerScale,
        4.8,
        delta,
      );
    });

    tuningControllersRef.current.skirts.forEach((controller) => {
      controller.pivot.position.x = THREE.MathUtils.damp(
        controller.pivot.position.x,
        controller.basePosition.x,
        5,
        delta,
      );
      controller.pivot.position.y = THREE.MathUtils.damp(
        controller.pivot.position.y,
        controller.basePosition.y - skirtDrop,
        5,
        delta,
      );
      controller.pivot.position.z = THREE.MathUtils.damp(
        controller.pivot.position.z,
        controller.basePosition.z,
        5,
        delta,
      );
      controller.pivot.scale.x = THREE.MathUtils.damp(
        controller.pivot.scale.x,
        controller.baseScale.x * skirtScale,
        4.8,
        delta,
      );
      controller.pivot.scale.y = THREE.MathUtils.damp(
        controller.pivot.scale.y,
        controller.baseScale.y * skirtScale,
        4.8,
        delta,
      );
      controller.pivot.scale.z = THREE.MathUtils.damp(
        controller.pivot.scale.z,
        controller.baseScale.z * skirtScale,
        4.8,
        delta,
      );
    });

    tuningControllersRef.current.mirrors.forEach((controller) => {
      controller.pivot.position.x = THREE.MathUtils.damp(
        controller.pivot.position.x,
        controller.basePosition.x,
        5,
        delta,
      );
      controller.pivot.position.y = THREE.MathUtils.damp(
        controller.pivot.position.y,
        controller.basePosition.y,
        5,
        delta,
      );
      controller.pivot.position.z = THREE.MathUtils.damp(
        controller.pivot.position.z,
        controller.basePosition.z,
        5,
        delta,
      );
      controller.pivot.scale.x = THREE.MathUtils.damp(
        controller.pivot.scale.x,
        controller.baseScale.x * mirrorScale,
        4.8,
        delta,
      );
      controller.pivot.scale.y = THREE.MathUtils.damp(
        controller.pivot.scale.y,
        controller.baseScale.y * mirrorScale,
        4.8,
        delta,
      );
      controller.pivot.scale.z = THREE.MathUtils.damp(
        controller.pivot.scale.z,
        controller.baseScale.z * mirrorScale,
        4.8,
        delta,
      );
    });
  });

  return (
    <group ref={modelWrapperRef}>
      <primitive object={model} />
    </group>
  );
};

const ShowroomExperience = ({
  carId,
  carName,
  carImage,
  galleryImages = [],
  carYear,
  carPrice,
  categoryLabel,
  carModelUrl,
  performanceProfile,
  showroomSummary,
  supportPromptTemplate,
  partHighlights = [],
  onBack,
  onRequestRental,
  onManageAccess,
}) => {
  const { user } = useAuth();
  const [parts, setParts] = useState([]);
  const [partValues, setPartValues] = useState({});
  const [paintValues, setPaintValues] = useState(createDefaultPaintValues);
  const [tuningValues, setTuningValues] = useState(createDefaultTuningValues);
  const [tuningSupport, setTuningSupport] = useState(createDefaultTuningSupport);
  const [paintFinishKey, setPaintFinishKey] = useState(PAINT_FINISH_PRESETS[0].key);
  const [activeCustomizerTab, setActiveCustomizerTab] = useState(GARAGE_TABS[0].key);
  const [activePaintZoneKey, setActivePaintZoneKey] = useState('body');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [modelLoadError, setModelLoadError] = useState('');
  const [supportDraft, setSupportDraft] = useState(
    supportPromptTemplate ||
      `Hello, I am interested in the ${carName}. Please share the rental details.`,
  );

  const categoryMeta = getVehicleCategoryMeta(categoryLabel);
  const primaryColor = paintValues.body ?? SHOWROOM_SWATCHES[0].value;
  const carGallery = useMemo(
    () => [...new Set([carImage, ...galleryImages].filter(Boolean))],
    [carImage, galleryImages],
  );
  const heroGalleryImage = carGallery[activeImageIndex] || carGallery[0] || carImage || '';
  const highlightChips = useMemo(
    () =>
      Array.isArray(partHighlights)
        ? partHighlights.filter(Boolean)
        : String(partHighlights || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
    [partHighlights],
  );
  const showroomDescription =
    showroomSummary ||
    'Inspect the vehicle in 3D, compare it against real photos, and review rental-ready information before contacting the showroom.';
  const showroomPerformance = useMemo(() => {
    if (performanceProfile?.horsepower) {
      return performanceProfile;
    }

    return resolveVehiclePerformance({
      name: carName,
      year: carYear,
      category: categoryLabel,
    });
  }, [carName, carYear, categoryLabel, performanceProfile]);
  const performanceRows = useMemo(
    () =>
      PERFORMANCE_CARD_ROWS.map((row) => ({
        ...row,
        value: showroomPerformance[row.key],
        valueLabel: row.format(showroomPerformance[row.key]),
        progress: getMetricProgress(
          showroomPerformance[row.key],
          row.min,
          row.max,
          row.inverse,
        ),
      })),
    [showroomPerformance],
  );

  const orderedParts = useMemo(
    () =>
      [...parts].sort((leftPart, rightPart) => {
        const partTypeDelta =
          (PART_TYPE_ORDER[leftPart.partType] ?? 99) -
          (PART_TYPE_ORDER[rightPart.partType] ?? 99);

        if (partTypeDelta !== 0) {
          return partTypeDelta;
        }

        return leftPart.label.localeCompare(rightPart.label);
      }),
    [parts],
  );

  const activePaintZones = useMemo(
    () =>
      PAINT_ZONE_DEFINITIONS.filter(
        (zone) => Number(tuningSupport.paintZones?.[zone.key] || 0) > 0,
      ),
    [tuningSupport.paintZones],
  );
  const paintWrapZones = useMemo(() => {
    const bodyZone = PAINT_ZONE_DEFINITIONS.find((zone) => zone.key === 'body');
    const detailZones = activePaintZones.filter((zone) => zone.key !== 'body');
    return bodyZone ? [bodyZone, ...detailZones] : detailZones;
  }, [activePaintZones]);
  const resolvedPaintZoneKey = paintWrapZones.some(
    (zone) => zone.key === activePaintZoneKey,
  )
    ? activePaintZoneKey
    : paintWrapZones[0]?.key || 'body';
  const currentPaintZone =
    paintWrapZones.find((zone) => zone.key === resolvedPaintZoneKey) ||
    paintWrapZones[0] ||
    PAINT_ZONE_DEFINITIONS[0];
  const paintFinishPreset =
    PAINT_FINISH_PRESETS.find((preset) => preset.key === paintFinishKey) ||
    PAINT_FINISH_PRESETS[0];
  const quickSupportPrompts = useMemo(
    () =>
      [
        {
          label: 'Standard',
          text: supportPromptTemplate,
        },
        {
          label: 'Availability',
          text: `Hello, I want to confirm the availability of the ${carName}. Please share the best rental option.`,
        },
        {
          label: 'Pricing',
          text: `Please tell me the rate, required documents, and delivery options for the ${carName}.`,
        },
      ].filter(
        (item, index, collection) =>
          item.text && collection.findIndex((entry) => entry.text === item.text) === index,
      ),
    [carName, supportPromptTemplate],
  );
  const bodyVariationGroups = useMemo(
    () =>
      BODY_VARIATION_GROUPS.map((group) => ({
        ...group,
        supportedCount: group.supportKey ? Number(tuningSupport[group.supportKey] || 0) : 1,
      })),
    [tuningSupport],
  );
  const panelQuickGroups = useMemo(
    () => ({
      doors: orderedParts.filter((part) => part.partType === 'door'),
      lids: orderedParts.filter((part) => part.partType !== 'door'),
    }),
    [orderedParts],
  );

  const handleSetupDetected = useCallback(({ parts: detectedParts, tuning }) => {
    setParts(detectedParts);
    setPartValues((current) =>
      detectedParts.reduce((nextState, part) => {
        nextState[part.id] = current[part.id] ?? (part.partType === 'door' ? 1 : 0);
        return nextState;
      }, {}),
    );
    setTuningSupport({
      ...createDefaultTuningSupport(),
      ...tuning,
      paintZones: {
        ...DEFAULT_PAINT_SUPPORT,
        ...(tuning?.paintZones || {}),
      },
    });
  }, []);

  const updatePartValue = (partId, nextValue) => {
    setPartValues((current) => ({
      ...current,
      [partId]: Math.min(1, Math.max(0, nextValue)),
    }));
  };

  const updateTuningValue = (key, nextValue) => {
    setTuningValues((current) => ({
      ...current,
      [key]: Math.min(100, Math.max(0, Number(nextValue) || 0)),
    }));
  };

  const updatePaintValue = (zoneKey, nextColor) => {
    setPaintValues((current) => ({
      ...current,
      [zoneKey]: nextColor,
    }));
  };

  const updateMultipleTuningValues = useCallback((nextValues) => {
    setTuningValues((current) => ({
      ...current,
      ...Object.entries(nextValues).reduce((state, [key, value]) => {
        state[key] = Math.min(100, Math.max(0, Number(value) || 0));
        return state;
      }, {}),
    }));
  }, []);

  const setAllPanels = useCallback(
    (nextValue) => {
      setPartValues(
        orderedParts.reduce((state, part) => {
          state[part.id] = nextValue;
          return state;
        }, {}),
      );
    },
    [orderedParts],
  );

  const setPanelsByType = useCallback(
    (partType, nextValue) => {
      setPartValues((current) =>
        orderedParts.reduce((state, part) => {
          state[part.id] = part.partType === partType ? nextValue : current[part.id] ?? 0;
          return state;
        }, {}),
      );
    },
    [orderedParts],
  );

  const applyGlobalFinish = (nextColor) => {
    setPaintValues(
      PAINT_ZONE_DEFINITIONS.reduce((nextState, zone) => {
        nextState[zone.key] = nextColor;
        return nextState;
      }, {}),
    );
  };

  const openSupportComposer = useCallback((messageText) => {
    const trimmedMessage = String(messageText || '').trim();

    if (!trimmedMessage || typeof window === 'undefined') {
      return;
    }

    window.dispatchEvent(
      new CustomEvent('ceylon-support-chat-compose', {
        detail: {
          text: trimmedMessage,
          open: true,
        },
      }),
    );
  }, []);

  const resetGarage = () => {
    setPartValues(createDefaultPartValues(orderedParts));
    setTuningValues(createDefaultTuningValues());
    setPaintValues(createDefaultPaintValues());
    setPaintFinishKey(PAINT_FINISH_PRESETS[0].key);
    setActivePaintZoneKey('body');
  };

  const applyGarageBuildPreset = useCallback(
    (preset) => {
      updateMultipleTuningValues(preset.tuning || {});

      if (preset.paint) {
        setPaintValues((current) => ({
          ...current,
          ...preset.paint,
        }));
      }

      if (preset.finishKey) {
        setPaintFinishKey(preset.finishKey);
      }

      if (preset.panelMode === 'display-open') {
        setAllPanels(1);
      } else if (preset.panelMode === 'doors-open') {
        setPartValues(() =>
          orderedParts.reduce((state, part) => {
            state[part.id] = part.partType === 'door' ? 1 : 0;
            return state;
          }, {}),
        );
      }
    },
    [orderedParts, setAllPanels, updateMultipleTuningValues],
  );

  const rideHeightLabel = useMemo(() => {
    const normalized = getEasedCenteredSliderValue(tuningValues.rideHeight);

    if (Math.abs(normalized) < 0.04) {
      return 'Stock';
    }

    return normalized < 0
      ? `Compressed ${Math.round(Math.abs(normalized) * 100)}%`
      : `Extended ${Math.round(normalized * 100)}%`;
  }, [tuningValues.rideHeight]);

  const tireSizeLabel = useMemo(
    () =>
      `${Math.round(
        getCenteredScaleFromSlider(tuningValues.tireSize, 0.78, 1.24) * 100,
      )}%`,
    [tuningValues.tireSize],
  );

  const wheelTrackLabel = useMemo(() => {
    const normalized = getCenteredSliderValue(tuningValues.wheelTrack);

    if (Math.abs(normalized) < 0.04) {
      return 'Factory';
    }

    return normalized < 0
      ? `Tucked ${Math.round(Math.abs(normalized) * 100)}%`
      : `Wide ${Math.round(normalized * 100)}%`;
  }, [tuningValues.wheelTrack]);

  const spoilerSizeLabel = useMemo(
    () =>
      `${Math.round(
        getCenteredScaleFromSlider(tuningValues.spoilerSize, 0.72, 1.34) * 100,
      )}%`,
    [tuningValues.spoilerSize],
  );

  const skirtSizeLabel = useMemo(
    () =>
      `${Math.round(
        getCenteredScaleFromSlider(tuningValues.skirtSize, 0.8, 1.24) * 100,
      )}%`,
    [tuningValues.skirtSize],
  );

  const mirrorSizeLabel = useMemo(
    () =>
      `${Math.round(
        getCenteredScaleFromSlider(tuningValues.mirrorSize, 0.76, 1.28) * 100,
      )}%`,
    [tuningValues.mirrorSize],
  );

  const frontBumperLabel = useMemo(() => {
    const normalized = getEasedCenteredSliderValue(tuningValues.frontBumperDepth);

    if (Math.abs(normalized) < 0.04) {
      return 'Stock';
    }

    return normalized < 0
      ? `Tucked ${Math.round(Math.abs(normalized) * 100)}%`
      : `Aggressive ${Math.round(normalized * 100)}%`;
  }, [tuningValues.frontBumperDepth]);

  const rearBumperLabel = useMemo(() => {
    const normalized = getEasedCenteredSliderValue(tuningValues.rearBumperDepth);

    if (Math.abs(normalized) < 0.04) {
      return 'Stock';
    }

    return normalized < 0
      ? `Tucked ${Math.round(Math.abs(normalized) * 100)}%`
      : `Aggressive ${Math.round(normalized * 100)}%`;
  }, [tuningValues.rearBumperDepth]);

  const modificationBadges = [
    {
      label: 'Panels',
      value: orderedParts.length,
      accentColor: '#ef4444',
    },
    {
      label: 'Wheels',
      value: tuningSupport.wheelCount,
      accentColor: '#2563eb',
    },
    {
      label: 'Mirrors',
      value: tuningSupport.mirrorCount,
      accentColor: '#64748b',
    },
    {
      label: 'Spoilers',
      value: tuningSupport.spoilerCount,
      accentColor: '#111827',
    },
    {
      label: 'Skirts',
      value: tuningSupport.skirtCount,
      accentColor: '#16a34a',
    },
    {
      label: 'Front Bumper',
      value: tuningSupport.frontBumperCount,
      accentColor: '#2563eb',
    },
    {
      label: 'Rear Bumper',
      value: tuningSupport.rearBumperCount,
      accentColor: '#0891b2',
    },
  ];

  const totalEditableGroups =
    orderedParts.length +
    tuningSupport.wheelCount +
    tuningSupport.spoilerCount +
    tuningSupport.skirtCount +
    tuningSupport.mirrorCount +
    tuningSupport.frontBumperCount +
    tuningSupport.rearBumperCount +
    activePaintZones.length;

  const rentalAction = useMemo(() => {
    if (user?.role === 'ADMIN') {
      return {
        label: 'Open Manager Tools',
        description:
          'The preset manager account controls the rental desk and internal account records from the dashboard.',
        onClick: onManageAccess,
        style: 'btn-dark',
      };
    }

    if (user?.role === 'CUSTOMER') {
      return {
        label: 'Request Rental Through Staff',
        description:
          'Submit this vehicle to the showroom staff so an admin, manager, or employee can process the rental.',
        onClick: () => onRequestRental(carId),
        style: 'btn-danger',
      };
    }

    return {
      label: 'Customer Login Required',
      description:
        'Customers use staff-issued credentials, then send the rental request through the showroom team.',
      onClick: () => onRequestRental(null),
      style: 'btn-outline-dark',
    };
  }, [carId, onManageAccess, onRequestRental, user?.role]);

  const handleModelLoadError = useCallback((error) => {
    const errorMessage = String(error?.message || '').trim();
    const friendlyMessage = errorMessage.toLowerCase().includes('failed to fetch')
      ? 'The saved GLB file could not be fetched from the uploads folder.'
      : errorMessage || 'The 3D model could not be loaded for this car.';

    setModelLoadError(friendlyMessage);
  }, []);

  useEffect(() => {
    setModelLoadError('');
  }, [carModelUrl]);

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{
        background:
          'radial-gradient(circle at center, rgba(255,255,255,0.96) 0%, rgba(237,240,244,0.95) 42%, rgba(222,226,232,0.92) 100%)',
      }}
    >
      <Navbar />

      <div
        className="position-relative w-100 overflow-hidden"
        style={{ height: 'calc(100vh - 92px)', marginTop: '92px' }}
      >
        {carModelUrl && !modelLoadError ? (
          <Canvas shadows dpr={[1, 2]} camera={{ position: [6.4, 2.5, 8.8], fov: 31, near: 0.05 }}>
            <fog attach="fog" args={['#e6e8ec', 12, 24]} />
            <color attach="background" args={['#e6e8ec']} />

            <ModelSceneErrorBoundary
              resetKey={carModelUrl}
              onError={handleModelLoadError}
              fallback={null}
            >
              <Suspense fallback={null}>
                <Stage environment="city" intensity={0.48} adjustCamera preset="soft">
                  <RealCarModel
                    modelPath={carModelUrl}
                    paintValues={paintValues}
                    partValues={partValues}
                    tuningValues={tuningValues}
                    paintFinishKey={paintFinishKey}
                    onSetupDetected={handleSetupDetected}
                  />
                </Stage>
              </Suspense>
            </ModelSceneErrorBoundary>

            <OrbitControls
              makeDefault
              enablePan={false}
              minDistance={1.8}
              maxDistance={13}
              minPolarAngle={0.72}
              maxPolarAngle={Math.PI / 2 - 0.08}
            />
          </Canvas>
        ) : (
          <div
            className="position-relative d-flex align-items-center justify-content-center h-100"
            style={{
              background:
                'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.84), rgba(127,29,29,0.82))',
            }}
          >
            {heroGalleryImage ? (
              <img
                src={heroGalleryImage}
                alt={carName}
                className="position-absolute w-100 h-100"
                style={{
                  objectFit: 'cover',
                  opacity: 0.2,
                  filter: 'blur(2px) saturate(0.92)',
                }}
              />
            ) : null}

            <div
              className="position-relative text-center text-white px-4 py-5 rounded-5"
              style={{
                maxWidth: '540px',
                background: 'rgba(15, 23, 42, 0.58)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(14px)',
              }}
            >
              <p
                className="small fw-bold mb-2"
                style={{ color: '#fda4af', letterSpacing: '0.18em', textTransform: 'uppercase' }}
              >
                Showroom Viewer
              </p>
              <h3 className="fw-bold mb-3">
                {carModelUrl ? '3D model could not be loaded' : 'No 3D model available for this car'}
              </h3>
              <p className="mb-0" style={{ color: 'rgba(241,245,249,0.86)' }}>
                {modelLoadError ||
                  'This listing does not include a showroom model yet. The real photos and rental details are still available on this page.'}
              </p>
            </div>
          </div>
        )}

        <div
          className="position-absolute top-0 start-0 h-100 p-3 p-lg-4"
          style={{ width: 'min(94vw, 430px)', zIndex: 11, overflow: 'hidden' }}
        >
          <div
            className="card border-0 shadow-lg rounded-5 h-100 overflow-hidden"
            style={{
              background: 'rgba(9, 13, 24, 0.92)',
              backdropFilter: 'blur(18px)',
              color: '#ffffff',
              minHeight: 0,
            }}
          >
            <div
              className="p-4 pb-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                <div>
                  <p
                    className="small fw-bold mb-2"
                    style={{
                      color: '#fda4af',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Visual Customization
                  </p>
                  <h3 className="fw-bold mb-1">Payback-style edit dock</h3>
                  <p className="small mb-0" style={{ color: 'rgba(226,232,240,0.72)' }}>
                    Left-side garage controls for body parts, paint, and panel opening.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetGarage}
                  className="btn btn-sm rounded-pill px-3 py-2 fw-semibold"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <FiRotateCcw className="me-1" />
                  Reset
                </button>
              </div>

              <div className="d-flex flex-wrap gap-2">
                {GARAGE_TABS.map((tab) => (
                  <CustomizerTabButton
                    key={tab.key}
                    icon={tab.icon}
                    label={tab.label}
                    isActive={activeCustomizerTab === tab.key}
                    onClick={() => setActiveCustomizerTab(tab.key)}
                  />
                ))}
              </div>
            </div>

            <div
              className="p-4 d-flex flex-column gap-3 overflow-auto flex-grow-1"
              style={{
                minHeight: 0,
                overflowY: 'auto',
                overscrollBehavior: 'contain',
              }}
            >
              {activeCustomizerTab === 'body' ? (
                <>
                  <div
                    className="rounded-4 p-3"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="fw-semibold text-white mb-1">Body Attachments</div>
                    <div className="small" style={{ color: 'rgba(226,232,240,0.72)' }}>
                      Use button presets to change visible body-kit attitude like a Payback garage,
                      while still keeping the site rental-focused.
                    </div>
                  </div>

                  {bodyVariationGroups.map((group) => (
                    <VariationButtonGroup
                      key={group.key}
                      icon={group.icon}
                      label={group.label}
                      hint={group.hint}
                      accentColor={group.accentColor}
                      badge={group.supportKey ? `${group.supportedCount} detected` : 'Always ready'}
                      options={group.options}
                      activeValue={tuningValues[group.key]}
                      onSelect={(value) => updateTuningValue(group.key, value)}
                      disabled={Boolean(group.supportKey) && !group.supportedCount}
                    />
                  ))}
                </>
              ) : null}

              {activeCustomizerTab === 'panels' ? (
                <>
                  <div
                    className="rounded-4 p-3"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="fw-semibold text-white mb-2">Garage Access Panels</div>
                    <div className="small mb-3" style={{ color: 'rgba(226,232,240,0.72)' }}>
                      All detected doors, hood, and trunk can be opened from button presets.
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setPanelsByType('door', 1)}
                        disabled={!panelQuickGroups.doors.length}
                        className="btn btn-sm rounded-pill px-3 py-2 fw-semibold"
                        style={{
                          background: '#ef4444',
                          color: '#ffffff',
                          border: '1px solid #ef4444',
                        }}
                      >
                        Open Doors
                      </button>
                      <button
                        type="button"
                        onClick={() => setPanelsByType('door', 0)}
                        disabled={!panelQuickGroups.doors.length}
                        className="btn btn-sm rounded-pill px-3 py-2 fw-semibold"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          color: '#ffffff',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        Close Doors
                      </button>
                      <button
                        type="button"
                        onClick={() => setAllPanels(1)}
                        disabled={!orderedParts.length}
                        className="btn btn-sm rounded-pill px-3 py-2 fw-semibold"
                        style={{
                          background: 'rgba(248,113,113,0.22)',
                          color: '#ffffff',
                          border: '1px solid rgba(248,113,113,0.35)',
                        }}
                      >
                        Display Open
                      </button>
                      <button
                        type="button"
                        onClick={() => setAllPanels(0)}
                        disabled={!orderedParts.length}
                        className="btn btn-sm rounded-pill px-3 py-2 fw-semibold"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          color: '#ffffff',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        Close Everything
                      </button>
                    </div>
                  </div>

                  {orderedParts.length ? (
                    orderedParts.map((part) => (
                      <PanelPartCard
                        key={part.id}
                        part={part}
                        value={partValues[part.id]}
                        onSelect={(value) => updatePartValue(part.id, value)}
                      />
                    ))
                  ) : (
                    <div
                      className="rounded-4 p-3"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(226,232,240,0.72)',
                      }}
                    >
                      This model does not expose separate moving panel meshes yet.
                    </div>
                  )}
                </>
              ) : null}

              {activeCustomizerTab === 'paint' ? (
                <>
                  <div
                    className="rounded-4 p-3"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="fw-semibold text-white mb-2">Paint & Wrap Control</div>
                    <div className="small" style={{ color: 'rgba(226,232,240,0.72)' }}>
                      Pick a zone, choose the finish, then apply swatches like a simplified
                      Payback paint editor.
                    </div>
                  </div>

                  <div
                    className="rounded-4 p-3"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="small fw-semibold mb-2" style={{ color: '#fde68a' }}>
                      Active paint zone
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {paintWrapZones.map((zone) => (
                        <button
                          key={zone.key}
                          type="button"
                          onClick={() => setActivePaintZoneKey(zone.key)}
                          className="btn btn-sm rounded-pill px-3 py-2 fw-semibold"
                          style={{
                            background:
                              resolvedPaintZoneKey === zone.key
                                ? zone.accentColor
                                : 'rgba(255,255,255,0.08)',
                            color: '#ffffff',
                            border:
                              resolvedPaintZoneKey === zone.key
                                ? `1px solid ${zone.accentColor}`
                                : '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          {zone.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    className="rounded-4 p-3"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                      <div>
                        <div className="fw-semibold text-white">{currentPaintZone.label}</div>
                        <div className="small" style={{ color: 'rgba(226,232,240,0.72)' }}>
                          {currentPaintZone.hint}
                        </div>
                      </div>

                      <span
                        className="badge rounded-pill px-3 py-2"
                        style={{
                          background: `${currentPaintZone.accentColor}22`,
                          color: '#ffffff',
                          border: `1px solid ${currentPaintZone.accentColor}44`,
                        }}
                      >
                        {currentPaintZone.key === 'body'
                          ? 'Main finish'
                          : `${tuningSupport.paintZones?.[currentPaintZone.key] || 0} materials`}
                      </span>
                    </div>

                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {SHOWROOM_SWATCHES.map((swatch) => {
                        const isActive =
                          (paintValues[currentPaintZone.key] ?? currentPaintZone.defaultColor) ===
                          swatch.value;

                        return (
                          <button
                            key={`${currentPaintZone.key}-${swatch.value}`}
                            type="button"
                            onClick={() => updatePaintValue(currentPaintZone.key, swatch.value)}
                            className={`btn rounded-circle border ${
                              isActive ? 'border-white border-3' : ''
                            }`}
                            style={{
                              width: '38px',
                              height: '38px',
                              background: swatch.value,
                            }}
                            title={`${currentPaintZone.label}: ${swatch.label}`}
                            aria-label={`${currentPaintZone.label}: ${swatch.label}`}
                          ></button>
                        );
                      })}
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-3">
                      <input
                        type="color"
                        value={paintValues[currentPaintZone.key] ?? currentPaintZone.defaultColor}
                        onChange={(event) =>
                          updatePaintValue(currentPaintZone.key, event.target.value)
                        }
                        className="form-control form-control-color rounded-circle border-0 p-0"
                        title={`${currentPaintZone.label} custom color`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          applyGlobalFinish(
                            paintValues[currentPaintZone.key] ?? currentPaintZone.defaultColor,
                          )
                        }
                        className="btn btn-sm rounded-pill px-3 py-2 fw-semibold"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          color: '#ffffff',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        Apply Color To Whole Car
                      </button>
                    </div>
                  </div>

                  <div
                    className="rounded-4 p-3"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="fw-semibold text-white mb-2">Material Finish</div>
                    <div className="small mb-3" style={{ color: 'rgba(226,232,240,0.72)' }}>
                      Current material: {paintFinishPreset.label}. {paintFinishPreset.description}
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      {PAINT_FINISH_PRESETS.map((preset) => (
                        <button
                          key={preset.key}
                          type="button"
                          onClick={() => setPaintFinishKey(preset.key)}
                          className="btn btn-sm rounded-pill px-3 py-2 fw-semibold"
                          style={{
                            background:
                              paintFinishKey === preset.key
                                ? 'rgba(248,113,113,0.22)'
                                : 'rgba(255,255,255,0.08)',
                            color: '#ffffff',
                            border:
                              paintFinishKey === preset.key
                                ? '1px solid rgba(248,113,113,0.45)'
                                : '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}

              {activeCustomizerTab === 'builds' ? (
                <>
                  <div
                    className="rounded-4 p-3"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="fw-semibold text-white mb-2">One-Tap Build Variations</div>
                    <div className="small" style={{ color: 'rgba(226,232,240,0.72)' }}>
                      These presets change body attachments, stance, finish, and color together
                      through buttons instead of only sliders.
                    </div>
                  </div>

                  {GARAGE_BUILD_PRESETS.map((preset) => (
                    <div
                      key={preset.key}
                      className="rounded-4 p-3"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                        <div>
                          <div className="fw-semibold text-white">{preset.label}</div>
                          <div className="small" style={{ color: 'rgba(226,232,240,0.72)' }}>
                            {preset.description}
                          </div>
                        </div>

                        <span
                          className="badge rounded-pill px-3 py-2"
                          style={{
                            background: `${preset.accentColor}20`,
                            color: '#ffffff',
                            border: `1px solid ${preset.accentColor}44`,
                          }}
                        >
                          {preset.finishKey}
                        </span>
                      </div>

                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {['Body', 'Aero', 'Paint', 'Panels'].map((tag) => (
                          <span
                            key={`${preset.key}-${tag}`}
                            className="badge rounded-pill px-3 py-2"
                            style={{
                              background: 'rgba(255,255,255,0.08)',
                              color: '#ffffff',
                              border: '1px solid rgba(255,255,255,0.08)',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => applyGarageBuildPreset(preset)}
                        className="btn rounded-pill fw-bold px-4 py-2"
                        style={{
                          background: preset.accentColor,
                          color: '#ffffff',
                          border: `1px solid ${preset.accentColor}`,
                        }}
                      >
                        Apply {preset.label}
                      </button>
                    </div>
                  ))}
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className="position-absolute top-0 end-0 h-100 p-3 p-lg-4"
          style={{ width: 'min(94vw, 500px)', zIndex: 10, overflow: 'hidden' }}
        >
          <div
            className="card border-0 shadow-lg rounded-5 h-100 overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(20px)',
              minHeight: 0,
            }}
          >
            {heroGalleryImage ? (
              <div className="p-3 pb-0">
                <img
                  src={heroGalleryImage}
                  alt={carName}
                  className="w-100 rounded-5"
                  style={{ height: '210px', objectFit: 'cover' }}
                />
                {carGallery.length > 1 ? (
                  <div className="d-flex gap-2 overflow-auto pt-3 px-1">
                    {carGallery.map((galleryImage, index) => (
                      <button
                        key={`${galleryImage}-${index}`}
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        className="btn p-0 border-0 bg-transparent flex-shrink-0"
                        aria-label={`Open vehicle image ${index + 1}`}
                      >
                        <img
                          src={galleryImage}
                          alt={`${carName} preview ${index + 1}`}
                          className="rounded-4 border"
                          style={{
                            width: '78px',
                            height: '62px',
                            objectFit: 'cover',
                            borderColor:
                              index === activeImageIndex ? '#ef4444' : 'rgba(15, 23, 42, 0.08)',
                            borderWidth: index === activeImageIndex ? '2px' : '1px',
                            borderStyle: 'solid',
                          }}
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="card-body p-0 d-flex flex-column" style={{ minHeight: 0 }}>
              <div
                className="p-4 d-flex flex-column gap-4 overflow-auto flex-grow-1"
                style={{
                  minHeight: 0,
                  overflowY: 'auto',
                  overscrollBehavior: 'contain',
                }}
              >
                <div>
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div>
                      <p className="text-uppercase small fw-bold text-danger mb-2">
                        3D Showroom
                      </p>
                      <h2 className="fw-bold mb-1">{carName}</h2>
                    </div>
                  </div>

                  <p className="text-muted mb-3">{showroomDescription}</p>

                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge rounded-pill bg-dark-subtle text-dark-emphasis px-3 py-2">
                      <FiCamera className="me-2" />
                      {carGallery.length || 1} real image{carGallery.length === 1 ? '' : 's'}
                    </span>
                    {highlightChips.slice(0, 4).map((chip) => (
                      <span
                        key={chip}
                        className="badge rounded-pill px-3 py-2"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#b91c1c',
                        }}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-4">
                    <div className="rounded-4 bg-light p-3 h-100">
                      <div className="small text-muted mb-1">Year</div>
                      <div className="fw-semibold">{carYear || '--'}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="rounded-4 bg-light p-3 h-100">
                      <div className="small text-muted mb-1">Rate</div>
                      <div className="fw-semibold">{carPrice ? `$${carPrice}` : '--'}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="rounded-4 bg-light p-3 h-100">
                      <div className="small text-muted mb-1">Class</div>
                      <div className="fw-semibold">{categoryMeta.label}</div>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-4 p-3 p-lg-4 text-white"
                  style={{
                    background:
                      'linear-gradient(145deg, rgba(10,15,28,0.98), rgba(24,35,55,0.96), rgba(58,16,32,0.95))',
                    boxShadow: '0 24px 50px rgba(15, 23, 42, 0.18)',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div>
                      <p
                        className="small fw-bold mb-2"
                        style={{
                          color: '#fda4af',
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Performance Check
                      </p>
                      <h3 className="fw-bold mb-1">Real-world showroom stats</h3>
                      <p className="small mb-0" style={{ color: 'rgba(226,232,240,0.78)' }}>
                        Inspired by the reference you shared, but adapted for a rental website
                        instead of a game garage.
                      </p>
                    </div>

                    <span
                      className="badge rounded-pill px-3 py-2"
                      style={{
                        background: 'rgba(248,113,113,0.2)',
                        border: '1px solid rgba(248,113,113,0.35)',
                        color: '#fff',
                      }}
                    >
                      {showroomPerformance.sourceLabel}
                    </span>
                  </div>

                  <div
                    className="rounded-4 p-3 mb-3"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="small fw-semibold mb-1" style={{ color: '#fde68a' }}>
                      Real-world metrics only
                    </div>
                    <div className="small" style={{ color: 'rgba(226,232,240,0.78)' }}>
                      Nitrous, airtime, and landing are intentionally excluded. This board keeps
                      the focus on horsepower, speed, acceleration, and braking.
                    </div>
                  </div>

                  <div className="row g-3">
                    {performanceRows.map((row) => (
                      <div key={row.key} className="col-12">
                        <PerformanceStatRow
                          icon={row.icon}
                          label={row.label}
                          valueLabel={row.valueLabel}
                          progress={row.progress}
                          accentColor={row.accentColor}
                        />
                      </div>
                    ))}
                  </div>

                  <p className="small mb-0 mt-3" style={{ color: 'rgba(226,232,240,0.65)' }}>
                    {showroomPerformance.note}
                  </p>
                </div>

                <div className="rounded-4 border p-3">
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div>
                      <div className="fw-semibold">Modification Overview</div>
                      <div className="small text-muted">
                        {totalEditableGroups} editable groups detected from the
                        current 3D model.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={resetGarage}
                      className="btn btn-outline-dark btn-sm rounded-pill fw-semibold"
                    >
                      <FiRotateCcw className="me-1" />
                      Reset
                    </button>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    {modificationBadges.map((item) => (
                      <span
                        key={item.label}
                        className="badge rounded-pill px-3 py-2"
                        style={{
                          background: `${item.accentColor}18`,
                          color: item.accentColor,
                        }}
                      >
                        {item.label}: {item.value}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-4 border p-3">
                  <div className="d-flex align-items-center gap-2 fw-semibold mb-3">
                    <FiDroplet /> Main Color Finish
                  </div>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {SHOWROOM_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.value}
                        type="button"
                        onClick={() => applyGlobalFinish(swatch.value)}
                        className={`btn rounded-circle border ${
                          primaryColor === swatch.value ? 'border-dark border-3' : ''
                        }`}
                        style={{
                          width: '38px',
                          height: '38px',
                          background: swatch.value,
                        }}
                        title={swatch.label}
                        aria-label={swatch.label}
                      ></button>
                    ))}
                  </div>
                  <div className="d-flex flex-wrap align-items-center gap-3">
                    <label className="d-flex align-items-center gap-2 small fw-semibold text-dark">
                      <FiSliders />
                      Custom finish
                    </label>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(event) => applyGlobalFinish(event.target.value)}
                      className="form-control form-control-color rounded-circle border-0 p-0"
                      style={{ width: '42px', height: '42px' }}
                      title="Choose a custom body finish"
                    />
                    <small className="text-muted">
                      Selected finish: {primaryColor.toUpperCase()}
                    </small>
                  </div>
                </div>

                <div className="rounded-4 border p-3">
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div className="d-flex align-items-center gap-2 fw-semibold">
                      <FiLayers /> Interactive Panels
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setAllPanels(1)}
                        disabled={!orderedParts.length}
                        className="btn btn-dark btn-sm rounded-pill px-3 fw-semibold"
                      >
                        Open All
                      </button>
                      <button
                        type="button"
                        onClick={() => setAllPanels(0)}
                        disabled={!orderedParts.length}
                        className="btn btn-light btn-sm rounded-pill px-3 fw-semibold border"
                      >
                        Close All
                      </button>
                    </div>
                  </div>

                  {orderedParts.length ? (
                    <div className="d-grid gap-3">
                      {orderedParts.map((part) => (
                        <GarageSlider
                          key={part.id}
                          label={part.label}
                          value={Math.round((partValues[part.id] ?? 0) * 100)}
                          onChange={(event) =>
                            updatePartValue(part.id, Number(event.target.value) / 100)
                          }
                          displayValue={`${Math.round(
                            (partValues[part.id] ?? 0) * 100,
                          )}%`}
                          minLabel="Closed"
                          maxLabel="Open"
                          accentColor="#ef4444"
                          hint={`Live ${part.partType} movement mapped from the detected 3D mesh.`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted small">
                      This model loads in 3D, but it does not expose separate
                      doors, bonnet, or trunk meshes yet.
                    </div>
                  )}
                </div>

                <div className="rounded-4 border p-3">
                  <div className="d-flex align-items-center gap-2 fw-semibold mb-3">
                    <FiSliders /> Custom Garage Setup
                  </div>

                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge rounded-pill text-bg-dark px-3 py-2">
                      Wheels: {tuningSupport.wheelCount}
                    </span>
                    <span className="badge rounded-pill text-bg-light px-3 py-2">
                      Mirrors: {tuningSupport.mirrorCount}
                    </span>
                    <span className="badge rounded-pill text-bg-light px-3 py-2">
                      Spoilers: {tuningSupport.spoilerCount}
                    </span>
                    <span className="badge rounded-pill text-bg-light px-3 py-2">
                      Skirts: {tuningSupport.skirtCount}
                    </span>
                    <span className="badge rounded-pill text-bg-light px-3 py-2">
                      Front bumper: {tuningSupport.frontBumperCount}
                    </span>
                    <span className="badge rounded-pill text-bg-light px-3 py-2">
                      Rear bumper: {tuningSupport.rearBumperCount}
                    </span>
                  </div>

                  <div className="d-grid gap-3">
                    <GarageSlider
                      icon={FiMove}
                      label="Suspension Height"
                      value={tuningValues.rideHeight}
                      onChange={(event) =>
                        updateTuningValue('rideHeight', event.target.value)
                      }
                      displayValue={rideHeightLabel}
                      minLabel="Compressed"
                      maxLabel="Extended"
                      accentColor="#f97316"
                      hint={
                        tuningSupport.rideHeightMode === 'suspension'
                          ? 'Adjusts suspension travel and wheel-to-body fitment instead of using a huge body lift.'
                          : 'No wheel groups detected, so this falls back to a softer full-chassis move.'
                      }
                    />

                    <GarageSlider
                      icon={FiDisc}
                      label="Wheel + Tire Size"
                      value={tuningValues.tireSize}
                      onChange={(event) =>
                        updateTuningValue('tireSize', event.target.value)
                      }
                      displayValue={tireSizeLabel}
                      minLabel="Slim"
                      maxLabel="Wide"
                      disabled={!tuningSupport.wheelCount}
                      accentColor="#2563eb"
                      hint={
                        tuningSupport.wheelCount
                          ? `${tuningSupport.wheelCount} wheel assemblies are ready for fitment scaling.`
                          : 'Name wheel meshes with wheel, rim, tire, or tyre to unlock this.'
                      }
                    />

                    <GarageSlider
                      icon={FiMove}
                      label="Wheel Stance"
                      value={tuningValues.wheelTrack}
                      onChange={(event) =>
                        updateTuningValue('wheelTrack', event.target.value)
                      }
                      displayValue={wheelTrackLabel}
                      minLabel="Tucked"
                      maxLabel="Wide"
                      disabled={!tuningSupport.wheelCount}
                      accentColor="#1d4ed8"
                      hint={
                        tuningSupport.wheelCount
                          ? 'Pushes the detected wheels inward or outward for a wider street fit.'
                          : 'Wheel stance needs separate wheel assemblies in the GLB.'
                      }
                    />

                    <GarageSlider
                      icon={FiLayers}
                      label="Spoiler Size"
                      value={tuningValues.spoilerSize}
                      onChange={(event) =>
                        updateTuningValue('spoilerSize', event.target.value)
                      }
                      displayValue={spoilerSizeLabel}
                      minLabel="Clean"
                      maxLabel="Aggressive"
                      disabled={!tuningSupport.spoilerCount}
                      accentColor="#111827"
                      hint={
                        tuningSupport.spoilerCount
                          ? `${tuningSupport.spoilerCount} spoiler meshes detected for scaling.`
                          : 'Upload spoiler or wing meshes to make this slider active.'
                      }
                    />

                    <GarageSlider
                      icon={FiBox}
                      label="Side Skirt Depth"
                      value={tuningValues.skirtSize}
                      onChange={(event) =>
                        updateTuningValue('skirtSize', event.target.value)
                      }
                      displayValue={skirtSizeLabel}
                      minLabel="Tucked"
                      maxLabel="Deep"
                      disabled={!tuningSupport.skirtCount}
                      accentColor="#16a34a"
                      hint={
                        tuningSupport.skirtCount
                          ? `${tuningSupport.skirtCount} skirt meshes detected for body-kit tuning.`
                          : 'Use mesh names like skirt, underdoor, or rocker to enable it.'
                      }
                    />

                    <GarageSlider
                      icon={FiLayers}
                      label="Front Bumper"
                      value={tuningValues.frontBumperDepth}
                      onChange={(event) =>
                        updateTuningValue('frontBumperDepth', event.target.value)
                      }
                      displayValue={frontBumperLabel}
                      minLabel="Clean"
                      maxLabel="Track"
                      disabled={!tuningSupport.frontBumperCount}
                      accentColor="#2563eb"
                      hint={
                        tuningSupport.frontBumperCount
                          ? 'Pushes the front bumper and splitter forward for a more aggressive NFS-style nose.'
                          : 'Front bumper tuning needs a separate front bumper or splitter mesh.'
                      }
                    />

                    <GarageSlider
                      icon={FiLayers}
                      label="Rear Bumper"
                      value={tuningValues.rearBumperDepth}
                      onChange={(event) =>
                        updateTuningValue('rearBumperDepth', event.target.value)
                      }
                      displayValue={rearBumperLabel}
                      minLabel="Clean"
                      maxLabel="Track"
                      disabled={!tuningSupport.rearBumperCount}
                      accentColor="#0891b2"
                      hint={
                        tuningSupport.rearBumperCount
                          ? 'Extends the rear bumper and diffuser zone for a more aggressive rear profile.'
                          : 'Rear bumper tuning needs a separate rear bumper or diffuser mesh.'
                      }
                    />

                    <GarageSlider
                      icon={FiBox}
                      label="Side Mirror Size"
                      value={tuningValues.mirrorSize}
                      onChange={(event) =>
                        updateTuningValue('mirrorSize', event.target.value)
                      }
                      displayValue={mirrorSizeLabel}
                      minLabel="Compact"
                      maxLabel="Extended"
                      disabled={!tuningSupport.mirrorCount}
                      accentColor="#64748b"
                      hint={
                        tuningSupport.mirrorCount
                          ? `${tuningSupport.mirrorCount} side mirror meshes detected for tuning.`
                          : 'Add mesh names like mirror or side mirror to enable this control.'
                      }
                    />
                  </div>
                </div>

                <div className="rounded-4 border p-3">
                  <div className="d-flex align-items-center gap-2 fw-semibold mb-2">
                    <FiDroplet /> Detail Finishes
                  </div>
                  <p className="small text-muted mb-3">
                    Keep the main color picker, then fine-tune supported zones
                    like the bonnet, bumpers, side mirrors, spoiler, and skirts.
                  </p>

                  {activePaintZones.length ? (
                    <div className="d-grid gap-3">
                      {activePaintZones.map((zone) => {
                        const zoneColor = paintValues[zone.key] ?? zone.defaultColor;

                        return (
                          <div
                            key={zone.key}
                            className="rounded-4 border p-3"
                            style={{ background: `${zone.accentColor}08` }}
                          >
                            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                              <div>
                                <div className="fw-semibold">{zone.label}</div>
                                <div className="small text-muted">{zone.hint}</div>
                              </div>

                              <span
                                className="badge rounded-pill px-3 py-2"
                                style={{
                                  background: `${zone.accentColor}18`,
                                  color: zone.accentColor,
                                }}
                              >
                                {tuningSupport.paintZones?.[zone.key] || 0} materials
                              </span>
                            </div>

                            <div className="d-flex flex-wrap gap-2 mb-3">
                              {SHOWROOM_SWATCHES.map((swatch) => (
                                <button
                                  key={`${zone.key}-${swatch.value}`}
                                  type="button"
                                  onClick={() => updatePaintValue(zone.key, swatch.value)}
                                  className={`btn rounded-circle border ${
                                    zoneColor === swatch.value ? 'border-dark border-3' : ''
                                  }`}
                                  style={{
                                    width: '34px',
                                    height: '34px',
                                    background: swatch.value,
                                  }}
                                  title={`${zone.label}: ${swatch.label}`}
                                  aria-label={`${zone.label}: ${swatch.label}`}
                                ></button>
                              ))}
                            </div>

                            <div className="d-flex align-items-center gap-3">
                              <input
                                type="color"
                                value={zoneColor}
                                onChange={(event) =>
                                  updatePaintValue(zone.key, event.target.value)
                                }
                                className="form-control form-control-color rounded-circle border-0 p-0"
                                title={`${zone.label} custom color`}
                              />
                              <small className="text-muted">
                                Current finish: {zoneColor.toUpperCase()}
                              </small>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-muted small">
                      No dedicated paint zones were detected in this model yet,
                      so the main finish will color the body as one piece.
                    </div>
                  )}
                </div>

                <div className="rounded-4 border p-3">
                  <div className="d-flex align-items-center gap-2 fw-semibold mb-2">
                    <FiMessageSquare /> Quick Support Message
                  </div>
                  <p className="small text-muted mb-3">
                    Open the floating chat with a ready-made message, or edit your own note first.
                  </p>

                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {quickSupportPrompts.slice(0, 3).map((prompt) => (
                      <button
                        key={prompt.text}
                        type="button"
                        onClick={() => {
                          setSupportDraft(prompt.text);
                          openSupportComposer(prompt.text);
                        }}
                        className="btn btn-outline-dark btn-sm rounded-pill px-3"
                      >
                        {prompt.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    className="form-control rounded-4 mb-3"
                    rows="3"
                    value={supportDraft}
                    onChange={(event) => setSupportDraft(event.target.value)}
                    placeholder={
                      quickSupportPrompts[0]?.text || 'Type a support message for this car.'
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      openSupportComposer(supportDraft || quickSupportPrompts[0]?.text)
                    }
                    className="btn btn-danger rounded-pill fw-bold w-100 py-3"
                  >
                    Open Chat With This Message
                  </button>
                </div>

                <div className="rounded-4 bg-light p-3">
                  <div className="d-flex align-items-center gap-2 fw-semibold mb-2">
                    <FiBox /> Garage Notes
                  </div>
                  <p className="text-muted small mb-0">
                    The best customizer results come from GLB files with separate mesh names such
                    as <code>door</code>, <code>hood</code>, <code>trunk</code>,{' '}
                    <code>wheel</code>, <code>mirror</code>, <code>spoiler</code>, and{' '}
                    <code>skirt</code>.
                  </p>
                </div>

                <div className="rounded-4 border p-3">
                  <div className="d-flex align-items-center gap-2 fw-semibold mb-2">
                    <FiUsers /> Rental Assistance
                  </div>
                  <p className="text-muted small mb-3">{rentalAction.description}</p>
                  <button
                    type="button"
                    onClick={rentalAction.onClick}
                    className={`btn ${rentalAction.style} rounded-pill fw-bold py-3 w-100`}
                  >
                    {rentalAction.label}
                  </button>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button onClick={onBack} className="btn btn-dark rounded-pill fw-bold py-3 w-100">
                  &larr; Back to Fleet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CarShowroom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedCarId = searchParams.get('car') || location.state?.carId || '';
  const stateVehicle = useMemo(() => {
    if (!location.state?.carName && !location.state?.carId) {
      return null;
    }

    return enrichVehicleRecord({
      id: location.state?.carId,
      name: location.state?.carName || 'Unknown Car',
      image: location.state?.carImage,
      galleryImages: location.state?.galleryImages,
      year: location.state?.carYear,
      price: location.state?.carPrice,
      category: location.state?.categoryLabel,
      modelUrl: location.state?.modelUrl,
      showroomSummary: location.state?.showroomSummary,
      supportPromptTemplate: location.state?.supportPromptTemplate,
      partHighlights: location.state?.partHighlights,
      ...(location.state?.performanceProfile || {}),
    });
  }, [location.state]);
  const [resolvedVehicle, setResolvedVehicle] = useState(stateVehicle);
  const [loadingVehicle, setLoadingVehicle] = useState(
    Boolean(requestedCarId) && !stateVehicle,
  );

  useEffect(() => {
    setResolvedVehicle(stateVehicle);
    if (stateVehicle) {
      setLoadingVehicle(false);
    }
  }, [stateVehicle]);

  useEffect(() => {
    if (stateVehicle || !requestedCarId) {
      return undefined;
    }

    let isActive = true;

    const loadVehicle = async () => {
      setLoadingVehicle(true);

      try {
        const [localVehicle, remoteVehicles] = await Promise.all([
          findStoredVehicleById(requestedCarId),
          fetch(buildApiUrl('/cars'))
            .then((response) => (response.ok ? response.json() : []))
            .catch(() => []),
        ]);

        if (!isActive) {
          return;
        }

        const mergedVehicles = mergeVehicleCollections(
          localVehicle ? [localVehicle] : await listStoredVehicles().catch(() => []),
          remoteVehicles,
        );
        const matchedVehicle =
          mergedVehicles.find((vehicle) => String(vehicle.id) === String(requestedCarId)) || null;

        setResolvedVehicle(matchedVehicle ? enrichVehicleRecord(matchedVehicle) : null);
      } catch {
        if (!isActive) {
          return;
        }

        const fallbackVehicle = await findStoredVehicleById(requestedCarId).catch(() => null);
        setResolvedVehicle(fallbackVehicle ? enrichVehicleRecord(fallbackVehicle) : null);
      } finally {
        if (isActive) {
          setLoadingVehicle(false);
        }
      }
    };

    loadVehicle();

    return () => {
      isActive = false;
    };
  }, [requestedCarId, stateVehicle]);

  if (loadingVehicle) {
    return (
      <div className="bg-light min-vh-100">
        <Navbar />
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ minHeight: '100vh', paddingTop: '96px' }}
        >
          <div className="text-center">
            <div className="spinner-border text-danger mb-3"></div>
            <div className="fw-semibold">Loading showroom vehicle...</div>
            <div className="text-muted small">
              Restoring the selected car from the fleet library.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!resolvedVehicle?.modelUrl) {
    return (
      <div className="bg-light min-vh-100">
        <Navbar />
        <div
          className="container d-flex align-items-center justify-content-center"
          style={{ minHeight: '100vh', paddingTop: '96px', paddingBottom: '48px' }}
        >
          <div className="card border-0 shadow-lg rounded-5 p-5 text-center" style={{ maxWidth: '520px' }}>
            <h2 className="fw-bold mb-3">Showroom model not available</h2>
            <p className="text-muted mb-4">
              This vehicle record could not be restored with a 3D showroom model. Please return to
              the fleet page and open the car again.
            </p>
            <button
              type="button"
              onClick={() => navigate('/available')}
              className="btn btn-dark rounded-pill fw-bold px-4 py-3"
            >
              Back To Available Cars
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ShowroomExperience
      key={resolvedVehicle.modelUrl || resolvedVehicle.name}
      carId={resolvedVehicle.id}
      carName={resolvedVehicle.name}
      carImage={resolvedVehicle.image}
      galleryImages={resolvedVehicle.galleryImages}
      carYear={resolvedVehicle.year}
      carPrice={resolvedVehicle.price}
      categoryLabel={resolvedVehicle.categoryLabel || resolvedVehicle.category}
      carModelUrl={resolvedVehicle.modelUrl}
      performanceProfile={resolvedVehicle.performanceProfile || resolvedVehicle}
      showroomSummary={resolvedVehicle.showroomSummary}
      supportPromptTemplate={resolvedVehicle.supportPromptTemplate}
      partHighlights={resolvedVehicle.partHighlights}
      onBack={() => navigate(-1)}
      onRequestRental={(selectedCarId) =>
        navigate(
          selectedCarId
            ? `/available?rent=${encodeURIComponent(selectedCarId)}`
            : '/login',
        )
      }
      onManageAccess={() => navigate('/admin/manage-users')}
    />
  );
};

export default CarShowroom;

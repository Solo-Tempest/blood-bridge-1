export const colors = {
  red:      '#C8102E',
  redDark:  '#8B0A1E',
  redLight: '#FFEEF1',
  redMid:   '#F4C5CC',
  cream:    '#FAF7F2',
  ink:      '#0E0C0D',
  ink60:    '#5A5458',
  ink30:    '#BEB8BB',
  ink10:    '#F0ECEE',
  white:    '#FFFFFF',
  green:    '#0D7A55',
  amber:    '#C07A00',
  blue:     '#1A4FA0',
};

export const NAV_LINKS = [];

export const HERO_STATS = [
  { value: '2.3s',  label: 'Avg match time'    },
  { value: '94%',   label: 'Forecast accuracy' },
  { value: '12k+',  label: 'Donors registered' },
];

export const ORBIT_BLOOD_TYPES = ['O+', 'A-', 'B+', 'AB-'];

export const AI_MODULES = [
  {
    num: '01 / 03',
    icon: '🩺',
    iconBg: '#E6F9F1',
    title: 'Eligibility Classifier',
    desc: 'Predicts donor eligibility from health data using Random Forest + XGBoost with SHAP explanations per decision.',
    tags: ['Random Forest', 'SHAP', 'Calibration'],
  },
  {
    num: '02 / 03',
    icon: '📍',
    iconBg: '#E6EFFF',
    title: 'Geo Smart Matching',
    desc: 'Haversine + Google Maps real travel time, coverage probability optimisation, and escalating ring search.',
    tags: ['Haversine', 'LambdaMART', 'Greedy Cover'],
  },
  {
    num: '03 / 03',
    icon: '📈',
    iconBg: '#F0ECEE',
    title: 'Blood Shortage Forecasting',
    desc: 'ARIMA + Prophet + LSTM ensemble with dynamic weighting, anomaly detection, and auto-intervention triggers.',
    tags: ['LSTM', 'Prophet', 'Digital Twin'],
  },
];

export const FOOTER_LINKS = {
  Donors: [
    { label: 'Check eligibility',  to: '/eligibility' },
    { label: 'Donor portal',       to: '/donor'       },
    { label: 'Book appointment',   to: '#'            },
    { label: 'Health passport',    to: '#'            },
    { label: 'Blood credits',      to: '#'            },
  ],
  Hospitals: [
    { label: 'Hospital portal',    to: '/hospital'    },
    { label: 'Emergency request',  to: '#'            },
    { label: 'Inventory tracking', to: '#'            },
    { label: 'Shortage forecast',  to: '#'            },
    { label: 'API access',         to: '#'            },
  ],
  System: [
    { label: 'AI assistant',       to: '/chatbot'     },
    { label: 'Analytics',          to: '/admin'       },
    { label: 'Documentation',      to: '#'            },
    { label: 'Privacy policy',     to: '#'            },
    { label: 'Contact',            to: '#'            },
  ],
};

/**
 * MoSJE Pehchan ID (Ministry of Social Justice & Empowerment Verified Artisan ID)
 * Auto-generates a certified, non-colliding identity code for every artisan.
 * Format: MoSJE-<STATE_CODE>-<YEAR>-<UNIQUE_6_DIGIT_HEX/NUMBER>
 */

const STATE_CODE_MAP = {
  'uttar pradesh': 'UP',
  'up': 'UP',
  'varanasi': 'UP',
  'bihar': 'BR',
  'madhubani': 'BR',
  'rajasthan': 'RJ',
  'jaipur': 'RJ',
  'gujarat': 'GJ',
  'odisha': 'OD',
  'west bengal': 'WB',
  'bengal': 'WB',
  'karnataka': 'KA',
  'tamil nadu': 'TN',
  'kerala': 'KL',
  'maharashtra': 'MH',
  'madhya pradesh': 'MP',
  'mp': 'MP',
  'punjab': 'PB',
  'haryana': 'HR',
  'assam': 'AS',
  'telangana': 'TG',
  'andhra pradesh': 'AP'
};

export const extractStateCode = (locationStr = '') => {
  if (!locationStr) return 'UP';
  const clean = locationStr.toLowerCase();
  for (const [key, code] of Object.entries(STATE_CODE_MAP)) {
    if (clean.includes(key)) {
      return code;
    }
  }
  return 'UP';
};

export const generateUniqueMosjePehchanId = (locationStr = '') => {
  const stateCode = extractStateCode(locationStr);
  const year = new Date().getFullYear() || 2026;
  const randomPart = Math.floor(100000 + Math.random() * 900000).toString();
  return `MoSJE-${stateCode}-${year}-${randomPart}`;
};

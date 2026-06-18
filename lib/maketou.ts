// Configuration Maketou
const MAKETOU_API_KEY = process.env.MAKETOU_API_KEY?.trim();
const MAKETOU_BASE_URL = 'https://api.maketou.net/api/v1';

if (!MAKETOU_API_KEY) {
  console.warn('MAKETOU_API_KEY is not configured. Checkout requests will fail until this variable is set.');
}

export { MAKETOU_API_KEY, MAKETOU_BASE_URL };

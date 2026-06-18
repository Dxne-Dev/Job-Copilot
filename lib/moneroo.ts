// Configuration Moneroo
const MONEROO_API_KEY = process.env.MONEROO_API_KEY?.trim();
const MONEROO_BASE_URL = 'https://api.moneroo.io/v1';

if (!MONEROO_API_KEY) {
  console.warn('MONEROO_API_KEY is not configured. Checkout requests will fail until this variable is set.');
}

export { MONEROO_API_KEY, MONEROO_BASE_URL };

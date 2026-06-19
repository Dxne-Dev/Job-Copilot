// Configuration MoneyFusion (Fusion Pay)
const MONEYFUSION_API_URL = process.env.MONEYFUSION_API_URL?.trim();

if (!MONEYFUSION_API_URL) {
  console.warn('MONEYFUSION_API_URL is not configured. Checkout requests will fail until this variable is set.');
}

export { MONEYFUSION_API_URL };

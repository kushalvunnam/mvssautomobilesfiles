const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const normalizedApiBaseUrl = configuredApiBaseUrl
  ? configuredApiBaseUrl.replace(/\/$/, '')
  : '';

export const API_BASE_URL = normalizedApiBaseUrl
  ? (normalizedApiBaseUrl.endsWith('/api') ? normalizedApiBaseUrl : `${normalizedApiBaseUrl}/api`)
  : (import.meta.env.DEV ? '/api' : 'https://mvssautomobilesfiles-rkp4.onrender.com/api');

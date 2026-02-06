/**
 * API Configuration
 * 
 * In development, we use relative paths ('/api/...') which are proxied by package.json proxy.
 * In production, we use the REACT_APP_API_URL environment variable.
 * 
 * However, the user request wants a unified way that works for both.
 * If REACT_APP_API_URL is set, we use it. If not, we fall back to relative path (or empty string pre-pend).
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Sanitize API_BASE_URL to remove trailing slash
const sanitizedBaseUrl = API_BASE_URL.replace(/\/$/, '');

export const getApiUrl = (endpoint: string): string => {
    // Ensure endpoint starts with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${sanitizedBaseUrl}${cleanEndpoint}`;
};

export const API_URL = API_BASE_URL;

export default API_BASE_URL;

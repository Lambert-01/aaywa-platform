// API utility functions for AAYWA & PARTNERS Dashboard

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Get authentication token from localStorage
 * In production, this should come from a proper auth context
 */
export const getAuthToken = (): string | null => {
    return localStorage.getItem('aaywa_token');
};

/**
 * Generic API request wrapper with JWT authentication
 */
export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAuthToken();

    const defaultHeaders: HeadersInit = {};

    // Only set Content-Type to JSON if body is NOT FormData
    if (!(options.body instanceof FormData)) {
        defaultHeaders['Content-Type'] = 'application/json';
    }

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Handle non-200 responses
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: response.statusText,
            }));

            throw new Error(
                errorData.message || `API Error: ${response.status} ${response.statusText}`
            );
        }

        // Parse JSON response
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`API Request Failed [${endpoint}]:`, error);
        throw error;
    }
}

/**
 * GET request helper
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'GET' });
}

/**
 * POST request helper
 */
export async function apiPost<T>(endpoint: string, body: any): Promise<T> {
    const isFormData = body instanceof FormData;
    return apiRequest<T>(endpoint, {
        method: 'POST',
        body: isFormData ? body : JSON.stringify(body),
    });
}

/**
 * PATCH request helper
 */
export async function apiPatch<T>(endpoint: string, body: any): Promise<T> {
    const isFormData = body instanceof FormData;
    return apiRequest<T>(endpoint, {
        method: 'PATCH',
        body: isFormData ? body : JSON.stringify(body),
    });
}

/**
 * PUT request helper
 */
export async function apiPut<T>(endpoint: string, body: any): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'DELETE' });
}

/**
 * Upload file helper
 */
export async function apiUpload<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
): Promise<T> {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, String(value));
        });
    }

    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: response.statusText,
            }));
            throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`File Upload Failed [${endpoint}]:`, error);
        throw error;
    }
}

/**
 * Handle API errors with user-friendly messages
 */
export function handleApiError(error: any): string {
    if (error.message) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unexpected error occurred. Please try again.';
}

// qr-digital-menu-system/frontend/js/api.js

// IMPORTANT: Change this to your deployed Render backend URL!
const API_BASE_URL = 'https://menu-qr-61oz.onrender.com/api'; // <--- Update this line!

/**
 * Helper function to make authenticated API requests.
 * @param {string} endpoint - The API endpoint (e.g., '/auth/login', '/users', '/products').
 * @param {string} method - HTTP method (e.g., 'GET', 'POST', 'PUT', 'DELETE').
 * @param {object} [body=null] - Request body for POST/PUT requests.
 * @param {boolean} [requiresAuth=true] - Whether the request requires a JWT token.
 * @param {boolean} [isFormData=false] - Whether the body is FormData (for file uploads).
 * @returns {Promise<object>} - A promise that resolves with the JSON response.
 */
async function apiRequest(endpoint, method = 'GET', body = null, requiresAuth = true, isFormData = false) {
    const headers = {};
    const config = {
        method: method,
    };

    if (requiresAuth) {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No authentication token found. Redirecting to login.');
            window.location.href = 'login.html'; // Redirect to login if token is missing
            throw new Error('Authentication token missing.');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
        if (isFormData) {
            config.body = body; // FormData handles its own Content-Type
        } else {
            headers['Content-Type'] = 'application/json';
            config.body = JSON.stringify(body);
        }
    }

    config.headers = headers;

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        const contentType = response.headers.get('content-type');
        let data = null;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            const error = data.message || response.statusText || 'Something went wrong';
            const status = response.status;
            throw new Error(JSON.stringify({ message: error, status: status }));
        }

        return data;

    } catch (error) {
        console.error(`API Error on ${method} ${endpoint}:`, error);
        let errorMessage = 'An unknown error occurred.';
        let errorStatus = 500;
        try {
            const parsedError = JSON.parse(error.message);
            errorMessage = parsedError.message || errorMessage;
            errorStatus = parsedError.status || errorStatus;
        } catch (parseError) {
            errorMessage = error.message || errorMessage;
        }

        if (errorStatus === 401) {
            console.warn('Unauthorized request. Redirecting to login.');
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            window.location.href = 'login.html';
        }

        throw new Error(errorMessage);
    }
}
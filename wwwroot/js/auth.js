/**
 * Authentication management for AtivosPlus
 * Handles token validation and user authentication across all pages
 */

/**
 * Get cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

/**
 * Clear authentication cookies
 */
function clearAuthCookies() {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

/**
 * Redirect to login page
 */
function redirectToLogin() {
    window.location.href = '/';
}

/**
 * Check if user has valid authentication cookies
 * @returns {boolean} - True if cookies exist, false otherwise
 */
function hasAuthCookies() {
    const token = getCookie('token');
    const username = getCookie('username');
    return !!(token && username);
}

/**
 * Validate user authentication with the server
 * @returns {Promise<boolean>} - True if authentication is valid, false otherwise
 */
async function validateUserAuth() {
    try {
        const response = await fetch('/api/userinfo/getInfo?id=-1', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            console.log('Authentication failed: 401 Unauthorized');
            return false;
        }

        if (!response.ok) {
            console.warn(`Authentication check returned status: ${response.status}`);
            return false;
        }

        // If we get here, authentication is valid
        return true;
    } catch (error) {
        console.error('Error validating authentication:', error);
        return false;
    }
}

/**
 * Main authentication check function
 * Checks cookies and validates with server, redirects if necessary
 */
async function checkAuthentication() {
    // Skip authentication check if we're already on the login page
    if (window.location.pathname === '/' || window.location.pathname === '/Index') {
        return;
    }

    console.log('Checking authentication...');

    // Validate authentication with server
    const isValid = await validateUserAuth();

    if (!isValid) {
        console.log('Authentication validation failed, redirecting to login');
        clearAuthCookies();
        redirectToLogin();
        return;
    }

    console.log('Authentication check passed');
}

/**
 * Initialize authentication check when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function () {
    checkAuthentication();
});

/**
 * Export functions for use in other scripts
 */
window.AuthManager = {
    getCookie,
    clearAuthCookies,
    redirectToLogin,
    hasAuthCookies,
    validateUserAuth,
    checkAuthentication
};

/**
 * Authentication check script
 * Include this in all protected pages to verify user authentication
 */
(function() {
  // Get auth token from localStorage
  const token = localStorage.getItem(CONFIG.AUTH_TOKEN_KEY);
  
  // If no token exists, redirect to login page
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  
  // Function to decode JWT token without using external libraries
  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error parsing JWT token:', e);
      return null;
    }
  }
  
  // Check if token is expired
  const decodedToken = parseJwt(token);
  if (decodedToken) {
    // Check expiration (exp is in seconds since Unix epoch)
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      console.log('Token expired, redirecting to login');
      localStorage.removeItem(CONFIG.AUTH_TOKEN_KEY);
      window.location.href = 'login.html?expired=true';
      return;
    }
  } else {
    // Invalid token format
    localStorage.removeItem(CONFIG.AUTH_TOKEN_KEY);
    window.location.href = 'login.html?invalid=true';
    return;
  }
})();

// src/utils/auth.js - TOKEN MANAGER UTILITY
class AuthTokenManager {
  constructor() {
    this.tokenKey = 'authToken';
    this.userKey = 'userData';
  }

  // Clear ALL storage completely
  clearAllStorage() {
    try {
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any cookies that might be set
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
      
      console.log('✅ All storage cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing storage:', error);
    }
  }

  // Store token in ONE location only
  setToken(token) {
    try {
      this.clearAllStorage(); // Clear old tokens first
      localStorage.setItem(this.tokenKey, token);
      console.log('✅ Token stored securely in localStorage');
    } catch (error) {
      console.error('❌ Error storing token:', error);
    }
  }

  // Get token from single source
  getToken() {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  }

  // Remove token
  removeToken() {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      console.log('✅ Token removed from storage');
    } catch (error) {
      console.error('❌ Error removing token:', error);
    }
  }

  // Validate token with server
  async validateToken() {
    const token = this.getToken();
    
    if (!token) {
      console.log('❌ No token found in storage');
      this.redirectToLogin();
      return null;
    }

    try {
      const response = await fetch('/api/auth/validate-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Token is valid for user:', data.user.email);
        return data.user;
      } else {
        console.log('❌ Token validation failed - server rejected token');
        this.removeToken();
        this.redirectToLogin();
        return null;
      }
    } catch (error) {
      console.error('❌ Token validation error:', error);
      this.removeToken();
      this.redirectToLogin();
      return null;
    }
  }

  // Safe API call with token validation
  async safeApiCall(url, options = {}) {
    const user = await this.validateToken();
    if (!user) {
      throw new Error('Authentication required');
    }

    const token = this.getToken();
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Redirect to login
  redirectToLogin() {
    if (window.location.pathname !== '/login' && !window.location.pathname.includes('/auth')) {
      console.log('🔐 Redirecting to login...');
      window.location.href = '/login';
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const user = await this.validateToken();
    return !!user;
  }

  // Check if user is admin
  async isAdmin() {
    const user = await this.validateToken();
    return user && (user.userType === 'admin' || user.role === 'admin' || user.role === 'super-admin');
  }
}

// Create singleton instance
const authTokenManager = new AuthTokenManager();
export default authTokenManager;
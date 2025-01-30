import Cookies from 'js-cookie';

// Simple auth service with hardcoded credentials
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'infobip2024';

export const auth = {
  isAuthenticated: false,

  login(username: string, password: string): boolean {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      Cookies.set('auth', 'true', { secure: true });
      return true;
    }
    return false;
  },

  logout() {
    Cookies.remove('auth');
  },

  checkAuth(): boolean {
    return Cookies.get('auth') === 'true';
  }
}; 
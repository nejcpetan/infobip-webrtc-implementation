import Cookies from 'js-cookie';

export const auth = {
  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        Cookies.set('auth', 'true', { secure: true });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Auth error:', error);
      return false;
    }
  },

  logout() {
    Cookies.remove('auth');
  },

  checkAuth(): boolean {
    return Cookies.get('auth') === 'true';
  }
}; 
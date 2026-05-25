import { create } from 'zustand';

interface AuthState {
  token: string | null;
  userEmail: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

// Zero-dependency browser JWT decoder
function parseJwt(token: string): { sub: string } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

const getInitialToken = () => {
  return localStorage.getItem('jwt_token');
};

const getInitialUserEmail = () => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    const decoded = parseJwt(token);
    return decoded ? decoded.sub : null;
  }
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: getInitialToken(),
  userEmail: getInitialUserEmail(),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('jwt_token', token);
      const decoded = parseJwt(token);
      set({ token, userEmail: decoded ? decoded.sub : null });
    } else {
      localStorage.removeItem('jwt_token');
      set({ token: null, userEmail: null });
    }
  },
  logout: () => {
    localStorage.removeItem('jwt_token');
    set({ token: null, userEmail: null });
  },
}));

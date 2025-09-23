// src/app/Auth/AuthVar.js
// Simple reactive AuthVar (no extra deps)

const listeners = new Set();

const defaultState = {
  token: null,
  user: null, // { id, email, firstName, lastName, role }
};

let state = { ...defaultState };

// helpers
export const AuthVar = {
  get() {
    return { ...state };
  },

  set(auth) {
    state = { ...state, ...auth };
    listeners.forEach((fn) => {
      try { fn(state); } catch (e) { console.error(e); }
    });
    return state;
  },

  setUser(user) {
    state = { ...state, user };
    listeners.forEach((fn) => fn(state));
    return state;
  },

  setToken(token) {
    state = { ...state, token };
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    listeners.forEach((fn) => fn(state));
    return state;
  },

  clear() {
    state = { ...defaultState };
    localStorage.removeItem('token');
    listeners.forEach((fn) => fn(state));
    return state;
  },

  subscribe(fn) {
    listeners.add(fn);
    // return unsubscribe
    return () => listeners.delete(fn);
  }
};

// initialize from localStorage if present
const tokenFromLs = localStorage.getItem('token');
if (tokenFromLs) {
  AuthVar.setToken(tokenFromLs);
  // optionally you may fetch /me to populate user later
}

export default AuthVar;

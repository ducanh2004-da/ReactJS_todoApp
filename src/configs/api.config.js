import axios from 'axios';

const GRAPHQL_URL = import.meta.env.VITE_REACT_APP_GRAPHQL_URL || 'http://localhost:3000/graphql';

// tạo instance axios
const api = axios.create({
  baseURL: GRAPHQL_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
  timeout: 10000,
});

// request interceptor: tự thêm Authorization nếu có token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// response interceptor: handle 401 (đơn giản: clear token + redirect)
api.interceptors.response.use((res) => res, (error) => {
  const status = error?.response?.status;
  if (status === 401) {
    try {
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('auth:logout'));
    } catch (e) { }
    window.location.href = '/signin';
  }
  return Promise.reject(error);
});

// helper gọi graphql end-point bằng axios
export async function graphqlRequest(query, variables = {}) {
  const resp = await api.post('', { query, variables });
  if (resp?.data?.errors && resp.data.errors.length) {
    const msg = resp.data.errors.map((e) => e.message).join('; ');
    const err = new Error(msg);
    err.graphQLErrors = resp.data.errors;
    throw err;
  }
  return resp.data.data;
}

export default api;

import axios from 'axios'

// Configurable per-environment; falls back to the deployed API for production builds.
const baseURL = import.meta.env.VITE_API_URL || 'https://slipsafe.onrender.com/api'

const api = axios.create({ baseURL })

// Attach the auth token to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On an expired/invalid token, clear the session and bounce to login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

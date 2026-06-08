import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import CustomerDashboard from './pages/CustomerDashboard'
import ProductSetup from './pages/ProductSetup'
import POSTerminal from './pages/POSTerminal'
import Setup from './pages/Setup'


const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><CustomerDashboard /></PrivateRoute>} />
        <Route path="/pos" element={<PrivateRoute><POSTerminal /></PrivateRoute>} />
        <Route index element={<POSTerminal />} />
        <Route path="setup" element={<Setup />} />
      </Routes>
    </BrowserRouter>
  )
}
import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000/api'

const BRANDS = [
  { name: 'KHADI', location: 'Defence, Karachi', token: null },
  { name: 'BONANZA', location: 'Clifton, Karachi', token: null },
  { name: 'KHAADI', location: 'Dolmen Mall, Karachi', token: null },
  { name: 'OUTFITTERS', location: 'Lucky One Mall, Karachi', token: null },
]

const PRESET_ITEMS = {
  KHADI: [
    { name: 'Lawn Shirt', price: 2450 },
    { name: 'Dupatta', price: 1200 },
    { name: 'Trouser', price: 1800 },
    { name: 'Kurta', price: 3200 },
  ],
  BONANZA: [
    { name: 'Waistcoat', price: 4500 },
    { name: 'Shalwar Kameez', price: 5200 },
    { name: 'Shawl', price: 2800 },
  ],
  KHAADI: [
    { name: 'Printed Kurta', price: 3800 },
    { name: 'Embroidered Shirt', price: 6500 },
    { name: 'Palazzo', price: 2200 },
  ],
  OUTFITTERS: [
    { name: 'Jeans', price: 4200 },
    { name: 'T-Shirt', price: 1800 },
    { name: 'Hoodie', price: 3500 },
  ],
}

export default function POSTerminal() {
  const [selectedBrand, setSelectedBrand] = useState(BRANDS[0])
  const [customerEmail, setCustomerEmail] = useState('')
  const [items, setItems] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [printing, setPrinting] = useState(false)
  const [printed, setPrinted] = useState(false)
  const [error, setError] = useState('')
  const [brandEmail, setBrandEmail] = useState('')
  const [brandPassword, setBrandPassword] = useState('')
  const [token, setToken] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const loginBrand = async () => {
    try {
      const { data } = await axios.post(`${API}/auth/login`, {
        email: brandEmail,
        password: brandPassword
      })
      setToken(data.token)
      setLoggedIn(true)
      setSelectedBrand({ ...selectedBrand, name: data.user.brandName || selectedBrand.name })
      setError('')
    } catch (err) {
      setError('Login failed. Use your brand account credentials.')
    }
  }

  const addItem = (preset) => {
    const existing = items.find(i => i.name === preset.name)
    if (existing) {
      setItems(items.map(i => i.name === preset.name ? { ...i, quantity: i.quantity + 1 } : i))
    } else {
      setItems([...items, { ...preset, quantity: 1 }])
    }
  }

  const removeItem = (name) => {
    setItems(items.filter(i => i.name !== name))
  }

  const printReceipt = async () => {
    if (!customerEmail) { setError('Enter customer email'); return }
    if (items.length === 0) { setError('Add at least one item'); return }
    setPrinting(true)
    setError('')
    try {
      await axios.post(`${API}/receipts/send`, {
        customerEmail,
        brandName: selectedBrand.name,
        location: selectedBrand.location,
        items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
        total,
        paymentMethod,
        category: 'Shopping'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPrinted(true)
      setTimeout(() => {
        setPrinted(false)
        setItems([])
        setCustomerEmail('')
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send receipt')
    }
    setPrinting(false)
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <p className="text-4xl mb-2">🖥️</p>
            <h1 className="text-white text-2xl font-bold">POS Terminal</h1>
            <p className="text-gray-400 text-sm mt-1">Login with your brand account</p>
          </div>
          {error && <div className="bg-red-900 text-red-300 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <div className="space-y-4">
            <input
              type="email"
              value={brandEmail}
              onChange={e => setBrandEmail(e.target.value)}
              placeholder="Brand email"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={brandPassword}
              onChange={e => setBrandPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={loginBrand}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
            >
              Login to POS
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (printed) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🧾</div>
          <h2 className="text-white text-3xl font-bold mb-2">Receipt Sent!</h2>
          <p className="text-green-400 text-lg">Delivered to {customerEmail}</p>
          <p className="text-gray-400 mt-2">Appears instantly in customer's SlipSafe wallet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">🖥️ POS Terminal</h1>
            <p className="text-gray-400 text-sm">{selectedBrand.name} — {selectedBrand.location}</p>
          </div>
          <div className="bg-green-500 px-3 py-1 rounded-full text-xs font-bold">● LIVE</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left — Items */}
          <div>
            <h2 className="text-gray-400 text-sm uppercase tracking-widest mb-3">Quick Add Items</h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(PRESET_ITEMS[selectedBrand.name] || PRESET_ITEMS.KHADI).map((item, i) => (
                <button
                  key={i}
                  onClick={() => addItem(item)}
                  className="bg-gray-800 hover:bg-gray-700 p-3 rounded-xl text-left transition"
                >
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-blue-400 text-xs mt-1">Rs.{item.price.toLocaleString()}</p>
                </button>
              ))}
            </div>

            {/* Cart */}
            <h2 className="text-gray-400 text-sm uppercase tracking-widest mb-3">Cart</h2>
            <div className="bg-gray-800 rounded-xl p-4 min-h-32">
              {items.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-4">No items added yet</p>
              ) : (
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-400">x{item.quantity} × Rs.{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-blue-400 font-bold">Rs.{(item.price * item.quantity).toLocaleString()}</p>
                        <button onClick={() => removeItem(item.name)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total */}
            <div className="bg-blue-900 rounded-xl p-4 mt-3 flex justify-between items-center">
              <span className="font-bold text-lg">TOTAL</span>
              <span className="font-black text-2xl text-blue-300">Rs.{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Right — Customer & Payment */}
          <div>
            <h2 className="text-gray-400 text-sm uppercase tracking-widest mb-3">Customer Details</h2>
            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <label className="text-gray-400 text-xs mb-2 block">Customer Email (for SlipSafe)</label>
              <input
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                placeholder="customer@email.com"
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <h2 className="text-gray-400 text-sm uppercase tracking-widest mb-3">Payment Method</h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {['Cash', 'Card', 'JazzCash', 'Easypaisa'].map(method => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3 rounded-xl font-medium text-sm transition ${
                    paymentMethod === method
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {error && <div className="bg-red-900 text-red-300 p-3 rounded-lg mb-4 text-sm">{error}</div>}

            {/* Print Button */}
            <button
              onClick={printReceipt}
              disabled={printing}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-xl font-black text-xl transition disabled:opacity-50"
            >
              {printing ? '⏳ Sending...' : '🖨️ Print & Send Receipt'}
            </button>

            <p className="text-gray-600 text-xs text-center mt-3">
              Receipt will appear instantly in customer's SlipSafe wallet
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
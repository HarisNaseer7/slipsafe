import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'https://slipsafe.onrender.com/api'

export default function POSTerminal() {
  const [customerEmail, setCustomerEmail] = useState('')
  const [items, setItems] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [printing, setPrinting] = useState(false)
  const [printed, setPrinted] = useState(false)
  const [error, setError] = useState('')
  const [products, setProducts] = useState([])
  const [brandInfo, setBrandInfo] = useState({})
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.get(`${API}/auth/products`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProducts(data.products || [])
      setBrandInfo({ location: data.location })
    } catch (err) {
      console.error(err)
    }
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const addItem = (product) => {
    const existing = items.find(i => i.name === product.name)
    if (existing) {
      setItems(items.map(i => i.name === product.name ? { ...i, quantity: i.quantity + 1 } : i))
    } else {
      setItems([...items, { ...product, quantity: 1 }])
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
      const token = localStorage.getItem('token')
      await axios.post(`${API}/receipts/send`, {
        customerEmail,
        brandName: user.brandName,
        location: brandInfo.location,
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

  const logout = () => {
    localStorage.clear()
    navigate('/login')
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">🖥️ POS Terminal</h1>
            <p className="text-gray-400 text-sm">{user.brandName} — {brandInfo.location}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-500 px-3 py-1 rounded-full text-xs font-bold">● LIVE</div>
            <button onClick={logout} className="bg-gray-700 px-3 py-1 rounded-lg text-xs hover:bg-gray-600">Logout</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-gray-400 text-sm uppercase tracking-widest mb-3">Quick Add Items</h2>
            {products.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-6 text-center mb-4">
                <p className="text-gray-500 text-sm">No products set up yet</p>
                <button
                  onClick={() => navigate('/setup')}
                  className="mt-3 text-blue-400 text-sm hover:underline"
                >
                  → Set up products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {products.map((product, i) => (
                  <button
                    key={i}
                    onClick={() => addItem(product)}
                    className="bg-gray-800 hover:bg-gray-700 p-3 rounded-xl text-left transition"
                  >
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-blue-400 text-xs mt-1">Rs.{product.price?.toLocaleString()}</p>
                  </button>
                ))}
              </div>
            )}

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
                        <p className="text-xs text-gray-400">x{item.quantity} × Rs.{item.price?.toLocaleString()}</p>
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

            <div className="bg-blue-900 rounded-xl p-4 mt-3 flex justify-between items-center">
              <span className="font-bold text-lg">TOTAL</span>
              <span className="font-black text-2xl text-blue-300">Rs.{total.toLocaleString()}</span>
            </div>
          </div>

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

            <button
              onClick={() => navigate('/setup')}
              className="w-full mt-3 bg-gray-800 text-gray-400 py-2 rounded-xl text-sm hover:bg-gray-700"
            >
              ⚙️ Edit Products
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
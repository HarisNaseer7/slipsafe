import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://slipsafe.onrender.com/api'

export default function BrandDashboard() {
  const [sentReceipts, setSentReceipts] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [form, setForm] = useState({
    customerEmail: '',
    location: '',
    paymentMethod: 'Cash',
    category: 'Shopping',
    items: [{ name: '', quantity: 1, price: '' }],
  })

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { name: '', quantity: 1, price: '' }] })
  }

  const removeItem = (index) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) })
  }

  const updateItem = (index, field, value) => {
    const updated = form.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    setForm({ ...form, items: updated })
  }

  const total = form.items.reduce((sum, item) =>
    sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0), 0
  )

  const handleSend = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${API}/receipts/send`, {
        ...form,
        brandName: user.brandName,
        total,
        items: form.items.map(i => ({
          ...i,
          price: parseFloat(i.price),
          quantity: parseInt(i.quantity)
        }))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuccess(`✅ Receipt sent to ${form.customerEmail} successfully!`)
      setForm({
        customerEmail: '',
        location: '',
        paymentMethod: 'Cash',
        category: 'Shopping',
        items: [{ name: '', quantity: 1, price: '' }],
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send receipt')
    }
    setLoading(false)
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="bg-blue-800 text-white px-6 py-4 flex justify-between items-center shadow">
        <div>
          <h1 className="text-2xl font-bold">SlipSafe</h1>
          <p className="text-blue-200 text-sm">{user.brandName} — Brand Portal</p>
        </div>
        <button onClick={logout} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm">
          Logout
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-1">Send Digital Receipt</h2>
          <p className="text-gray-500 text-sm mb-6">Receipt will appear instantly in customer's SlipSafe wallet</p>

          {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">{success}</div>}
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSend} className="space-y-4">
            {/* Customer Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
              <input
                type="email"
                value={form.customerEmail}
                onChange={e => setForm({ ...form, customerEmail: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="customer@email.com"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch Location</label>
              <input
                type="text"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Defence, Karachi"
              />
            </div>

            {/* Payment & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={form.paymentMethod}
                  onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Cash</option>
                  <option>Card</option>
                  <option>JazzCash</option>
                  <option>Easypaisa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Shopping</option>
                  <option>Food</option>
                  <option>Medical</option>
                  <option>Utilities</option>
                  <option>Transport</option>
                </select>
              </div>
            </div>

            {/* Items */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
              {form.items.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={e => updateItem(index, 'name', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Item name"
                    required
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={e => updateItem(index, 'quantity', e.target.value)}
                    className="w-16 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Qty"
                    min="1"
                  />
                  <input
                    type="number"
                    value={item.price}
                    onChange={e => updateItem(index, 'price', e.target.value)}
                    className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Price"
                    required
                  />
                  {form.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-400 hover:text-red-600 px-2"
                    >✕</button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="text-blue-600 text-sm hover:underline mt-1"
              >
                + Add item
              </button>
            </div>

            {/* Total */}
            <div className="bg-blue-50 rounded-xl p-4 flex justify-between items-center">
              <span className="font-semibold text-gray-700">Total Amount</span>
              <span className="text-2xl font-bold text-blue-800">Rs.{total.toLocaleString()}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50 text-lg"
            >
              {loading ? 'Sending...' : '📤 Send Receipt to Customer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
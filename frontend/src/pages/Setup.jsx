import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Setup() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Brand Info
  const [brandName, setBrandName] = useState(user.brandName || '')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('Shopping')

  // Products
  const [products, setProducts] = useState([])
  const [newProduct, setNewProduct] = useState({ name: '', price: '' })

  // UI State
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const categories = [
    'Shopping', 'Food & Dining', 'Grocery', 'Electronics',
    'Fashion', 'Pharmacy', 'Services', 'Other'
  ]

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const { data } = await api.get('/auth/products')
        setProducts(data.products || [])
        setLocation(data.location || '')
        setCategory(data.category || 'Shopping')
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchExisting()
  }, [])

  const addProduct = () => {
    if (!newProduct.name.trim()) { setError('Enter product name'); return }
    if (!newProduct.price || isNaN(newProduct.price) || Number(newProduct.price) <= 0) {
      setError('Enter a valid price'); return
    }
    setProducts([...products, { name: newProduct.name.trim(), price: Number(newProduct.price) }])
    setNewProduct({ name: '', price: '' })
    setError('')
  }

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addProduct()
  }

  const saveSetup = async () => {
    if (!brandName.trim()) { setError('Enter your brand name'); return }
    if (!location.trim()) { setError('Enter your location'); return }
    if (products.length === 0) { setError('Add at least one product'); return }

    setSaving(true)
    setError('')
    try {
      await api.post('/auth/products', {
        brandName: brandName.trim(),
        location: location.trim(),
        category,
        products
      })

      // Update local user
      const updatedUser = { ...user, brandName: brandName.trim() }
      localStorage.setItem('user', JSON.stringify(updatedUser))

      setSaved(true)
      setTimeout(() => navigate('/pos'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save setup')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading setup...</p>
      </div>
    )
  }

  if (saved) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-white text-2xl font-bold">Setup Saved!</h2>
          <p className="text-gray-400 mt-2">Redirecting to POS Terminal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg sm:text-xl font-bold">⚙️ POS Setup</h1>
          <p className="text-gray-400 text-xs sm:text-sm">Configure your store</p>
        </div>
        <button
          onClick={() => navigate('/pos')}
          className="text-gray-400 hover:text-white text-sm bg-gray-700 px-3 py-1.5 rounded-lg"
        >
          ← Back to POS
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Brand Info Section */}
        <div className="bg-gray-800 rounded-2xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
            🏪 Store Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Brand Name *</label>
              <input
                type="text"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                placeholder="e.g. Outfitters, Gul Ahmed..."
                className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Location / Branch *</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. DHA Phase 6, Karachi"
                className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Store Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium transition ${
                      category === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-gray-800 rounded-2xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
            📦 Products
          </h2>

          {/* Add Product Form */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newProduct.name}
              onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Product name"
              className="flex-1 bg-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            <input
              type="number"
              value={newProduct.price}
              onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Price"
              className="w-24 sm:w-32 bg-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            <button
              onClick={addProduct}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-sm font-bold transition"
            >
              + Add
            </button>
          </div>

          {/* Products List */}
          {products.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-xl">
              <p className="text-4xl mb-2">📦</p>
              <p className="text-gray-500 text-sm">No products yet</p>
              <p className="text-gray-600 text-xs mt-1">Add products above to show on POS</p>
            </div>
          ) : (
            <div className="space-y-2">
              {products.map((product, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-gray-700 rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-blue-400">Rs.{Number(product.price).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => removeProduct(i)}
                    className="text-red-400 hover:text-red-300 text-xs bg-gray-800 px-2 py-1 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <p className="text-xs text-gray-600 text-right pt-1">{products.length} product{products.length !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-xl text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={saveSetup}
          disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white py-4 rounded-2xl font-bold text-base transition disabled:opacity-50"
        >
          {saving ? '⏳ Saving...' : '💾 Save & Go to POS'}
        </button>

        <p className="text-center text-gray-600 text-xs pb-4">
          You can always come back and edit your setup
        </p>
      </div>
    </div>
  )
}
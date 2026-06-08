import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function ReceiptCard({ receipt, index, total }) {
  const date = new Date(receipt.createdAt).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  return (
    <div className="w-72 flex-shrink-0 relative" style={{ scrollSnapAlign: 'start' }}>
      {/* Top jagged edge */}
      <div style={{ height: '16px', overflow: 'hidden' }}>
        <svg viewBox="0 0 300 16" preserveAspectRatio="none" style={{ width: '100%', height: '16px', display: 'block' }}>
          <path d="M0,16 L0,8 L8,0 L16,8 L24,0 L32,8 L40,0 L48,8 L56,0 L64,8 L72,0 L80,8 L88,0 L96,8 L104,0 L112,8 L120,0 L128,8 L136,0 L144,8 L152,0 L160,8 L168,0 L176,8 L184,0 L192,8 L200,0 L208,8 L216,0 L224,8 L232,0 L240,8 L248,0 L256,8 L264,0 L272,8 L280,0 L288,8 L296,0 L300,8 L300,16 Z" fill="white"/>
        </svg>
      </div>

      <div className="bg-white px-6 py-4 font-mono shadow-xl">
        <p className="text-xs text-gray-300 text-center mb-2">{index + 1} of {total}</p>

        <div className="text-center py-3">
          <h3 className="font-black text-xl tracking-[0.4em] uppercase">{receipt.brandName}</h3>
          {receipt.location && <p className="text-xs text-gray-500 mt-1 tracking-widest">{receipt.location}</p>}
        </div>

        <div className="border-t-2 border-dashed border-gray-300 my-2" />

        <div className="flex justify-between text-xs text-gray-500 mb-3">
          <span>{date}</span>
          <span>#{receipt._id?.slice(-6).toUpperCase()}</span>
        </div>

        <div className="space-y-1 mb-3">
          {receipt.items && receipt.items.map((item, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="flex-1">{item.name}</span>
              <span className="text-gray-400 mx-2">x{item.quantity}</span>
              <span className="font-medium">Rs.{(item.price * item.quantity)?.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-dashed border-gray-300 my-2" />

        <div className="flex justify-between font-black text-lg my-3">
          <span>TOTAL</span>
          <span>Rs.{receipt.total?.toLocaleString()}</span>
        </div>

        <div className="border-t-2 border-dashed border-gray-300 my-2" />

        <div className="flex justify-between text-xs text-gray-500 my-2">
          <span>{receipt.paymentMethod}</span>
          <span>{receipt.category}</span>
        </div>

        <div className="text-center py-3">
          <p className="text-xs text-gray-400 tracking-widest">*** THANK YOU FOR SHOPPING ***</p>
          <p className="text-xs text-blue-400 mt-1 tracking-widest">via SlipSafe 🧾</p>
        </div>

        <div className="flex justify-center gap-px pb-3">
          {[2,1,2,1,1,2,1,2,2,1,2,1,1,2,1,2,1,2,1,1,2,1,2,1,2,1,1,2,1,2,1,2,1,1,2,1,2,2,1,2].map((w, i) => (
            <div key={i} className="bg-gray-800" style={{ width: `${w}px`, height: '32px' }}/>
          ))}
        </div>
      </div>

      {/* Bottom jagged edge */}
      <div style={{ height: '16px', overflow: 'hidden' }}>
        <svg viewBox="0 0 300 16" preserveAspectRatio="none" style={{ width: '100%', height: '16px', display: 'block' }}>
          <path d="M0,0 L0,8 L8,16 L16,8 L24,16 L32,8 L40,16 L48,8 L56,16 L64,8 L72,16 L80,8 L88,16 L96,8 L104,16 L112,8 L120,16 L128,8 L136,16 L144,8 L152,16 L160,8 L168,16 L176,8 L184,16 L192,8 L200,16 L208,8 L216,16 L224,8 L232,16 L240,8 L248,16 L256,8 L264,16 L272,8 L280,16 L288,8 L296,16 L300,8 L300,0 Z" fill="white"/>
        </svg>
      </div>
    </div>
  )
}

export default function CustomerDashboard() {
  const [receipts, setReceipts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const { data } = await api.get('/receipts/my')
        setReceipts(data.receipts)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchReceipts()
  }, [])

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const filtered = receipts.filter(r =>
    r.brandName.toLowerCase().includes(search.toLowerCase()) ||
    r.category?.toLowerCase().includes(search.toLowerCase())
  )

  const totalSpent = receipts.reduce((sum, r) => sum + (r.total || 0), 0)

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <div className="bg-blue-800 text-white px-6 py-4 flex justify-between items-center shadow">
        <div>
          <h1 className="text-2xl font-bold">SlipSafe</h1>
          <p className="text-blue-200 text-sm">Welcome, {user.name}</p>
        </div>
        <button onClick={logout} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm">
          Logout
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 w-full">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-gray-500 text-sm">Total Receipts</p>
            <p className="text-3xl font-bold text-blue-800">{receipts.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-gray-500 text-sm">Total Spent</p>
            <p className="text-3xl font-bold text-blue-800">Rs.{totalSpent.toLocaleString()}</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search by brand or category..."
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Receipt Roll Label */}
        <p className="text-center text-gray-400 text-xs tracking-widest uppercase mb-3">
          📜 Your Receipt Roll
        </p>

        {/* Vertical scrollable container */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading your receipts...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🧾</p>
            <p className="text-gray-500">No receipts yet.</p>
            <p className="text-gray-400 text-sm mt-1">Your receipts will appear here automatically.</p>
          </div>
        ) : (
          <div
            className="overflow-y-scroll flex flex-col items-center gap-0 bg-gray-200 rounded-2xl py-4"
            style={{
              height: '60vh',
              scrollSnapType: 'y mandatory',
              scrollbarWidth: 'none'
            }}
          >
            {filtered.map((receipt, index) => (
              <ReceiptCard
                key={receipt._id}
                receipt={receipt}
                index={index}
                total={filtered.length}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
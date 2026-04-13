import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Services/api";
import DashboardLayout from "../Components/DashboardLayout";
import { motion } from "framer-motion";
import { ShoppingBag, TrendingUp, Award, Gavel, Search, Wheat, ArrowRight, Leaf } from "lucide-react";

function RestaurantDashboard() {
  const navigate = useNavigate();
  const [lots, setLots] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchOpenLots = useCallback(async () => {
    try {
      const res = await API.get("/lots/all");
      setLots(res.data);
    } catch (err) {
      console.error("Error fetching lots:", err);
    }
  }, []);

  const fetchMyBids = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    try {
      const res = await API.get(`/bids/restaurant/${userId}`);
      setMyBids(res.data);
    } catch (err) {
      console.error("Error fetching bids:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOpenLots();
    fetchMyBids();
  }, [fetchOpenLots, fetchMyBids]);

  const filteredLots = lots.filter(lot => {
    const matchesSearch = lot.cropName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || lot.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const wonBids = myBids.filter(b => {
    return lots.find(l => l.id === b.lotId && l.status === "SOLD");
  }).length;

  const stats = [
    { label: "Available Products", value: lots.length, icon: ShoppingBag, color: '#6366f1' },
    { label: "My Active Bids", value: myBids.length, icon: Gavel, color: '#f59e0b' },
    { label: "Won Bids", value: wonBids, icon: Award, color: '#10b981' },
    { label: "Total Spent", value: `₹${myBids.reduce((s, b) => s + parseFloat(b.bidAmount || 0), 0).toLocaleString()}`, icon: TrendingUp, color: '#34d399' },
  ];

  const getStatusBadge = (status) => {
    const map = {
      'OPEN': 'badge-open',
      'SOLD': 'badge-sold',
      'CLOSED': 'badge-closed',
    };
    return map[status] || 'badge-pending';
  };

  return (
    <DashboardLayout role="RESTAURANT">
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
            Restaurant <span className="gradient-text">Dashboard</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Browse fresh produce and place your bids
          </p>
        </div>

        <div className="stats-grid">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="stat-card"
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}>
                  <Icon size={22} color={stat.color} />
                </div>
                <div className="stat-value" style={{ fontSize: '28px' }}>{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        <div className="section-header">
          <h2 className="section-title">All <span>Products</span></h2>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <select
            className="glass-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="SOLD">Sold</option>
          </select>

          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search size={16} style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }} />
            <input
              type="text"
              className="glass-input"
              placeholder="Search crops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '42px' }}
            />
          </div>
          <select
            className="glass-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ maxWidth: '160px' }}
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="SOLD">Sold</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px' }}>
            <div className="spinner" />
          </div>
        ) : filteredLots.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{ textAlign: 'center', padding: '64px' }}
          >
            <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.3 }}>
              <ShoppingBag size={64} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
              {searchTerm ? 'No matching products' : 'No products available'}
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Check back later for fresh produce'}
            </p>
          </motion.div>
        ) : (
          <div className="products-grid">
            {filteredLots.map((lot, i) => (
              <motion.div
                key={lot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="product-card"
              >
                {lot.imageData && (
                  <div style={{ 
                    width: '100%', 
                    height: '160px', 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    marginBottom: '16px',
                    background: 'rgba(168, 224, 95, 0.1)'
                  }}>
                    <img 
                      src={`data:image/jpeg;base64,${lot.imageData}`} 
                      alt={lot.cropName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div className="crop-name">{lot.cropName}</div>
                  <span className={`badge ${getStatusBadge(lot.status)}`}>
                    {lot.status}
                  </span>
                </div>

                {lot.description && (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
                    {lot.description.length > 80 ? lot.description.slice(0, 80) + '...' : lot.description}
                  </p>
                )}

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '10px',
                  marginBottom: '12px',
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quantity</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{lot.quantity} {lot.unit}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Base Price</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>₹{lot.basePrice}/unit</div>
                  </div>
                </div>

                <div style={{
                  padding: '12px',
                  background: 'rgba(99,102,241,0.08)',
                  borderRadius: '10px',
                  border: '1px solid rgba(99,102,241,0.15)',
                  marginBottom: '16px',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                    Current Highest Bid
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    ₹{lot.currentPrice}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginBottom: '16px',
                }}>
                  <span>Ends: {lot.expiryTime ? new Date(lot.expiryTime).toLocaleDateString() : 'N/A'}</span>
                  <span>{lot.unit}</span>
                </div>

                <div className="actions">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/bidding/${lot.id}`)}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                      boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                    }}
                  >
                    Place Bid
                    <ArrowRight size={14} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default RestaurantDashboard;

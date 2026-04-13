import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Services/api";
import DashboardLayout from "../Components/DashboardLayout";
import { motion } from "framer-motion";
import { PlusCircle, Package, TrendingUp, CheckCircle2, Wheat, Eye, Trash2, Leaf } from "lucide-react";

function FarmerDashboard() {
  const navigate = useNavigate();
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLots = useCallback(async (id) => {
    try {
      const res = await API.get(`/lots/farmer/${id}`);
      setLots(res.data);
    } catch (err) {
      console.error("Error fetching lots:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchLots(userId);
    }
  }, [fetchLots]);

  const deleteLot = async (id, e) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await API.delete(`/lots/${id}`);
        setLots(lots.filter(lot => lot.id !== id));
      } catch {
        alert("Failed to delete product");
      }
    }
  };

  const openLots = lots.filter(l => l.status === "OPEN").length;
  const soldLots = lots.filter(l => l.status === "SOLD" || l.status === "CLOSED").length;
  const totalValue = lots.reduce((sum, l) => sum + (parseFloat(l.currentPrice) || 0), 0);

  const stats = [
    { label: "Total Products", value: lots.length, icon: Package, color: '#6366f1' },
    { label: "Active Bids", value: openLots, icon: TrendingUp, color: '#10b981' },
    { label: "Sold Products", value: soldLots, icon: CheckCircle2, color: '#f59e0b' },
    { label: "Total Value", value: `₹${totalValue.toLocaleString()}`, icon: Wheat, color: '#34d399' },
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
    <DashboardLayout role="FARMER">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
              Farmer <span className="gradient-text">Dashboard</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Manage your crops and track your sales
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/farmer/add-product")}
            className="btn btn-primary"
          >
            <PlusCircle size={18} />
            Add Product
          </motion.button>
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
          <h2 className="section-title">My <span>Products</span></h2>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {lots.length} product{lots.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px' }}>
            <div className="spinner" />
          </div>
        ) : lots.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{ textAlign: 'center', padding: '64px' }}
          >
            <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.3 }}>
              <Wheat size={64} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
              No products yet
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Start by adding your first crop product to the marketplace
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/farmer/add-product")}
              className="btn btn-primary"
            >
              <PlusCircle size={18} />
              Add Your First Product
            </motion.button>
          </motion.div>
        ) : (
          <div className="products-grid">
            {lots.map((lot, i) => (
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
                  <div>
                    <div className="crop-name">{lot.cropName}</div>
                    <span className={`badge ${getStatusBadge(lot.status)}`}>
                      {lot.status}
                    </span>
                  </div>
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

                {lot.status === 'SOLD' && lot.totalPrice ? (
                  <div style={{
                    padding: '12px',
                    background: 'rgba(168, 224, 95, 0.15)',
                    borderRadius: '10px',
                    border: '1px solid rgba(168, 224, 95, 0.3)',
                    marginBottom: '16px',
                  }}>
                    <div style={{ fontSize: '11px', color: 'var(--deep-moss)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      Final Price
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 800, background: 'linear-gradient(135deg, var(--fresh-leaf), var(--deep-moss))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      ₹{lot.totalPrice}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '12px',
                    background: 'rgba(16,185,129,0.08)',
                    borderRadius: '10px',
                    border: '1px solid rgba(16,185,129,0.15)',
                    marginBottom: '16px',
                  }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      Current Bid
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      ₹{lot.currentPrice}
                    </div>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginBottom: '16px',
                }}>
                  <span>Ends: {lot.expiryTime ? new Date(lot.expiryTime).toLocaleDateString() : 'N/A'}</span>
                </div>

                <div className="actions">
                  {lot.status === "OPEN" && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/bidding/${lot.id}`)}
                    >
                      <Eye size={14} />
                      View Bids
                    </motion.button>
                  )}
                  {lot.status !== "SOLD" && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn btn-danger btn-sm"
                      onClick={(e) => deleteLot(lot.id, e)}
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default FarmerDashboard;

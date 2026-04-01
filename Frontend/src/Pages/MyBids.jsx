import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Services/api";
import DashboardLayout from "../Components/DashboardLayout";
import { motion } from "framer-motion";
import { Gavel, Clock, ArrowRight, Wheat, Award } from "lucide-react";

function MyBids() {
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [lots, setLots] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchMyBids = useCallback(async (userId) => {
    try {
      const res = await API.get(`/bids/restaurant/${userId}`);
      setBids(res.data || []);

      const lotIds = [...new Set((res.data || []).map(b => b.lotId))];
      const lotMap = {};
      for (const lotId of lotIds) {
        try {
          const lotRes = await API.get(`/lots/${lotId}`);
          lotMap[lotId] = lotRes.data;
        } catch { /* ignore */ }
      }
      setLots(lotMap);
    } catch (err) {
      console.error("Error fetching bids:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchMyBids(userId);
    }
  }, [fetchMyBids]);

  const uniqueLots = [...new Set(bids.map(b => b.lotId))];
  const highestBids = bids.filter(b => {
    const lot = lots[b.lotId];
    return lot && parseFloat(b.bidAmount) === parseFloat(lot.currentPrice);
  });

  const getTimeAgo = (date) => {
    const now = Date.now();
    const diff = now - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <DashboardLayout role="RESTAURANT">
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
            My <span className="gradient-text">Bids</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Track all your bidding activity
          </p>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { label: "Total Bids", value: bids.length, icon: Gavel, color: '#6366f1' },
            { label: "Unique Lots", value: uniqueLots.length, icon: Wheat, color: '#10b981' },
            { label: "Highest Bids Won", value: highestBids.length, icon: Award, color: '#f59e0b' },
          ].map((stat, i) => {
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
          <h2 className="section-title">Bidding <span>History</span></h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <div className="spinner" />
          </div>
        ) : bids.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{ textAlign: 'center', padding: '64px' }}
          >
            <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.3 }}>
              <Gavel size={64} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
              No bids placed yet
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Browse the marketplace and place your first bid!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/restaurant/dashboard")}
              className="btn btn-primary"
            >
              Browse Products
            </motion.button>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bids.slice().reverse().map((bid, i) => {
              const lot = lots[bid.lotId];
              const isHighest = lot && parseFloat(bid.bidAmount) === parseFloat(lot.currentPrice);

              return (
                <motion.div
                  key={bid.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card"
                  style={{ padding: '20px 24px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: isHighest ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {isHighest ? (
                          <Award size={22} color="var(--accent-primary)" />
                        ) : (
                          <Gavel size={22} color="var(--accent-secondary)" />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
                          {lot ? lot.cropName : `Lot #${bid.lotId}`}
                          {isHighest && (
                            <span style={{
                              marginLeft: '8px',
                              padding: '2px 8px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: 'rgba(16,185,129,0.15)',
                              color: 'var(--accent-primary)',
                            }}>
                              HIGHEST
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clock size={12} />
                          {getTimeAgo(bid.bidTime)}
                          {lot && (
                            <>
                              <span>•</span>
                              <span className={`badge badge-${lot.status?.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                                {lot.status}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Your Bid
                        </div>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: 800,
                          color: isHighest ? 'var(--accent-primary)' : 'var(--text-primary)',
                        }}>
                          ₹{bid.bidAmount}
                        </div>
                      </div>

                      {lot && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/bidding/${bid.lotId}`)}
                        >
                          View
                          <ArrowRight size={14} />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MyBids;

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../Services/api";
import DashboardLayout from "../Components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Gavel, Users, Clock, Wheat, CheckCircle, Lock, AlertCircle } from "lucide-react";

function Bidding() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lot, setLot] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("role");

  const fetchLotDetails = useCallback(async () => {
    try {
      const res = await API.get(`/lots/${id}`);
      setLot(res.data);
      if (res.data.expiryTime) {
        updateTimeLeft(res.data.expiryTime);
      }
    } catch {
      setError("Failed to load lot details");
    }
    setLoading(false);
  }, [id]);

  const updateTimeLeft = (expiryTime) => {
    const diff = new Date(expiryTime) - new Date();
    if (diff <= 0) {
      setTimeLeft("Expired");
    } else {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      if (days > 0) setTimeLeft(`${days}d ${hours}h ${mins}m`);
      else if (hours > 0) setTimeLeft(`${hours}h ${mins}m ${secs}s`);
      else setTimeLeft(`${mins}m ${secs}s`);
    }
  };

  const fetchBids = useCallback(async () => {
    try {
      const res = await API.get(`/bids/lot/${id}`);
      setBids(res.data || []);
    } catch (err) {
      console.error("Error fetching bids:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchLotDetails();
    fetchBids();
    
    const interval = setInterval(() => {
      fetchLotDetails();
      fetchBids();
    }, 5000);

    const timer = setInterval(() => {
      if (lot?.expiryTime) {
        updateTimeLeft(lot.expiryTime);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [id, fetchLotDetails, fetchBids]);

  const placeBid = async (e) => {
    e.preventDefault();
    setPlacing(true);
    setError("");
    setSuccess("");

    if (!userId) {
      setError("Please login to place a bid");
      navigate("/");
      return;
    }

    if (userRole !== "RESTAURANT") {
      setError("Only restaurants can place bids");
      setPlacing(false);
      return;
    }

    const bid = {
      lotId: parseInt(id),
      restaurantId: parseInt(userId),
      bidAmount: parseFloat(bidAmount)
    };

    try {
      await API.post("/bids", bid);
      setSuccess("Bid placed successfully!");
      setBidAmount("");
      fetchLotDetails();
      fetchBids();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place bid. Your bid must be higher than current price.");
    }
    setPlacing(false);
  };

  const closeLotAndCreateTransaction = async () => {
    if (!confirm("Are you sure you want to close this lot? The highest bidder will win.")) return;

    try {
      await API.put(`/lots/${id}/close`);
      if (bids.length > 0) {
        await API.post("/transactions/create", { lotId: parseInt(id) });
        alert("Lot closed! Transaction created for the winner.");
      } else {
        alert("Lot closed. No bids were placed.");
      }
      navigate(userRole === "FARMER" ? "/farmer/dashboard" : "/restaurant/dashboard");
    } catch {
      alert("Failed to close lot");
    }
  };

  if (loading) {
    return (
      <DashboardLayout role={userRole}>
        <div style={{ textAlign: 'center', padding: '80px' }}>
          <div className="spinner" />
        </div>
      </DashboardLayout>
    );
  }

  if (!lot) {
    return (
      <DashboardLayout role={userRole}>
        <div style={{ textAlign: 'center', padding: '80px' }}>
          <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '16px' }} />
          <h2>Lot not found</h2>
          <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginTop: '16px' }}>
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isFarmer = userRole === "FARMER";
  const isLotOwner = lot.farmerId === parseInt(userId);
  const canCloseLot = isFarmer && isLotOwner && lot.status === "OPEN" && bids.length > 0;
  const canPlaceBid = lot.status === "OPEN" && !isFarmer;
  const minBid = parseFloat(lot.currentPrice) + 1;

  const displayTime = timeLeft || (lot.expiryTime ? (() => {
    const diff = new Date(lot.expiryTime) - new Date();
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  })() : "N/A");

  return (
    <DashboardLayout role={userRole}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '24px' }}
          >
            <ArrowLeft size={14} />
            Back
          </motion.button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <div className="glass-card-static" style={{ padding: '32px' }}>
              {lot.imageUrl && (
                <div style={{
                  width: '100%',
                  height: '200px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '20px',
                  background: 'rgba(168, 224, 95, 0.1)',
                }}>
                  <img 
                    src={lot.imageUrl} 
                    alt={lot.cropName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(16,185,129,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <Wheat size={28} color="var(--accent-primary)" />
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>{lot.cropName}</h1>
              <span className={`badge ${lot.status === 'OPEN' ? 'badge-open' : lot.status === 'SOLD' ? 'badge-sold' : 'badge-closed'}`}>
                {lot.status}
              </span>

              {lot.description && (
                <p style={{ color: 'var(--text-secondary)', marginTop: '16px', fontSize: '14px', lineHeight: 1.6 }}>
                  {lot.description}
                </p>
              )}
            </div>

            <div className="glass-card-static" style={{ padding: '32px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Current Highest Bid
              </div>
              <div style={{ fontSize: '40px', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: '20px' }}>
                ₹{lot.currentPrice}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Quantity</div>
                  <div style={{ fontWeight: 600 }}>{lot.quantity} {lot.unit}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Base Price</div>
                  <div style={{ fontWeight: 600 }}>₹{lot.basePrice}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Bids</div>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={14} /> {bids.length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Time Left</div>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', color: timeLeft === "Expired" ? '#ef4444' : 'inherit' }}>
                    <Clock size={14} /> {displayTime}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {canPlaceBid && (
            <div className="glass-card-static" style={{ padding: '32px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <Gavel size={24} color="var(--accent-secondary)" />
                <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Place Your Bid</h2>
              </div>

              {error && <div className="form-error">{error}</div>}
              {success && <div className="form-success">{success}</div>}

              <form onSubmit={placeBid} style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="number"
                  className="glass-input"
                  placeholder={`Enter bid (min ₹${minBid})`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min={minBid}
                  required
                  style={{ flex: 1, fontSize: '16px', padding: '14px 18px' }}
                />
                <motion.button
                  type="submit"
                  className="btn btn-primary"
                  disabled={placing}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                    boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                    padding: '14px 28px',
                  }}
                >
                  {placing ? (
                    <div className="spinner" style={{ width: '20px', height: '20px' }} />
                  ) : (
                    <>
                      <Gavel size={16} />
                      Place Bid
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          )}

          {canCloseLot && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-static"
              style={{
                padding: '24px',
                marginBottom: '32px',
                border: '1px solid rgba(245,158,11,0.3)',
                background: 'rgba(245,158,11,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                    Ready to close bidding?
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {bids.length} bid(s) received. The highest bidder will win.
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeLotAndCreateTransaction}
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                >
                  <CheckCircle size={16} />
                  Close & Create Transaction
                </motion.button>
              </div>
            </motion.div>
          )}

          {lot.status !== "OPEN" && (
            <div className="glass-card-static" style={{
              padding: '24px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: '1px solid rgba(239,68,68,0.2)',
              background: 'rgba(239,68,68,0.05)',
            }}>
              <Lock size={20} color="var(--danger)" />
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                This bidding is {lot.status.toLowerCase()}. No more bids can be placed.
              </span>
            </div>
          )}

          <div className="section-header">
            <h2 className="section-title">All <span>Bids</span></h2>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {bids.length} total bid{bids.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <AnimatePresence>
              {bids.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card"
                  style={{ padding: '48px', textAlign: 'center' }}
                >
                  <Gavel size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No bids yet. Be the first to bid!</p>
                </motion.div>
              ) : (
                bids.slice().reverse().map((bid, index) => (
                  <motion.div
                    key={bid.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px 24px',
                      background: index === 0 ? 'rgba(16,185,129,0.08)' : 'var(--glass-bg)',
                      backdropFilter: 'blur(12px)',
                      border: index === 0
                        ? '1px solid rgba(16,185,129,0.3)'
                        : '1px solid var(--glass-border)',
                      borderRadius: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: index === 0 ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '14px',
                        color: index === 0 ? 'var(--accent-primary)' : 'var(--text-muted)',
                      }}>
                        #{bids.length - index}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          Bidder #{bid.restaurantId}
                          {index === 0 && (
                            <span style={{
                              marginLeft: '8px',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: 'rgba(16,185,129,0.15)',
                              color: 'var(--accent-primary)',
                            }}>
                              HIGHEST
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {new Date(bid.bidTime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      background: index === 0 ? 'var(--accent-gradient)' : 'linear-gradient(135deg, #94a3b8, #64748b)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      ₹{bid.bidAmount}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .bidding-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}

export default Bidding;

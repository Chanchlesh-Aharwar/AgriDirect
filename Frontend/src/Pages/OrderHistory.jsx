import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Services/api";
import DashboardLayout from "../Components/DashboardLayout";
import Chat from "../Components/Chat";
import { motion, AnimatePresence } from "framer-motion";
import { History, CreditCard, Truck, CheckCircle, Package, AlertCircle, MessageCircle } from "lucide-react";

function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("role");
  const isFarmer = userRole === "FARMER";

  const fetchOrders = useCallback(async () => {
    try {
      const res = await API.get(`/transactions/user/${userId}`);
      const ordersWithLots = await Promise.all(
        res.data.map(async (order) => {
          try {
            const lotRes = await API.get(`/lots/${order.lotId}`);
            return { ...order, lot: lotRes.data };
          } catch {
            return { ...order, lot: null };
          }
        })
      );
      setOrders(ordersWithLots);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchOrders();
    }
  }, [userId, fetchOrders]);

  const markAsPaid = async (transactionId) => {
    try {
      navigate(`/payment/${transactionId}`);
    } catch {
      alert("Failed to initiate payment");
    }
  };

  const trackOrder = async (transactionId) => {
    try {
      const res = await API.get(`/transport/transaction/${transactionId}`);
      if (res.data && res.data.trackingId) {
        navigate(`/track/${res.data.trackingId}`);
      } else {
        alert("Transport not assigned yet. Please wait for confirmation.");
      }
    } catch {
      alert("Transport not available yet");
    }
  };

  const markAsCompleted = async (transactionId) => {
    try {
      await API.put(`/transactions/${transactionId}/complete`);
      alert("Order marked as completed!");
      fetchOrders();
    } catch {
      alert("Failed to update order status");
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'PENDING': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', icon: AlertCircle },
      'PAID': { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', icon: CreditCard },
      'COMPLETED': { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', icon: CheckCircle },
    };
    return configs[status] || configs['PENDING'];
  };

  return (
    <DashboardLayout role={userRole}>
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
            {isFarmer ? 'Sales ' : 'My '}<span className="gradient-text">History</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {isFarmer ? 'Track your crop sales and deliveries' : 'Track your purchases and orders'}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <div className="spinner" />
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{ textAlign: 'center', padding: '64px' }}
          >
            <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.3 }}>
              <History size={64} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
              No orders yet
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              {isFarmer
                ? "You haven't made any sales yet. Add products to start bidding!"
                : "You haven't purchased anything yet. Browse the marketplace!"}
            </p>
            <button
              onClick={() => navigate(isFarmer ? "/farmer/dashboard" : "/restaurant/dashboard")}
              className="btn btn-primary"
            >
              Go to Dashboard
            </button>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((order, i) => {
              const statusConfig = getStatusConfig(order.transactionStatus);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card"
                  style={{ padding: '24px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {order.lot?.imageData && (
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: 'rgba(168, 224, 95, 0.1)',
                      }}>
                        <img 
                          src={`data:image/jpeg;base64,${order.lot.imageData}`} 
                          alt={order.lot.cropName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'rgba(99,102,241,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Package size={20} color="var(--accent-secondary)" />
                        </div>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '2px' }}>
                            {order.lot?.cropName || `Lot #${order.lotId}`}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {isFarmer ? 'Sale' : 'Purchase'} #{order.id} • {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      borderRadius: '20px',
                      background: statusConfig.bg,
                      border: `1px solid ${statusConfig.border}`,
                      fontSize: '13px',
                      fontWeight: 600,
                      color: statusConfig.color,
                    }}>
                      <StatusIcon size={14} />
                      {order.transactionStatus}
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '12px',
                    padding: '16px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    marginBottom: '20px',
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Final Price</div>
                      <div style={{ fontWeight: 700 }}>₹{order.finalPrice}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Platform Fee</div>
                      <div style={{ fontWeight: 700 }}>₹{order.platformFee}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>GST (18%)</div>
                      <div style={{ fontWeight: 700 }}>₹{order.gstAmount}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Total</div>
                      <div style={{ fontWeight: 800, fontSize: '18px', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ₹{order.totalAmount}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {userRole === "RESTAURANT" && order.transactionStatus === "PENDING" && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="btn btn-primary btn-sm"
                        onClick={() => markAsPaid(order.id)}
                      >
                        <CreditCard size={14} />
                        Pay Now
                      </motion.button>
                    )}

                    {order.transactionStatus === "PAID" && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="btn btn-secondary btn-sm"
                        onClick={() => trackOrder(order.id)}
                        style={{
                          background: 'rgba(59,130,246,0.1)',
                          border: '1px solid rgba(59,130,246,0.2)',
                          color: 'var(--info)',
                        }}
                      >
                        <Truck size={14} />
                        Track Order
                      </motion.button>
                    )}

                    {(order.transactionStatus === "PAID" || order.transactionStatus === "COMPLETED") && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="btn btn-secondary btn-sm"
                        onClick={() => setActiveChat({ 
                          transactionId: order.id, 
                          receiverId: isFarmer ? order.winnerId : order.lot?.farmerId,
                          order: order 
                        })}
                        style={{
                          background: 'rgba(168, 224, 95, 0.1)',
                          border: '1px solid rgba(168, 224, 95, 0.3)',
                          color: 'var(--deep-moss)',
                        }}
                      >
                        <MessageCircle size={14} />
                        Chat
                      </motion.button>
                    )}

                    {isFarmer && order.transactionStatus === "PAID" && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="btn btn-success btn-sm"
                        onClick={() => markAsCompleted(order.id)}
                      >
                        <CheckCircle size={14} />
                        Mark Delivered
                      </motion.button>
                    )}

                    {order.transactionStatus === "COMPLETED" && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: 'rgba(16,185,129,0.1)',
                        color: 'var(--success)',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}>
                        <CheckCircle size={14} />
                        Order Completed
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <AnimatePresence>
        {activeChat && (
          <Chat
            transactionId={activeChat.transactionId}
            receiverId={activeChat.receiverId}
            senderRole={userRole}
            currentUserId={parseInt(userId)}
            onClose={() => setActiveChat(null)}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

export default OrderHistory;

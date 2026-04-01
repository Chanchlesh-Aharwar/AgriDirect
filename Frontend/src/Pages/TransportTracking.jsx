import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transportService } from '../Services/api.jsx';
import { motion } from 'framer-motion';
import { Truck, MapPin, Phone, User, Clock, CheckCircle, ArrowLeft, Navigation } from 'lucide-react';

const TransportTracking = () => {
  const { trackingId } = useParams();
  const navigate = useNavigate();
  const [transport, setTransport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTransport = useCallback(async () => {
    try {
      const res = await transportService.getByTrackingId(trackingId);
      setTransport(res.data);
    } catch {
      setError('Transport not found');
    }
    setLoading(false);
  }, [trackingId]);

  useEffect(() => {
    loadTransport();
  }, [loadTransport]);

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': '#f59e0b',
      'ASSIGNED': '#3b82f6',
      'PICKED_UP': '#3b82f6',
      'IN_TRANSIT': '#6366f1',
      'OUT_FOR_DELIVERY': '#8b5cf6',
      'DELIVERED': '#10b981',
      'FAILED': '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  const getStatusBg = (status) => {
    const color = getStatusColor(status);
    return `${color}15`;
  };

  const steps = [
    { key: 'PENDING', label: 'Pending' },
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'PICKED_UP', label: 'Picked Up' },
    { key: 'IN_TRANSIT', label: 'In Transit' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  if (loading) {
    return (
      <div className="auth-bg">
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80") center/cover no-repeat',
          filter: 'blur(2px) brightness(0.3)',
        }} />
        <div className="glass-card-static" style={{ padding: '48px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="spinner" />
          <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error || !transport) {
    return (
      <div className="auth-bg">
        <div className="glass-card-static" style={{ padding: '48px', textAlign: 'center' }}>
          <h2>{error || 'Transport not found'}</h2>
          <button onClick={() => navigate('/order-history')} className="btn btn-primary mt-3">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex(s => s.key === transport.status);
  const statusColor = getStatusColor(transport.status);

  return (
    <div className="auth-bg">
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80") center/cover no-repeat',
        filter: 'blur(2px) brightness(0.3)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-static"
        style={{ maxWidth: '700px', width: '100%', padding: '40px', position: 'relative', zIndex: 1 }}
      >
        <motion.button
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/order-history')}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '24px' }}
        >
          <ArrowLeft size={14} />
          Back to Orders
        </motion.button>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: `${statusColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Truck size={28} color={statusColor} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
            Track Your <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Delivery</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '16px' }}>
            {transport.trackingId}
          </p>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', gap: '4px' }}>
            {steps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const color = isCompleted ? statusColor : 'var(--text-muted)';

              return (
                <div key={step.key} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    width: isCurrent ? '40px' : '32px',
                    height: isCurrent ? '40px' : '32px',
                    borderRadius: '50%',
                    background: isCompleted ? color : 'rgba(255,255,255,0.05)',
                    border: isCurrent ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: isCompleted ? 'white' : 'var(--text-muted)',
                    transition: 'var(--transition)',
                  }}>
                    {isCompleted ? (
                      <CheckCircle size={isCurrent ? 18 : 14} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span style={{
                    fontSize: '10px',
                    color: isCompleted ? color : 'var(--text-muted)',
                    fontWeight: isCurrent ? 600 : 400,
                    display: 'block',
                    lineHeight: 1.2,
                  }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{
            height: '4px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '2px',
            marginTop: '8px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${statusColor}, ${statusColor}aa)`,
                borderRadius: '2px',
              }}
            />
          </div>
        </div>

        <div className="glass-card-static" style={{
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <h3 style={{ fontSize: '13px', marginBottom: '16px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Delivery Details
          </h3>

          {[
            { label: 'Driver Name', value: transport.driverName, icon: User },
            { label: 'Driver Phone', value: transport.driverPhone, icon: Phone },
            { label: 'Vehicle Number', value: transport.vehicleNumber, icon: Truck },
            { label: 'Pickup Address', value: transport.pickupAddress, icon: MapPin },
            { label: 'Delivery Address', value: transport.deliveryAddress, icon: Navigation },
            { label: 'Est. Delivery', value: transport.estimatedDelivery ? new Date(transport.estimatedDelivery).toLocaleString() : 'Not available', icon: Clock },
            ...(transport.actualDelivery ? [{ label: 'Actual Delivery', value: new Date(transport.actualDelivery).toLocaleString(), icon: CheckCircle }] : []),
          ].map((item) => item.value ? (
            <div key={item.label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontSize: '14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <item.icon size={14} />
                {item.label}
              </div>
              <strong style={{ maxWidth: '60%', textAlign: 'right', wordBreak: 'break-word' }}>{item.value}</strong>
            </div>
          ) : null)}
        </div>

        <div style={{
          padding: '16px',
          background: getStatusBg(transport.status),
          borderRadius: '12px',
          border: `1px solid ${statusColor}30`,
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          <strong style={{
            fontSize: '16px',
            textTransform: 'capitalize',
            color: statusColor,
          }}>
            {transport.status.replace(/_/g, ' ')}
          </strong>
        </div>

        {transport.notes && (
          <div style={{
            padding: '16px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '24px',
          }}>
            <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Notes</h4>
            <p style={{ fontSize: '14px' }}>{transport.notes}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TransportTracking;

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transactionService, paymentService, transportService } from '../Services/api.jsx';
import { motion } from 'framer-motion';
import { CreditCard, Lock, CheckCircle, Truck, ShieldCheck } from 'lucide-react';

const Payment = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const loadTransaction = useCallback(async () => {
    try {
      const res = await transactionService.getById(transactionId);
      setTransaction(res.data);
    } catch {
      setError('Failed to load transaction');
    }
    setLoading(false);
  }, [transactionId]);

  useEffect(() => {
    loadTransaction();
  }, [loadTransaction]);

  const loadScripts = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError('');

    try {
      await loadScripts('https://checkout.razorpay.com/v1/checkout.js');

      const orderRes = await paymentService.createOrder(parseInt(transactionId));
      const data = orderRes.data;

      const options = {
        key: data.razorpayKey,
        amount: data.amount,
        currency: data.currency,
        name: 'AgriDirect',
        description: `Payment for Transaction ${data.receipt}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: JSON.parse(localStorage.getItem('user'))?.name || 'Customer',
          email: JSON.parse(localStorage.getItem('user'))?.email || ''
        },
        handler: async (response) => {
          try {
            await paymentService.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            setSuccess(true);

            try {
              await transportService.create({
                transactionId: parseInt(transactionId),
                deliveryAddress: transaction.deliveryAddress || 'Customer Address'
              });
            } catch {
              console.log('Transport creation skipped');
            }

            setTimeout(() => navigate('/order-history'), 3000);
          } catch {
            setError('Payment verification failed');
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setError(`Payment failed: ${response.error.description}`);
        setProcessing(false);
      });

      rzp.open();
    } catch (err) {
      setError(err.response?.data?.error || 'Payment initiation failed');
      setProcessing(false);
    }
  };

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
          <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="auth-bg">
        <div className="glass-card-static" style={{ padding: '48px', textAlign: 'center' }}>
          <h2>Transaction not found</h2>
          <button onClick={() => navigate('/order-history')} className="btn btn-primary mt-3">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-bg">
        <div className="glass-card-static" style={{ padding: '64px', textAlign: 'center', maxWidth: '500px', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(16,185,129,0.15)',
              border: '2px solid var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <CheckCircle size={40} color="var(--accent-primary)" />
          </motion.div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
            Payment Successful!
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Your order is being processed. Redirecting...
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '16px',
            background: 'rgba(16,185,129,0.08)',
            borderRadius: '12px',
            marginBottom: '24px',
          }}>
            <Truck size={20} color="var(--accent-primary)" />
            <span style={{ fontSize: '14px', color: 'var(--accent-primary)', fontWeight: 600 }}>
              Delivery will begin soon
            </span>
          </div>
        </div>
      </div>
    );
  }

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
        style={{ maxWidth: '500px', width: '100%', padding: '40px', position: 'relative', zIndex: 1 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(16,185,129,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <CreditCard size={28} color="var(--accent-primary)" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
            Complete <span className="gradient-text">Payment</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            Transaction #{transaction.id}
          </p>
        </div>

        <div className="glass-card-static" style={{
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <h3 style={{ fontSize: '13px', marginBottom: '16px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Order Summary
          </h3>

          {[
            { label: 'Lot ID', value: `#${transaction.lotId}` },
            { label: 'Final Price', value: `₹${transaction.finalPrice}` },
            { label: 'Platform Fee (2%)', value: `₹${transaction.platformFee}` },
            { label: 'GST (18%)', value: `₹${transaction.gstAmount}` },
          ].map((item) => (
            <div key={item.label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontSize: '14px',
            }}>
              <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '16px 0 0',
            marginTop: '8px',
            borderTop: '2px solid rgba(16,185,129,0.3)',
          }}>
            <span style={{ fontSize: '16px' }}>Total Amount</span>
            <strong style={{ fontSize: '20px', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ₹{transaction.totalAmount}
            </strong>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="form-error"
          >
            {error}
          </motion.div>
        )}

        <motion.button
          onClick={handlePayment}
          className="btn btn-primary"
          disabled={processing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ width: '100%', padding: '16px', fontSize: '16px' }}
        >
          {processing ? (
            <div className="spinner" style={{ width: '20px', height: '20px' }} />
          ) : (
            <>
              <CreditCard size={18} />
              Pay ₹{transaction.totalAmount}
            </>
          )}
        </motion.button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '20px',
          color: 'var(--text-muted)',
          fontSize: '12px',
        }}>
          <Lock size={12} />
          <span>Secure payment powered by Razorpay</span>
          <ShieldCheck size={12} color="var(--accent-primary)" />
        </div>
      </motion.div>
    </div>
  );
};

export default Payment;

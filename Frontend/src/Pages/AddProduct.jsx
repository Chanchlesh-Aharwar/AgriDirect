import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Services/api";
import DashboardLayout from "../Components/DashboardLayout";
import { motion } from "framer-motion";
import { PlusCircle, ArrowLeft, Info } from "lucide-react";

function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cropName: "",
    description: "",
    quantity: "",
    unit: "KG",
    basePrice: "",
    expiryTime: "",
    imageUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("Please login first");
      setLoading(false);
      return;
    }

    const expiryDate = new Date(formData.expiryTime);
    expiryDate.setHours(23, 59, 59, 0);

    const lotData = {
      farmerId: parseInt(userId),
      cropName: formData.cropName,
      description: formData.description || "",
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      basePrice: parseFloat(formData.basePrice),
      currentPrice: parseFloat(formData.basePrice),
      imageUrl: formData.imageUrl || "",
      expiryTime: expiryDate.toISOString()
    };

    try {
      await API.post("/lots", lotData);
      setSuccess("Product added successfully!");
      setTimeout(() => navigate("/farmer/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Failed to add product.");
    }
    setLoading(false);
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  const units = [
    { value: "KG", label: "Kilogram (KG)" },
    { value: "QUINTAL", label: "Quintal (100 KG)" },
    { value: "TON", label: "Tonne (1000 KG)" },
  ];

  return (
    <DashboardLayout role="FARMER">
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ marginBottom: '32px' }}>
            <motion.button
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/farmer/dashboard")}
              className="btn btn-secondary btn-sm"
              style={{ marginBottom: '16px' }}
            >
              <ArrowLeft size={14} />
              Back to Dashboard
            </motion.button>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
              Add New <span className="gradient-text">Product</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              List your crop for bidding on the marketplace
            </p>
          </div>

          <div className="glass-card-static" style={{ padding: '32px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.15)',
              borderRadius: '12px',
              marginBottom: '32px',
            }}>
              <Info size={18} color="var(--accent-primary)" />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Your product will be listed for bidding. The highest bidder wins the sale.
              </span>
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

            {success && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="form-success"
              >
                {success}
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Crop Name *</label>
                <input
                  type="text"
                  name="cropName"
                  className="glass-input"
                  placeholder="e.g., Wheat, Tomatoes, Rice, Potatoes"
                  value={formData.cropName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className="glass-input"
                  placeholder="Quality, variety, growing method, etc."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <div className="form-group">
                <label>Product Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  className="glass-input"
                  placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                  value={formData.imageUrl}
                  onChange={handleChange}
                />
                {formData.imageUrl && (
                  <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden', maxWidth: '200px' }}>
                    <img 
                      src={formData.imageUrl} 
                      alt="Product preview" 
                      style={{ width: '100%', height: 'auto', borderRadius: '12px' }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    className="glass-input"
                    placeholder="Enter quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Unit *</label>
                  <select
                    name="unit"
                    className="glass-select"
                    value={formData.unit}
                    onChange={handleChange}
                  >
                    {units.map(u => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Base Price (₹) *</label>
                <input
                  type="number"
                  name="basePrice"
                  className="glass-input"
                  placeholder="Minimum price for bidding"
                  value={formData.basePrice}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Bid End Date *</label>
                <input
                  type="date"
                  name="expiryTime"
                  className="glass-input"
                  value={formData.expiryTime}
                  onChange={handleChange}
                  min={minDateStr}
                  required
                />
              </div>

              <motion.button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ width: '100%', padding: '14px', marginTop: '8px' }}
              >
                {loading ? (
                  <div className="spinner" style={{ width: '20px', height: '20px' }} />
                ) : (
                  <>
                    <PlusCircle size={18} />
                    List Product for Bidding
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default AddProduct;

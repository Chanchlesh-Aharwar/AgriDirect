import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Services/api";
import DashboardLayout from "../Components/DashboardLayout";
import { motion } from "framer-motion";
import { PlusCircle, ArrowLeft, Info, Upload, X } from "lucide-react";

function AddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    cropName: "",
    description: "",
    quantity: "",
    unit: "KG",
    basePrice: "",
    expiryTime: ""
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

    const formDataToSend = new FormData();
    formDataToSend.append("farmerId", parseInt(userId));
    formDataToSend.append("cropName", formData.cropName);
    formDataToSend.append("description", formData.description || "");
    formDataToSend.append("quantity", parseFloat(formData.quantity));
    formDataToSend.append("unit", formData.unit);
    formDataToSend.append("basePrice", parseFloat(formData.basePrice));
    formDataToSend.append("expiryTime", formData.expiryTime + "T23:59:59");
    if (imageFile) {
      formDataToSend.append("image", imageFile);
    }

    try {
      await API.post("/lots", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      setSuccess("Product added successfully!");
      setTimeout(() => navigate("/farmer/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data || "Failed to add product.");
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
                <label>Product Image</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed rgba(58, 95, 64, 0.3)',
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'rgba(168, 224, 95, 0.05)',
                    transition: 'var(--transition)',
                  }}
                >
                  {imagePreview ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img 
                        src={imagePreview} 
                        alt="Product preview" 
                        style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '12px' }}
                      />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeImage(); }}
                        style={{
                          position: 'absolute',
                          top: '-10px',
                          right: '-10px',
                          background: '#ef4444',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: 'white',
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        Click to upload product image
                      </p>
                      <p style={{ color: 'var(--text-light)', fontSize: '12px' }}>
                        PNG, JPG up to 5MB
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
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

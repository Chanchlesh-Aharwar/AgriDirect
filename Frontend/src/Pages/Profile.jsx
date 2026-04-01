import { useState, useEffect, useCallback } from "react";
import API from "../Services/api";
import DashboardLayout from "../Components/DashboardLayout";
import { motion } from "framer-motion";
import { User, Mail, Phone, Shield, Save, X, Edit3 } from "lucide-react";

function Profile() {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", role: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("role");

  const fetchProfile = useCallback(async () => {
    try {
      const res = await API.get(`/profile/${userId}`);
      setProfile(res.data);
      setUpdatedProfile({
        name: res.data.name || "",
        phone: res.data.phone || ""
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId, fetchProfile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await API.put(`/profile/${userId}`, updatedProfile);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
      fetchProfile();
    } catch {
      setMessage({ type: "error", text: "Failed to update profile" });
    }
    setSaving(false);
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

  return (
    <DashboardLayout role={userRole}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
              My <span className="gradient-text">Profile</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Manage your account information
            </p>
          </div>

          <div className="glass-card-static" style={{ padding: '40px', marginBottom: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '24px',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '32px',
                fontWeight: 800,
                color: 'white',
                boxShadow: '0 8px 32px rgba(16,185,129,0.3)',
              }}>
                {profile.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700 }}>{profile.name || 'User'}</h2>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '8px',
                padding: '4px 12px',
                borderRadius: '20px',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.2)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--accent-primary)',
              }}>
                <Shield size={12} />
                {profile.role}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Full Name', value: profile.name, icon: User },
                { label: 'Email Address', value: profile.email, icon: Mail },
                { label: 'Phone Number', value: profile.phone || 'Not set', icon: Phone },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(99,102,241,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <item.icon size={18} color="var(--accent-secondary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 500 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!isEditing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="glass-card-static" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Edit Profile</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Update your personal information
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary"
                  >
                    <Edit3 size={16} />
                    Edit
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-static"
              style={{ padding: '32px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Edit Profile</h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '8px' }}
                >
                  <X size={16} />
                </button>
              </div>

              {message.text && (
                <div className={message.type === "success" ? "form-success" : "form-error"} style={{ marginBottom: '16px' }}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleUpdate}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="Your full name"
                    value={updatedProfile.name}
                    onChange={(e) => setUpdatedProfile({ ...updatedProfile, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    className="glass-input"
                    placeholder="Your phone number"
                    value={updatedProfile.phone}
                    onChange={(e) => setUpdatedProfile({ ...updatedProfile, phone: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <motion.button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ flex: 1 }}
                  >
                    {saving ? (
                      <div className="spinner" style={{ width: '20px', height: '20px' }} />
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;

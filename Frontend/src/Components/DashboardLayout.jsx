import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Leaf, LayoutDashboard, PlusCircle, CloudSun, User, LogOut, Menu, X, Sun, Droplets } from "lucide-react";
import API, { weatherService } from "../Services/api";

const farmerLinks = [
  { href: "/farmer/dashboard", label: "My Products", icon: LayoutDashboard },
  { href: "/farmer/add-product", label: "Add Product", icon: PlusCircle },
  { href: "/farmer/orders", label: "Orders", icon: User },
  { href: "/weather", label: "Weather", icon: CloudSun },
  { href: "/profile", label: "Profile", icon: User },
];

const restaurantLinks = [
  { href: "/restaurant/dashboard", label: "Marketplace", icon: LayoutDashboard },
  { href: "/restaurant/my-bids", label: "My Bids", icon: User },
  { href: "/restaurant/orders", label: "Orders", icon: User },
  { href: "/weather", label: "Weather", icon: CloudSun },
  { href: "/profile", label: "Profile", icon: User },
];

function DashboardLayout({ children, role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [user, setUser] = useState(null);

  const links = role === "FARMER" ? farmerLinks : restaurantLinks;
  const isFarmer = role === "FARMER";

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch { /* ignore */ }
    }
  }, []);

  const fetchWeather = async () => {
    setWeatherLoading(true);
    try {
      const city = localStorage.getItem("weatherCity") || "Indore";
      const res = await weatherService.getByCity(city);
      setWeather(res.data);
    } catch (e) {
      setWeather(null);
    }
    setWeatherLoading(false);
  };

  useEffect(() => {
    if (isFarmer) {
      fetchWeather();
    }
  }, [isFarmer]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getWeatherIcon = (icon) => {
    if (!icon) return <Sun size={20} />;
    if (icon.includes("01")) return <Sun size={20} />;
    if (icon.includes("02") || icon.includes("03")) return <CloudSun size={20} />;
    if (icon.includes("09") || icon.includes("10")) return <Droplets size={20} />;
    return <CloudSun size={20} />;
  };

  return (
    <div className="dashboard-layout">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="mobile-menu-btn"
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 200,
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '8px',
          padding: '10px',
          cursor: 'pointer',
          color: 'var(--deep-moss)',
          backdropFilter: 'blur(12px)',
          display: 'none',
        }}
      >
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Leaf size={22} color="white" />
          </div>
          <div className="sidebar-brand-text">
            <span className="gradient-text">Agri</span>Direct
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {links.map((link) => {
            const isActive = location.pathname === link.href;
            const Icon = link.icon;
            return (
              <div
                key={link.href}
                onClick={() => navigate(link.href)}
                className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </div>
            );
          })}
        </nav>

        {isFarmer && (
          <div className="sidebar-weather">
            <div className="weather-header">
              <CloudSun size={16} />
              <span>Weather</span>
            </div>
            {weatherLoading ? (
              <div style={{ textAlign: 'center', padding: '8px' }}>
                <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
              </div>
            ) : weather ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {getWeatherIcon(weather.icon)}
                  <span className="weather-temp">{Math.round(weather.temperature)}°C</span>
                </div>
                <div className="weather-city">{weather.city}</div>
                <div className="weather-details">
                  <span>💧 {weather.humidity}%</span>
                  <span>💨 {weather.windSpeed} m/s</span>
                </div>
              </div>
            ) : (
              <button onClick={fetchWeather} className="btn btn-sm btn-secondary" style={{ width: '100%', fontSize: '12px' }}>
                Load Weather
              </button>
            )}
          </div>
        )}

        <div className="sidebar-footer">
          {user && (
            <div className="user-info">
              <div className="user-avatar">
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="user-name">{user.name || 'User'}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-content fade-in">
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            z-index: 150;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .dashboard-main {
            margin-left: 0 !important;
          }
          .dashboard-sidebar.sidebar-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

export default DashboardLayout;
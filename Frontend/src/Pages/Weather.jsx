import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { weatherService } from '../Services/api.jsx';
import { motion } from 'framer-motion';
import { CloudSun, Sun, Cloud, Droplets, Wind, Search, ArrowLeft, MapPin } from 'lucide-react';
import DashboardLayout from '../Components/DashboardLayout';

const WeatherIcon = ({ icon, size = 48 }) => {
  if (!icon) return <CloudSun size={size} />;
  if (icon.includes("01")) return <Sun size={size} />;
  if (icon.includes("02") || icon.includes("03") || icon.includes("04")) return <Cloud size={size} />;
  if (icon.includes("09") || icon.includes("10")) return <Droplets size={size} />;
  if (icon.includes("11")) return <Cloud size={size} />;
  if (icon.includes("13")) return <Sun size={size} />;
  return <CloudSun size={size} />;
};

const getIconColor = (icon) => {
  if (!icon) return 'var(--accent-primary)';
  if (icon.includes("01")) return '#fbbf24';
  if (icon.includes("02") || icon.includes("03")) return '#94a3b8';
  if (icon.includes("09") || icon.includes("10")) return '#3b82f6';
  return 'var(--accent-primary)';
};

function WeatherContent({ city, setCity, weather, forecast, loading, error, onFetch }) {
  const groupedForecast = (() => {
    if (!forecast.length) return [];
    const grouped = {};
    forecast.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(item);
    });
    return Object.entries(grouped).slice(0, 5).map(([date, items]) => {
      const temps = items.map(i => i.main?.temp);
      const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
      const maxTemp = Math.max(...temps);
      const minTemp = Math.min(...temps);
      const mainIcon = items[Math.floor(items.length / 2)]?.weather?.[0]?.icon;
      const description = items[Math.floor(items.length / 2)]?.weather?.[0]?.description;
      const humidity = Math.round(items.reduce((s, i) => s + (i.main?.humidity || 0), 0) / items.length);
      return { date, avgTemp, maxTemp, minTemp, icon: mainIcon, description, humidity };
    });
  })();

  const handleSubmit = (e) => {
    e.preventDefault();
    onFetch();
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
            Weather <span className="gradient-text">Forecast</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Plan your farming activities with accurate weather data
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          maxWidth: '500px',
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <MapPin size={16} style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }} />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name"
              className="glass-input"
              style={{ paddingLeft: '42px' }}
            />
          </div>
          <motion.button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? (
              <div className="spinner" style={{ width: '20px', height: '20px' }} />
            ) : (
              <>
                <Search size={16} />
                Search
              </>
            )}
          </motion.button>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="form-error"
          >
            {error}
          </motion.div>
        )}

        {weather && (
          <>
            <div className="glass-card-static" style={{
              padding: '48px',
              textAlign: 'center',
              marginBottom: '32px',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(99,102,241,0.08))',
              border: '1px solid rgba(16,185,129,0.15)',
            }}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                style={{
                  color: getIconColor(weather.icon),
                  marginBottom: '16px',
                  display: 'inline-block',
                }}
              >
                <WeatherIcon icon={weather.icon} size={72} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontSize: '72px',
                  fontWeight: 800,
                  lineHeight: 1,
                  background: 'var(--accent-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '8px',
                }}
              >
                {Math.round(weather.temperature || 0)}°
              </motion.div>

              <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
                {weather.city}{weather.country ? `, ${weather.country}` : ''}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'capitalize', marginBottom: '32px' }}>
                {weather.description}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                maxWidth: '500px',
                margin: '0 auto',
              }}>
                {[
                  { label: 'Feels Like', value: `${Math.round(weather.feelsLike || 0)}°C`, color: '#f59e0b' },
                  { label: 'Humidity', value: `${weather.humidity || 0}%`, color: '#3b82f6' },
                  { label: 'Wind Speed', value: `${weather.windSpeed || 0} m/s`, color: '#94a3b8' },
                ].map((stat) => (
                  <div key={stat.label} style={{
                    padding: '16px',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      {stat.label}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {groupedForecast.length > 0 && (
              <div>
                <h2 className="section-title" style={{ marginBottom: '24px' }}>
                  5-Day <span>Forecast</span>
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {groupedForecast.map((day, index) => (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        padding: '20px 24px',
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '16px',
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: `${getIconColor(day.icon)}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: getIconColor(day.icon),
                        flexShrink: 0,
                      }}>
                        <WeatherIcon icon={day.icon} size={28} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{day.date}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{day.description}</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '18px', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {Math.round(day.avgTemp)}°
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            H: {Math.round(day.maxTemp)}° L: {Math.round(day.minTemp)}°
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--info)', fontSize: '13px', minWidth: '60px' }}>
                          <Droplets size={12} />
                          {day.humidity}%
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!weather && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{ padding: '64px', textAlign: 'center' }}
          >
            <div style={{ marginBottom: '16px' }}>
              <CloudSun size={64} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              Enter a city name to check weather conditions
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function Weather() {
  const navigate = useNavigate();
  const [city, setCity] = useState('Indore');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    setLoading(true);
    setError('');

    try {
      const weatherRes = await weatherService.getByCity(city);
      setWeather(weatherRes.data);

      const forecastRes = await weatherService.getForecast(city);
      if (forecastRes.data?.list) {
        setForecast(forecastRes.data.list);
      }
    } catch {
      setError('Failed to fetch weather data. Check the city name.');
    }

    setLoading(false);
  };

  const isFarmer = localStorage.getItem("role") === "FARMER";

  if (isFarmer) {
    return (
      <DashboardLayout role="FARMER">
        <WeatherContent
          city={city}
          setCity={setCity}
          weather={weather}
          forecast={forecast}
          loading={loading}
          error={error}
          onFetch={fetchWeather}
        />
      </DashboardLayout>
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
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '900px', padding: '40px 0' }}>
        <motion.button
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/restaurant/dashboard')}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '24px' }}
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </motion.button>
        <WeatherContent
          city={city}
          setCity={setCity}
          weather={weather}
          forecast={forecast}
          loading={loading}
          error={error}
          onFetch={fetchWeather}
        />
      </div>
    </div>
  );
}

export default Weather;

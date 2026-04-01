import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

function ScrollObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-scale').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}

function MouseFollower() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      setIsActive(true);
    };

    const handleLeave = () => {
      setIsActive(false);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseleave', handleLeave);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <>
      <div 
        className={`glow-trail ${isActive ? 'active' : ''}`}
        style={{ left: pos.x, top: pos.y }}
      />
      <div 
        className="mouse-follower"
        style={{ left: pos.x, top: pos.y }}
      />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.Fragment>
    <MouseFollower />
    <ScrollObserver />
    <App />
  </React.Fragment>
)
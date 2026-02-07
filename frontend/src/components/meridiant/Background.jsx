import React, { useMemo } from 'react';

const Background = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 130 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      animDelay: Math.random() * 4,
      animDuration: Math.random() * 3 + 2,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#080d18', zIndex: -1 }}>
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full star-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: `rgba(255, 255, 255, ${star.opacity})`,
            animationDelay: `${star.animDelay}s`,
            animationDuration: `${star.animDuration}s`,
          }}
        />
      ))}

      {/* Nebula clouds */}
      <div className="nebula-cloud nebula-1" />
      <div className="nebula-cloud nebula-2" />
      <div className="nebula-cloud nebula-3" />
      <div className="nebula-cloud nebula-4" />

      {/* Shooting stars */}
      <div className="shooting-star" style={{ top: '12%', left: '25%', animationDelay: '0s' }} />
      <div className="shooting-star" style={{ top: '38%', left: '68%', animationDelay: '2.5s' }} />
      <div className="shooting-star" style={{ top: '55%', left: '12%', animationDelay: '5s' }} />
      <div className="shooting-star" style={{ top: '22%', left: '82%', animationDelay: '8s' }} />

      {/* Orbital rings */}
      <div
        className="orbital-ring"
        style={{ top: '6%', right: '10%', width: '300px', height: '130px', transform: 'rotate(-18deg)' }}
      />
      <div
        className="orbital-ring"
        style={{ top: '3%', right: '7%', width: '350px', height: '155px', transform: 'rotate(-23deg)' }}
      />
    </div>
  );
};

export default Background;

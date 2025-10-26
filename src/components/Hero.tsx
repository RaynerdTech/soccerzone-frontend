import React, { useEffect, useRef, useState } from "react";

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, vx: number, vy: number, life: number}>>([]);
  const [impactRipple, setImpactRipple] = useState(false);
  const particleIdRef = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.5,
      }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  // Trigger impact effect every 2 seconds (matching bounce animation)
  useEffect(() => {
    const impactInterval = setInterval(() => {
      // Create impact ripple
      setImpactRipple(true);
      setTimeout(() => setImpactRipple(false), 400);

      // Create particles on impact
      const newParticles: Array<{id: number, x: number, y: number, vx: number, vy: number, life: number}> = [];
      const particleCount = 12;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI / 3) + (Math.PI / 3) * (i / particleCount); // Spread upward
        const speed = 2 + Math.random() * 3;
        newParticles.push({
          id: particleIdRef.current++,
          x: 0,
          y: 0,
          vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
          vy: -Math.sin(angle) * speed,
          life: 1,
        });
      }
      
      setParticles(prev => [...prev, ...newParticles]);
    }, 2000);

    return () => clearInterval(impactInterval);
  }, []);

  // Animate particles
  useEffect(() => {
    const animationFrame = setInterval(() => {
      setParticles(prev => {
        return prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.3, // Gravity
            vx: p.vx * 0.98, // Air resistance
            life: p.life - 0.02,
          }))
          .filter(p => p.life > 0);
      });
    }, 16);

    return () => clearInterval(animationFrame);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full text-white overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: "url(/pitch-pattern.jpg)" }}
        aria-hidden="true"
      />

      {/* Dark Overlay */}
      <div
        className="absolute inset-0 w-full h-full bg-black/70"
        aria-hidden="true"
      />

      {/* Hero Content */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6 transition-all duration-1000 ease-out 
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="welcome-badge mb-6">
          <span className="welcome-text">WELCOME TO SOCCERZONE</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 max-w-4xl leading-tight lg:leading-snug">
          Book Your Game.
Fill the Field{" "}
          <span className="inline-block relative ball-container">
            <span className="inline-block animate-bounce-slow ball-emoji">⚽</span>
            
            {/* Impact shadow that pulses on landing */}
            <span className={`impact-shadow ${impactRipple ? 'active' : ''}`} />
            
            {/* Ground ripple effect */}
            <span className={`ground-ripple ${impactRipple ? 'active' : ''}`} />
            
            {/* Particle system */}
            <span className="particle-container">
              {particles.map(particle => (
                <span
                  key={particle.id}
                  className="particle"
                  style={{
                    left: `${particle.x}px`,
                    bottom: `${particle.y}px`,
                    opacity: particle.life,
                    transform: `scale(${particle.life})`,
                  }}
                />
              ))}
            </span>
          </span>
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl max-w-3xl mb-12 text-gray-200">
          Discover available match slots, reserve your spot instantly, and enjoy
          organized games with no stress.
        </p>
        <a
          href="#matches"
          className="bg-white text-green-700 font-bold text-lg py-4 px-10 rounded-full shadow-lg 
                     hover:bg-gray-100 hover:shadow-xl hover:scale-105 
                     transform transition-all duration-300 ease-in-out"
        >
          View Available Matches
        </a>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(-15px);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        
        .ball-container {
          position: relative;
          display: inline-block;
        }
        
        .ball-emoji {
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        
        /* Impact shadow beneath the ball */
        .impact-shadow {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%) scale(0.3);
          width: 30px;
          height: 8px;
          background: radial-gradient(ellipse, rgba(0,0,0,0.5), transparent);
          border-radius: 50%;
          opacity: 0;
          transition: all 0.1s ease-out;
          z-index: 1;
        }
        
        .impact-shadow.active {
          transform: translateX(-50%) scale(1.2);
          opacity: 1;
          animation: shadow-pulse 0.4s ease-out;
        }
        
        @keyframes shadow-pulse {
          0% {
            transform: translateX(-50%) scale(0.3);
            opacity: 0;
          }
          50% {
            transform: translateX(-50%) scale(1.3);
            opacity: 1;
          }
          100% {
            transform: translateX(-50%) scale(0.8);
            opacity: 0.6;
          }
        }
        
        /* Ground ripple/shockwave effect */
        .ground-ripple {
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%) scale(0);
          width: 40px;
          height: 6px;
          background: transparent;
          border: 2px solid rgba(255,255,255,0.6);
          border-radius: 50%;
          opacity: 0;
          z-index: 0;
        }
        
        .ground-ripple.active {
          animation: ripple-expand 0.5s ease-out;
        }
        
        @keyframes ripple-expand {
          0% {
            transform: translateX(-50%) scale(0.5);
            opacity: 0.8;
            border-width: 3px;
          }
          100% {
            transform: translateX(-50%) scale(2.5);
            opacity: 0;
            border-width: 1px;
          }
        }
        
        /* Particle container */
        .particle-container {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 1px;
          height: 1px;
          pointer-events: none;
          z-index: 1;
        }
        
        /* Individual particles */
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, rgba(255,255,255,0.9), rgba(200,200,200,0.5));
          border-radius: 50%;
          pointer-events: none;
          box-shadow: 0 0 3px rgba(255,255,255,0.5);
        }
        
        /* Welcome badge with creative green background */
        .welcome-badge {
          position: relative;
          display: inline-block;
          padding: 12px 32px;
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
          border-radius: 50px;
          box-shadow: 
            0 4px 20px rgba(16, 185, 129, 0.4),
            inset 0 1px 0 rgba(255,255,255,0.2),
            inset 0 -1px 0 rgba(0,0,0,0.2);
          overflow: hidden;
          animation: badge-glow 3s ease-in-out infinite;
        }
        
        .welcome-badge::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255,255,255,0.1) 50%,
            transparent 70%
          );
          animation: shine 4s infinite;
        }
        
        .welcome-badge::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15), transparent 60%);
          border-radius: 50px;
        }
        
        .welcome-badge p {
          position: relative;
          z-index: 1;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        @keyframes badge-glow {
          0%, 100% {
            box-shadow: 
              0 4px 20px rgba(16, 185, 129, 0.4),
              inset 0 1px 0 rgba(255,255,255,0.2),
              inset 0 -1px 0 rgba(0,0,0,0.2);
          }
          50% {
            box-shadow: 
              0 4px 30px rgba(16, 185, 129, 0.6),
              0 0 40px rgba(16, 185, 129, 0.3),
              inset 0 1px 0 rgba(255,255,255,0.2),
              inset 0 -1px 0 rgba(0,0,0,0.2);
          }
        }
        
        @keyframes shine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
        }
        
        /* Add slight squash effect on impact */
        @keyframes bounce-slow {
          0% {
            transform: translateY(0) scaleY(1) scaleX(1);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          48% {
            transform: translateY(-15px) scaleY(1.05) scaleX(0.95);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
          50% {
            transform: translateY(-15px) scaleY(1) scaleX(1);
          }
          98% {
            transform: translateY(0) scaleY(0.9) scaleX(1.1);
          }
          100% {
            transform: translateY(0) scaleY(1) scaleX(1);
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
import React from 'react';

export interface ZoxaaLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

const ZoxaaLogo: React.FC<ZoxaaLogoProps> = ({ 
  size = 120, 
  className = "", 
  animated = true 
}) => {
  return (
    <div className={`inline-flex items-center justify-center ${className}`} aria-label="ZOXAA logo">
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
        role="img"
      >
        <title>ZOXAA Logo</title>
        <desc>Gradient Z shape with energetic accents representing the ZOXAA brand</desc>
        <defs>
          <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main Z shape with dynamic energy */}
        <g filter="url(#glow)">
          <path
            d="M25 30 L85 30 L45 60 L95 60 L95 75 L35 75 L75 45 L25 45 Z"
            fill="url(#primaryGradient)"
            className={animated ? "animate-pulse" : ""}
          />
        </g>
        
        {/* Energy orbs */}
        <circle
          cx="20"
          cy="20"
          r="8"
          fill="url(#accentGradient)"
          className={animated ? "animate-bounce" : ""}
          style={animated ? { animationDelay: "0.2s", animationDuration: "2s" } : {}}
        />
        <circle
          cx="100"
          cy="100"
          r="6"
          fill="url(#accentGradient)"
          className={animated ? "animate-bounce" : ""}
          style={animated ? { animationDelay: "0.8s", animationDuration: "2.5s" } : {}}
        />
        <circle
          cx="95"
          cy="25"
          r="4"
          fill="#06b6d4"
          className={animated ? "animate-ping" : ""}
          style={animated ? { animationDelay: "1s", animationDuration: "3s" } : {}}
        />
        
        {/* Abstract neural network lines */}
        <g opacity="0.6">
          <line
            x1="20"
            y1="20"
            x2="45"
            y2="45"
            stroke="url(#accentGradient)"
            strokeWidth="2"
            className={animated ? "animate-pulse" : ""}
            style={animated ? { animationDelay: "0.5s" } : {}}
          />
          <line
            x1="75"
            y1="75"
            x2="100"
            y2="100"
            stroke="url(#accentGradient)"
            strokeWidth="2"
            className={animated ? "animate-pulse" : ""}
            style={animated ? { animationDelay: "1.2s" } : {}}
          />
          <line
            x1="95"
            y1="25"
            x2="85"
            y2="35"
            stroke="#06b6d4"
            strokeWidth="1.5"
            className={animated ? "animate-pulse" : ""}
            style={animated ? { animationDelay: "0.8s" } : {}}
          />
        </g>
        
        {/* Power symbol integration */}
        <g transform="translate(85, 80)">
          <circle
            cx="0"
            cy="0"
            r="12"
            fill="none"
            stroke="url(#primaryGradient)"
            strokeWidth="3"
            strokeDasharray="25 10"
            className={animated ? "animate-spin" : ""}
            style={animated ? { animationDuration: "4s" } : {}}
          />
          <line
            x1="0"
            y1="-8"
            x2="0"
            y2="0"
            stroke="url(#primaryGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
};

export default ZoxaaLogo;

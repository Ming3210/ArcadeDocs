"use client";

import React from "react";

// 1. Invader Squid (8x8)
export const InvaderSquid: React.FC<{ size?: number; color?: string; className?: string; style?: React.CSSProperties }> = ({
  size = 28,
  color = "#00f0ff",
  className = "",
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 8 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pixelated ${className}`}
    style={style}
    shapeRendering="crispEdges"
  >
    <rect x="3" y="0" width="2" height="1" fill={color} />
    <rect x="2" y="1" width="4" height="1" fill={color} />
    <rect x="1" y="2" width="6" height="1" fill={color} />
    <rect x="0" y="3" width="2" height="1" fill={color} />
    <rect x="3" y="3" width="2" height="1" fill={color} />
    <rect x="6" y="3" width="2" height="1" fill={color} />
    <rect x="0" y="4" width="8" height="1" fill={color} />
    <rect x="2" y="5" width="1" height="1" fill={color} />
    <rect x="5" y="5" width="1" height="1" fill={color} />
    <rect x="1" y="6" width="1" height="1" fill={color} />
    <rect x="3" y="6" width="2" height="1" fill={color} />
    <rect x="6" y="6" width="1" height="1" fill={color} />
    <rect x="0" y="7" width="1" height="1" fill={color} />
    <rect x="2" y="7" width="1" height="1" fill={color} />
    <rect x="5" y="7" width="1" height="1" fill={color} />
    <rect x="7" y="7" width="1" height="1" fill={color} />
  </svg>
);

// 2. Invader Crab (11x8)
export const InvaderCrab: React.FC<{ size?: number; color?: string; className?: string; style?: React.CSSProperties }> = ({
  size = 32,
  color = "#ff007f",
  className = "",
  style,
}) => (
  <svg
    width={size}
    height={(size * 8) / 11}
    viewBox="0 0 11 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pixelated ${className}`}
    style={style}
    shapeRendering="crispEdges"
  >
    <rect x="2" y="0" width="1" height="1" fill={color} />
    <rect x="8" y="0" width="1" height="1" fill={color} />
    <rect x="3" y="1" width="1" height="1" fill={color} />
    <rect x="7" y="1" width="1" height="1" fill={color} />
    <rect x="2" y="2" width="7" height="1" fill={color} />
    <rect x="1" y="3" width="2" height="1" fill={color} />
    <rect x="4" y="3" width="3" height="1" fill={color} />
    <rect x="8" y="3" width="2" height="1" fill={color} />
    <rect x="0" y="4" width="11" height="1" fill={color} />
    <rect x="0" y="5" width="1" height="1" fill={color} />
    <rect x="2" y="5" width="7" height="1" fill={color} />
    <rect x="10" y="5" width="1" height="1" fill={color} />
    <rect x="0" y="6" width="1" height="1" fill={color} />
    <rect x="2" y="6" width="1" height="1" fill={color} />
    <rect x="8" y="6" width="1" height="1" fill={color} />
    <rect x="10" y="6" width="1" height="1" fill={color} />
    <rect x="3" y="7" width="2" height="1" fill={color} />
    <rect x="6" y="7" width="2" height="1" fill={color} />
  </svg>
);

// 3. Invader Octopus (12x8)
export const InvaderOctopus: React.FC<{ size?: number; color?: string; className?: string; style?: React.CSSProperties }> = ({
  size = 32,
  color = "#39ff14",
  className = "",
  style,
}) => (
  <svg
    width={size}
    height={(size * 8) / 12}
    viewBox="0 0 12 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pixelated ${className}`}
    style={style}
    shapeRendering="crispEdges"
  >
    <rect x="4" y="0" width="4" height="1" fill={color} />
    <rect x="1" y="1" width="10" height="1" fill={color} />
    <rect x="0" y="2" width="12" height="1" fill={color} />
    <rect x="0" y="3" width="3" height="1" fill={color} />
    <rect x="5" y="3" width="2" height="1" fill={color} />
    <rect x="9" y="3" width="3" height="1" fill={color} />
    <rect x="0" y="4" width="12" height="1" fill={color} />
    <rect x="3" y="5" width="2" height="1" fill={color} />
    <rect x="7" y="5" width="2" height="1" fill={color} />
    <rect x="2" y="6" width="1" height="1" fill={color} />
    <rect x="4" y="6" width="1" height="1" fill={color} />
    <rect x="7" y="6" width="1" height="1" fill={color} />
    <rect x="9" y="6" width="1" height="1" fill={color} />
    <rect x="0" y="7" width="1" height="1" fill={color} />
    <rect x="2" y="7" width="1" height="1" fill={color} />
    <rect x="9" y="7" width="1" height="1" fill={color} />
    <rect x="11" y="7" width="1" height="1" fill={color} />
  </svg>
);

// 4. Mystery UFO Mothership (16x7)
export const InvaderUFO: React.FC<{ size?: number; color?: string; className?: string; style?: React.CSSProperties }> = ({
  size = 48,
  color = "#ffe600",
  className = "",
  style,
}) => (
  <svg
    width={size}
    height={(size * 7) / 16}
    viewBox="0 0 16 7"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`pixelated ${className}`}
    style={style}
    shapeRendering="crispEdges"
  >
    <rect x="5" y="0" width="6" height="1" fill={color} />
    <rect x="3" y="1" width="10" height="1" fill={color} />
    <rect x="2" y="2" width="12" height="1" fill={color} />
    <rect x="1" y="3" width="2" height="1" fill={color} />
    <rect x="4" y="3" width="2" height="1" fill={color} />
    <rect x="7" y="3" width="2" height="1" fill={color} />
    <rect x="10" y="3" width="2" height="1" fill={color} />
    <rect x="13" y="3" width="2" height="1" fill={color} />
    <rect x="0" y="4" width="16" height="1" fill={color} />
    <rect x="2" y="5" width="3" height="1" fill={color} />
    <rect x="6" y="5" width="4" height="1" fill={color} />
    <rect x="11" y="5" width="3" height="1" fill={color} />
    <rect x="3" y="6" width="1" height="1" fill={color} />
    <rect x="12" y="6" width="1" height="1" fill={color} />
  </svg>
);

// Animated Background with floating Space Invaders
export const SpaceInvadersBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* UFO bay ngang góc trên */}
      <div className="absolute -top-2 left-[15%] opacity-30 animate-pulse">
        <InvaderUFO size={44} color="#ff0055" />
      </div>

      {/* Đội hình góc trên - bên trái */}
      <div className="absolute top-20 left-6 sm:left-14 flex flex-col gap-5 opacity-25">
        <div className="flex gap-4 animate-bounce" style={{ animationDuration: "3s" }}>
          <InvaderSquid size={24} color="#00f0ff" />
          <InvaderSquid size={24} color="#00f0ff" />
        </div>
        <div className="flex gap-4 pl-3 animate-pulse" style={{ animationDuration: "4s" }}>
          <InvaderCrab size={28} color="#ff007f" />
          <InvaderCrab size={28} color="#ff007f" />
        </div>
      </div>

      {/* Đội hình góc trên - bên phải */}
      <div className="absolute top-24 right-6 sm:right-16 flex flex-col gap-5 opacity-25">
        <div className="flex gap-4 animate-pulse" style={{ animationDuration: "2.5s" }}>
          <InvaderOctopus size={28} color="#39ff14" />
          <InvaderOctopus size={28} color="#39ff14" />
        </div>
        <div className="flex gap-4 pr-3 animate-bounce" style={{ animationDuration: "3.5s" }}>
          <InvaderSquid size={24} color="#ffe600" />
          <InvaderSquid size={24} color="#ffe600" />
        </div>
      </div>

      {/* Đội hình góc dưới - bên trái */}
      <div className="absolute bottom-28 left-8 sm:left-20 flex gap-6 opacity-20 animate-pulse" style={{ animationDuration: "5s" }}>
        <InvaderOctopus size={30} color="#a855f7" />
        <InvaderCrab size={28} color="#00f0ff" />
      </div>

      {/* Đội hình góc dưới - bên phải */}
      <div className="absolute bottom-24 right-8 sm:right-24 flex gap-6 opacity-25">
        <InvaderCrab size={32} color="#ffe600" className="animate-bounce" style={{ animationDuration: "4s" }} />
        <InvaderSquid size={26} color="#ff007f" className="animate-pulse" style={{ animationDuration: "3s" }} />
      </div>

      {/* Điểm pixel laser đạn bắn retro rải rác */}
      <div className="absolute top-44 left-1/3 w-1 h-3 bg-cyan-400 opacity-40 animate-ping" />
      <div className="absolute top-64 right-1/3 w-1 h-3 bg-pink-500 opacity-40 animate-ping" style={{ animationDuration: "1.8s" }} />
      <div className="absolute bottom-40 left-1/2 w-1 h-3 bg-yellow-400 opacity-30 animate-pulse" />
    </div>
  );
};

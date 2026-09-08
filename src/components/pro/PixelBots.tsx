"use client";

import React from "react";

// Bot Discord 8-Bit Pixel Mascot
export const PixelDiscordBot: React.FC<{ className?: string; size?: number }> = ({
  className = "",
  size = 48,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pixelated ${className}`}
      shapeRendering="crispEdges"
    >
      {/* Headset / Antenna */}
      <rect x="11" y="1" width="2" height="3" fill="#00f0ff" />
      <rect x="10" y="0" width="4" height="1" fill="#ffe600" />
      <rect x="3" y="7" width="2" height="6" fill="#ff007f" />
      <rect x="19" y="7" width="2" height="6" fill="#ff007f" />

      {/* Outer Head (Dark Indigo) */}
      <rect x="5" y="4" width="14" height="12" fill="#5865F2" />
      <rect x="4" y="5" width="16" height="10" fill="#5865F2" />

      {/* Face Screen (Deep Obsidian) */}
      <rect x="6" y="6" width="12" height="8" fill="#1e1f2f" />

      {/* Pixel Eyes (Glowing Cyan / Mint) */}
      <rect x="8" y="8" width="2" height="3" fill="#39ff14" />
      <rect x="9" y="9" width="1" height="1" fill="#ffffff" />
      <rect x="14" y="8" width="2" height="3" fill="#39ff14" />
      <rect x="15" y="9" width="1" height="1" fill="#ffffff" />

      {/* Pixel Blush */}
      <rect x="7" y="11" width="2" height="1" fill="#ff007f" opacity="0.8" />
      <rect x="15" y="11" width="2" height="1" fill="#ff007f" opacity="0.8" />

      {/* Pixel Smile */}
      <rect x="10" y="12" width="4" height="1" fill="#00f0ff" />

      {/* Body */}
      <rect x="8" y="16" width="8" height="4" fill="#4752c4" />
      <rect x="10" y="17" width="4" height="2" fill="#00f0ff" />

      {/* Limbs */}
      <rect x="6" y="17" width="2" height="3" fill="#3c45a5" />
      <rect x="16" y="17" width="2" height="3" fill="#3c45a5" />
      <rect x="8" y="20" width="3" height="2" fill="#2c3275" />
      <rect x="13" y="20" width="3" height="2" fill="#2c3275" />
    </svg>
  );
};

// 8-bit Pixel Heart (HP)
export const PixelHeart: React.FC<{ className?: string; size?: number }> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    className={`pixelated ${className}`}
    shapeRendering="crispEdges"
  >
    <rect x="2" y="2" width="4" height="4" fill="#ff0055" />
    <rect x="10" y="2" width="4" height="4" fill="#ff0055" />
    <rect x="4" y="2" width="8" height="4" fill="#ff0055" />
    <rect x="2" y="4" width="12" height="4" fill="#ff0055" />
    <rect x="4" y="8" width="8" height="4" fill="#ff0055" />
    <rect x="6" y="12" width="4" height="2" fill="#ff0055" />
    {/* Highlight */}
    <rect x="3" y="3" width="2" height="2" fill="#ffffff" />
  </svg>
);

// 8-bit Pixel Joystick
export const PixelJoystick: React.FC<{ className?: string; size?: number }> = ({
  size = 24,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    className={`pixelated ${className}`}
    shapeRendering="crispEdges"
  >
    <rect x="6" y="1" width="4" height="4" fill="#ff007f" />
    <rect x="7" y="5" width="2" height="5" fill="#94a3b8" />
    <rect x="2" y="10" width="12" height="5" fill="#1e293b" />
    <rect x="4" y="11" width="2" height="2" fill="#00f0ff" />
    <rect x="10" y="11" width="2" height="2" fill="#ffe600" />
  </svg>
);

// 8-bit Pixel Cloud (PartyKit / Cloudinary)
export const PixelCloud: React.FC<{ className?: string; size?: number }> = ({
  size = 24,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    className={`pixelated ${className}`}
    shapeRendering="crispEdges"
  >
    <rect x="4" y="4" width="8" height="4" fill="#00f0ff" />
    <rect x="2" y="6" width="12" height="4" fill="#00f0ff" />
    <rect x="1" y="8" width="14" height="4" fill="#00f0ff" />
    {/* Highlight */}
    <rect x="4" y="5" width="4" height="2" fill="#ffffff" />
  </svg>
);

// 8-bit Pixel Ghost Companion Bot
export const PixelGhostBot: React.FC<{
  className?: string;
  size?: number;
  color?: string;
}> = ({ size = 32, className = "", color = "#a855f7" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    className={`pixelated ${className}`}
    shapeRendering="crispEdges"
  >
    {/* Body */}
    <rect x="4" y="1" width="8" height="2" fill={color} />
    <rect x="2" y="3" width="12" height="9" fill={color} />
    {/* Tentacles */}
    <rect x="2" y="12" width="2" height="3" fill={color} />
    <rect x="6" y="12" width="4" height="2" fill={color} />
    <rect x="12" y="12" width="2" height="3" fill={color} />
    {/* Eyes */}
    <rect x="4" y="4" width="3" height="4" fill="#ffffff" />
    <rect x="9" y="4" width="3" height="4" fill="#ffffff" />
    {/* Pupils */}
    <rect x="5" y="5" width="2" height="2" fill="#00f0ff" />
    <rect x="10" y="5" width="2" height="2" fill="#00f0ff" />
  </svg>
);

import React from 'react';
import { PillVisual, PillColor } from '../../types/medication';

interface PillVisualizerProps {
  visual: PillVisual;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const COLOR_MAP: Record<PillColor, { bg: string; border: string; text: string }> = {
  WHITE: { bg: '#FFFFFF', border: '#CBD5E1', text: '#334155' },
  YELLOW: { bg: '#FEF08A', border: '#EAB308', text: '#713F12' },
  ORANGE: { bg: '#FED7AA', border: '#F97316', text: '#7C2D12' },
  RED: { bg: '#FCA5A5', border: '#EF4444', text: '#7F1D1D' },
  PINK: { bg: '#FBCFE8', border: '#EC4899', text: '#831843' },
  PURPLE: { bg: '#E9D5FF', border: '#A855F7', text: '#581C87' },
  BLUE: { bg: '#BAE6FD', border: '#0284C7', text: '#0C4A6E' },
  GREEN: { bg: '#BBF7D0', border: '#22C55E', text: '#14532D' },
  BROWN: { bg: '#D7CCC8', border: '#8D6E63', text: '#3E2723' },
  BEIGE: { bg: '#F5F5DC', border: '#D4C4A8', text: '#4E3629' },
  GRAY: { bg: '#E2E8F0', border: '#94A3B8', text: '#1E293B' },
};

const SIZE_MAP = {
  sm: { width: 36, height: 36, fontSize: 8 },
  md: { width: 52, height: 52, fontSize: 10 },
  lg: { width: 72, height: 72, fontSize: 13 },
  xl: { width: 96, height: 96, fontSize: 16 },
};

export const PillVisualizer: React.FC<PillVisualizerProps> = ({
  visual,
  size = 'md',
  className = '',
}) => {
  const { shape, primaryColor, imprint, score, form } = visual;
  const { width, height, fontSize } = SIZE_MAP[size];
  const colorSpec = COLOR_MAP[primaryColor] || COLOR_MAP.WHITE;

  const renderShape = () => {
    switch (shape) {
      case 'ROUND':
        return (
          <circle
            cx="50"
            cy="50"
            r="42"
            fill={colorSpec.bg}
            stroke={colorSpec.border}
            strokeWidth="3.5"
          />
        );
      case 'OVAL':
        return (
          <ellipse
            cx="50"
            cy="50"
            rx="45"
            ry="30"
            fill={colorSpec.bg}
            stroke={colorSpec.border}
            strokeWidth="3.5"
          />
        );
      case 'OBLONG':
        return (
          <rect
            x="10"
            y="26"
            width="80"
            height="48"
            rx="24"
            fill={colorSpec.bg}
            stroke={colorSpec.border}
            strokeWidth="3.5"
          />
        );
      case 'CAPSULE':
        return (
          <g>
            <rect
              x="12"
              y="28"
              width="76"
              height="44"
              rx="22"
              fill={colorSpec.bg}
              stroke={colorSpec.border}
              strokeWidth="3.5"
            />
            {/* Two-tone capsule dividing line */}
            <path
              d="M 50 28 L 50 72"
              stroke={colorSpec.border}
              strokeWidth="2.5"
              strokeDasharray="2,2"
            />
            <path
              d="M 12 50 C 12 37.85 21.85 28 34 28 L 50 28 L 50 72 L 34 72 C 21.85 72 12 62.15 12 50 Z"
              fill={colorSpec.border}
              opacity="0.35"
            />
          </g>
        );
      case 'TRIANGLE':
        return (
          <polygon
            points="50,12 88,80 12,80"
            fill={colorSpec.bg}
            stroke={colorSpec.border}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        );
      case 'SQUARE':
        return (
          <rect
            x="16"
            y="16"
            width="68"
            height="68"
            rx="12"
            fill={colorSpec.bg}
            stroke={colorSpec.border}
            strokeWidth="3.5"
          />
        );
      case 'DIAMOND':
        return (
          <polygon
            points="50,12 88,50 50,88 12,50"
            fill={colorSpec.bg}
            stroke={colorSpec.border}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        );
      default:
        return (
          <circle
            cx="50"
            cy="50"
            r="42"
            fill={colorSpec.bg}
            stroke={colorSpec.border}
            strokeWidth="3.5"
          />
        );
    }
  };

  const renderScoreLines = () => {
    if (score === 'SINGLE_SCORE') {
      return (
        <line
          x1="50"
          y1="16"
          x2="50"
          y2="84"
          stroke={colorSpec.border}
          strokeWidth="2"
          opacity="0.75"
        />
      );
    }
    if (score === 'DOUBLE_SCORE') {
      return (
        <g opacity="0.75">
          <line
            x1="50"
            y1="16"
            x2="50"
            y2="84"
            stroke={colorSpec.border}
            strokeWidth="2"
          />
          <line
            x1="16"
            y1="50"
            x2="84"
            y2="50"
            stroke={colorSpec.border}
            strokeWidth="2"
          />
        </g>
      );
    }
    return null;
  };

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
      title={`Visual: ${primaryColor.toLowerCase()} ${shape.toLowerCase()} (${form.toLowerCase()})${
        imprint ? `, Imprint: ${imprint}` : ''
      }`}
      aria-label={`Pill visual: ${primaryColor} ${shape}`}
    >
      <svg
        viewBox="0 0 100 100"
        width={width}
        height={height}
        className="filter drop-shadow-sm transition-transform duration-200 hover:scale-105"
      >
        {renderShape()}
        {renderScoreLines()}
        {imprint && (
          <text
            x="50"
            y="54"
            fill={colorSpec.text}
            fontSize={fontSize * 1.5}
            fontWeight="700"
            textAnchor="middle"
            dominantBaseline="middle"
            className="tracking-wider"
          >
            {imprint}
          </text>
        )}
      </svg>
    </div>
  );
};

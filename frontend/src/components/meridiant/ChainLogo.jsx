import React, { useState } from 'react';
import { chainMetadata } from '@/data/mockData';

const DEFAULT_CHAIN = {
  name: 'Network',
  shortName: 'NET',
  color: '#6B7280',
};

const getInitials = (name) => String(name || DEFAULT_CHAIN.shortName)
  .split(/\s+/)
  .map(part => part[0])
  .join('')
  .slice(0, 3)
  .toUpperCase();

const ChainLogo = ({ chain, size = 16, className = '', showAlt = true }) => {
  const [imgError, setImgError] = useState(false);
  const meta = chainMetadata[chain] || DEFAULT_CHAIN;
  const label = meta.shortName || meta.name || chain || DEFAULT_CHAIN.shortName;

  if (meta.logo && !imgError) {
    return (
      <img
        src={meta.logo}
        alt={showAlt ? `${meta.name || chain} network` : ''}
        width={size}
        height={size}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
        loading="lazy"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <span
      aria-label={showAlt ? `${meta.name || chain} network` : undefined}
      className={`rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold ${className}`}
      style={{ width: size, height: size, backgroundColor: meta.color || DEFAULT_CHAIN.color, fontSize: Math.max(7, size * 0.33) }}
    >
      {getInitials(label)}
    </span>
  );
};

export default ChainLogo;

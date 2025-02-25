// components/ui/Skeleton.js
import React from 'react';

export default function Skeleton({ height = 20, width = '100%', circle = false, count = 1, className = '' }) {
  const skeletons = [];
  
  for (let i = 0; i < count; i++) {
    skeletons.push(
      <div
        key={i}
        className={`animate-pulse bg-gray-200 \${circle ? 'rounded-full' : 'rounded'} \${className}`}
        style={{
          height: typeof height === 'number' ? `\${height}px` : height,
          width: typeof width === 'number' ? `\${width}px` : width,
          display: 'block',
          marginBottom: i < count - 1 ? '0.5rem' : 0
        }}
      />
    );
  }
  
  return <>{skeletons}</>;
}
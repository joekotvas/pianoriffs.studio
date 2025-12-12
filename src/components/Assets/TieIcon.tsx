import React from 'react';

const TieIcon = ({ size = 16, color = "currentColor" }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M 0 10 Q 12 23 24 10 Q 12 16 0 10 Z" />
    </svg>
  );
};

export default TieIcon;

import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = () => {
  return (
    <>
      {/* Skeleton cho Header */}
      <div className="skeleton skeleton-header"></div>
      
      {/* Skeleton cho Vùng điều khiển */}
      <div className="card">
        <div className="controls-grid">
          <div className="skeleton skeleton-control"></div>
          <div className="skeleton skeleton-control"></div>
          <div className="skeleton skeleton-control"></div>
        </div>
      </div>

      {/* Skeleton cho nội dung chính */}
      <div className="card">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-content"></div>
      </div>
    </>
  );
};

export default SkeletonLoader;
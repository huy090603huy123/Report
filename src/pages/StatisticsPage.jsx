// src/pages/StatisticsPage.jsx
import React from 'react';
import { useSelector } from 'react-redux'; // <-- Thêm vào
import './StatisticsPage.css';

const StatisticsPage = () => {
  // --- BẮT ĐẦU CODE MỚI ---
  const { onlineCount, visitorCount } = useSelector((state) => state.data);
  // --- KẾT THÚC CODE MỚI ---

  return (
    <div className="card">
      <h3 style={{ marginTop: 0, color: '#0056b3' }}>Thống kê tổng quan</h3>
      <p>
        Các chỉ số quan trọng về hoạt động và tương tác của người dùng trên trang.
        <br />
        <small><i>Lưu ý: Một số chỉ số được hiển thị dưới dạng dữ liệu mẫu để minh họa.</i></small>
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-icon">👥</span>
            <span>Tổng lượt truy cập</span>
          </div>
          {/* --- SỬA LẠI DÒNG NÀY --- */}
          <div className="stat-card-value">{visitorCount}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-icon">🟢</span>
            <span>Đang online</span>
          </div>
          {/* --- SỬA LẠI DÒNG NÀY --- */}
          <div className="stat-card-value">{onlineCount}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-icon">👤</span>
            <span>Người dùng duy nhất</span>
          </div>
          <div className="stat-card-value">8,320</div>
          <div className="stat-card-note">(Dữ liệu mẫu)</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-icon">📱</span>
            <span>Phiên truy cập</span>
          </div>
          <div className="stat-card-value">9,780</div>
          <div className="stat-card-note">(Dữ liệu mẫu)</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-icon">⏱️</span>
            <span>Thời gian / phiên</span>
          </div>
          <div className="stat-card-value">3m 20s</div>
           <div className="stat-card-note">(Dữ liệu mẫu)</div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
// src/pages/StatisticsPage.jsx
import React from 'react';
import VisitorCounter from '../components/common/VisitorCounter';
import OnlineCounter from '../components/common/OnlineCounter';
import './StatisticsPage.css'; // Import file CSS mới

const StatisticsPage = () => {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0, color: '#0056b3' }}>Thống kê tổng quan</h3>
      <p>
        Các chỉ số quan trọng về hoạt động và tương tác của người dùng trên trang.
        <br />
        <small><i>Lưu ý: Một số chỉ số được hiển thị dưới dạng dữ liệu mẫu để minh họa.</i></small>
      </p>

      {/* Grid hiển thị các thẻ thống kê */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-icon">👥</span>
            <span>Tổng lượt truy cập</span>
          </div>
          <div className="stat-card-value">
            {/* Component VisitorCounter sẽ hiển thị số liệu thật */}
            <VisitorCounter />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-icon">🟢</span>
            <span>Đang online</span>
          </div>
          <div className="stat-card-value">
             {/* Component OnlineCounter sẽ hiển thị số liệu thật */}
            <OnlineCounter />
          </div>
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
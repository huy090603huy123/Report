import React, { useState, useMemo } from 'react';
import ComparisonChart from '../ComparisonChart';
import { normalizeString } from '../../utils';
import { MAX_SCORES, HIDDEN_INDICATORS } from '../../constants';

// Helper function để hiển thị sự thay đổi
const renderChange = (change) => {
  if (isNaN(change)) return <span>N/A</span>;
  if (change === 0) return <span className="change-neutral">0.00</span>;
  const isPositive = change > 0;
  return (
    <span className={isPositive ? 'change-positive' : 'change-negative'}>
      {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}
    </span>
  );
};

// Component chính đã được đơn giản hóa
const SingleUnitView = ({ comparisonData, unitName, oldDate, newDate }) => {
  // --- CHỈ GIỮ LẠI STATE CHO VIỆC LỌC ---
  const [filterText, setFilterText] = useState('');

  // --- LOGIC LỌC DỮ LIỆU ---
  const processedData = useMemo(() => {
    let processableData = [...comparisonData];

    // 1. Lọc các chỉ số bị ẩn
    processableData = processableData.filter(
      (row) => !HIDDEN_INDICATORS.includes(row['CHỈ SỐ'])
    );

    // 2. Lọc theo text người dùng nhập
    if (filterText) {
      const normalizedFilter = normalizeString(filterText);
      processableData = processableData.filter(item => 
        normalizeString(item['CHỈ SỐ']).includes(normalizedFilter) ||
        normalizeString(item['NHÓM CHỈ TIÊU']).includes(normalizedFilter)
      );
    }
    
    // Đã loại bỏ logic sắp xếp

    return processableData;
  }, [comparisonData, filterText]);

  // Nhóm dữ liệu sau khi đã lọc
  const groupedComparisonData = useMemo(() => {
    return processedData.reduce((acc, row) => {
      const groupName = row['NHÓM CHỈ TIÊU'];
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(row);
      return acc;
    }, {});
  }, [processedData]);


  return (
    <>
      <div className="card chart-container">
        <ComparisonChart data={comparisonData} unitName={unitName} />
      </div>

      <div className="card table-container">
        <div className="table-controls">
            <div>
                <h3>Bảng so sánh chi tiết: <strong>{unitName}</strong></h3>
                <p>So sánh giữa ngày <strong>{newDate}</strong> và ngày <strong>{oldDate}</strong></p>
            </div>
            <input
              type="text"
              className="filter-input"
              placeholder="Lọc theo tên chỉ số hoặc nhóm..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
        </div>
        <table>
          <thead>
            <tr>
              <th rowSpan="2">CHỈ SỐ</th>
              <th colSpan="3">TỶ LỆ %</th>
              <th colSpan="3">ĐIỂM ĐÁNH GIÁ</th>
            </tr>
            <tr>
              <th>Ngày cũ ({oldDate})</th>
              <th>Ngày mới ({newDate})</th>
              <th>Thay đổi</th>
              <th>Ngày cũ ({oldDate})</th>
              <th>Ngày mới ({newDate})</th>
              <th>Thay đổi</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(groupedComparisonData).length > 0 ? (
              Object.entries(groupedComparisonData).map(([groupName, rows]) => (
                <React.Fragment key={groupName}>
                  <tr className="group-header-row">
                    <td colSpan="7">{groupName}</td>
                  </tr>
                  {rows.map((row, index) => {
                    const normalizedIndicator = normalizeString(row['CHỈ SỐ']);
                    const maxScore = MAX_SCORES[normalizedIndicator];
                    return (
                      <tr key={index}>
                        <td><div className="indicator-name">{row['CHỈ SỐ']}</div></td>
                        <td>{row.tyLeOld.toFixed(2)}</td>
                        <td>{row.tyLeNew.toFixed(2)}</td>
                        <td>{renderChange(row.thayDoiTyLe)}</td>
                        <td>{row.diemOld.toFixed(2)}{maxScore && <span className="max-score"> / {maxScore}</span>}</td>
                        <td>{row.diemNew.toFixed(2)}{maxScore && <span className="max-score"> / {maxScore}</span>}</td>
                        <td>{renderChange(row.thayDoiDiem)}</td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Không tìm thấy kết quả phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default SingleUnitView;
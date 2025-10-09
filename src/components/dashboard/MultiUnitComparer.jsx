// src/components/dashboard/MultiUnitComparer.jsx

import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { findColumnName } from '../../utils';
import { HIDDEN_INDICATORS } from '../../constants';
import CrossUnitComparisonChart from '../CrossUnitComparisonChart';
import CrossUnitComparisonTable from '../CrossUnitComparisonTable';

const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    borderColor: '#ccc',
    boxShadow: 'none',
    '&:hover': { borderColor: '#007bff' },
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 5
  })
};

const MultiUnitComparer = ({ selectedDate }) => {
  const { allData, units } = useSelector((state) => state.data);

  const [showComparer, setShowComparer] = useState(false);
  const [comparisonUnits, setComparisonUnits] = useState([]);
  const [selectedIndicators, setSelectedIndicators] = useState([]);

  const handleUnitChange = (e) => {
    const { value, checked } = e.target;
    setComparisonUnits((prev) =>
      checked ? [...prev, value] : prev.filter((unit) => unit !== value)
    );
  };

  // --- HÀM MỚI ĐỂ BỎ CHỌN TẤT CẢ ĐƠN VỊ ---
  const handleClearAllUnits = () => {
    setComparisonUnits([]);
  };

  const crossUnitComparisonData = useMemo(() => {
    if (comparisonUnits.length < 2 || !selectedDate || !allData[selectedDate]) {
      return { headers: [], data: {}, allIndicators: [] };
    }
    
    const dataForDate = allData[selectedDate];
    const headers = Object.keys(dataForDate[0] || {});
    const unitCol = findColumnName(headers, ['don vi', 'tendonvi', 'ten']);
    const indicatorCol = findColumnName(headers, ['chi so', 'description']);
    const scoreCol = findColumnName(headers, ['diem danh gia', 'score']);
    const groupCol = findColumnName(headers, ['nhom chi tieu']);
    if (!unitCol || !indicatorCol || !scoreCol) return { headers: [], data: {}, allIndicators: [] };

    const dataByIndicator = {};
    dataForDate.forEach(row => {
        if (comparisonUnits.includes(row[unitCol])) {
            const indicator = row[indicatorCol];
            if (!indicator) return;
            if (!dataByIndicator[indicator]) dataByIndicator[indicator] = {};
            dataByIndicator[indicator][row[unitCol]] = {
                score: parseFloat(String(row[scoreCol] || '0').replace(',', '.')) || 0,
                group: row[groupCol] || 'Chưa phân loại'
            };
        }
    });

    const tableData = Object.keys(dataByIndicator)
      .map(indicator => {
          const row = { 'CHỈ SỐ': indicator };
          let groupName = 'Chưa phân loại';
          comparisonUnits.forEach(unit => {
              const unitData = dataByIndicator[indicator]?.[unit];
              row[unit] = unitData?.score;
              if (unitData?.group) groupName = unitData.group;
          });
          row['NHÓM CHỈ TIÊU'] = groupName;
          return row;
      })
      .filter(row => !HIDDEN_INDICATORS.includes(row['CHỈ SỐ']));

    const groupedData = tableData.reduce((acc, row) => {
      const group = row['NHÓM CHỈ TIÊU'];
      if (!acc[group]) acc[group] = [];
      acc[group].push(row);
      return acc;
    }, {});
    
    const allIndicators = (groupedData['Tổng hợp'] || []).map(item => item['CHỈ SỐ']);

    return {
        headers: ['CHỈ SỐ', ...comparisonUnits],
        data: groupedData,
        allIndicators 
    };
  }, [comparisonUnits, selectedDate, allData]);
  
  const indicatorOptions = useMemo(() => 
    crossUnitComparisonData.allIndicators?.map(name => ({ value: name, label: name })) || [], 
  [crossUnitComparisonData.allIndicators]);

  const handleViewFullScreen = () => {
    const { headers, data } = crossUnitComparisonData;
    if (headers.length <= 1) return;
    const currentStyles = Array.from(document.styleSheets).map(sheet => { try { return Array.from(sheet.cssRules).map(rule => rule.cssText).join(''); } catch (e) { return ''; } }).join('\n');
    const tableHeader = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
    const tableBody = `<tbody>${Object.entries(data).map(([groupName, rows]) => `<tr class="group-header-row"><td colspan="${headers.length}">${groupName}</td></tr>` + rows.map(row => `<tr>${headers.map(header => `<td>${header === 'CHỈ SỐ' ? row[header] : (typeof row[header] === 'number' ? row[header].toFixed(2) : '–')}</td>`).join('')}</tr>`).join('')).join('')}</tbody>`;
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`<html><head><title>Bảng so sánh chi tiết - ${selectedDate}</title><style>body { font-family: 'Segoe UI', sans-serif; padding: 2rem; background-color: #f0f2f5; } h1 { color: #0056b3; } ${currentStyles} td:first-child { position: static; } .table-container { box-shadow: none; }</style></head><body><h1>Bảng so sánh điểm giữa các đơn vị</h1><p>Dữ liệu tại ngày: <strong>${selectedDate}</strong></p><div class="card table-container"><table>${tableHeader}${tableBody}</table></div></body></html>`);
    newWindow.document.close();
  };


  return (
    <div className="card">
      <button className="accordion-button" onClick={() => setShowComparer(!showComparer)}>
        <span className="accordion-icon">{showComparer ? '➖' : '➕'}</span>
        So sánh với các đơn vị khác
      </button>
      {showComparer && (
        <div className="accordion-content">
          {/* --- BỌC PHẦN MÔ TẢ VÀ NÚT BẤM VÀO 1 DIV --- */}
          <div className="unit-selection-header">
            <p>Chọn hai hoặc nhiều đơn vị để so sánh điểm tại ngày <strong>{selectedDate}</strong>.</p>
            {/* --- THÊM NÚT BỎ CHỌN, CHỈ HIỂN THỊ KHI CÓ LỰA CHỌN --- */}
            {comparisonUnits.length > 0 && (
              <button onClick={handleClearAllUnits} className="clear-selection-button">
                Bỏ chọn tất cả
              </button>
            )}
          </div>

          <div className="checkbox-container">
            {units.map((unit) => (
              <div key={unit} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`compare-${unit}`}
                  value={unit}
                  checked={comparisonUnits.includes(unit)}
                  onChange={handleUnitChange}
                />
                <label htmlFor={`compare-${unit}`}>{unit}</label>
              </div>
            ))}
          </div>

          {comparisonUnits.length >= 2 && (
            <>
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Lọc chỉ số trên biểu đồ
                </label>
                <Select
                  isMulti
                  options={indicatorOptions}
                  value={selectedIndicators}
                  onChange={setSelectedIndicators}
                  placeholder="-- Chọn chỉ số để hiển thị (mặc định là tất cả) --"
                  noOptionsMessage={() => "Không có chỉ số nào"}
                  styles={customSelectStyles}
                />
              </div>

              <CrossUnitComparisonChart 
                comparisonData={crossUnitComparisonData} 
                selectedIndicators={selectedIndicators.map(opt => opt.value)}
              />
              <CrossUnitComparisonTable
                comparisonData={crossUnitComparisonData}
                selectedDate={selectedDate}
                onViewFullScreen={handleViewFullScreen}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiUnitComparer;
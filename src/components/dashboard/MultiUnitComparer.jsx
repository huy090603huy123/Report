import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { findColumnName } from '../../utils';
import { HIDDEN_INDICATORS } from '../../constants'; // <-- BƯỚC 1: IMPORT
import CrossUnitComparisonChart from '../CrossUnitComparisonChart';
import CrossUnitComparisonTable from '../CrossUnitComparisonTable';

const MultiUnitComparer = ({ selectedDate }) => {
  const { allData, units } = useSelector((state) => state.data);

  const [showComparer, setShowComparer] = useState(false);
  const [comparisonUnits, setComparisonUnits] = useState([]);

  const handleUnitChange = (e) => {
    const { value, checked } = e.target;
    setComparisonUnits((prev) =>
      checked ? [...prev, value] : prev.filter((unit) => unit !== value)
    );
  };

  const crossUnitComparisonData = useMemo(() => {
    if (comparisonUnits.length < 2 || !selectedDate || !allData[selectedDate]) {
      return { headers: [], data: {} };
    }
    
    const dataForDate = allData[selectedDate];
    const headers = Object.keys(dataForDate[0] || {});
    const unitCol = findColumnName(headers, ['don vi', 'tendonvi', 'ten']);
    const indicatorCol = findColumnName(headers, ['chi so', 'description']);
    const scoreCol = findColumnName(headers, ['diem danh gia', 'score']);
    const groupCol = findColumnName(headers, ['nhom chi tieu']);
    if (!unitCol || !indicatorCol || !scoreCol) return { headers: [], data: {} };

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
      // <-- BƯỚC 2: THÊM BỘ LỌC TẠI ĐÂY
      .filter(row => !HIDDEN_INDICATORS.includes(row['CHỈ SỐ']));

    const groupedData = tableData.reduce((acc, row) => {
      const group = row['NHÓM CHỈ TIÊU'];
      if (!acc[group]) acc[group] = [];
      acc[group].push(row);
      return acc;
    }, {});

    return {
        headers: ['CHỈ SỐ', ...comparisonUnits],
        data: groupedData
    };
  }, [comparisonUnits, selectedDate, allData]);

  // ... (phần còn lại của file giữ nguyên)
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
          <p>Chọn hai hoặc nhiều đơn vị để so sánh điểm tại ngày <strong>{selectedDate}</strong>.</p>
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
              <CrossUnitComparisonChart comparisonData={crossUnitComparisonData} />
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
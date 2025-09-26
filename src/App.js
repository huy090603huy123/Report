import React, { useState, useEffect, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Import services, utils, constants
import { findColumnName, normalizeString } from './utils';
import { MAX_SCORES, HIDDEN_INDICATORS } from './constants';
import { useSheetData } from './hooks/useSheetData';

// Import Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Controls from './components/controls/Controls';
import ComparisonChart from './components/ComparisonChart';
import CrossUnitComparisonTable from './components/CrossUnitComparisonTable';
import CrossUnitComparisonChart from './components/CrossUnitComparisonChart';
import AddDataForm from './components/AddDataForm';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  // --- CUSTOM HOOK ĐỂ QUẢN LÝ DỮ LIỆU ---
  const { sheetsConfig, allData, units, loading, status, error } = useSheetData();

  // --- STATE QUẢN LÝ GIAO DIỆN ---
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedOldDate, setSelectedOldDate] = useState('');
  const [selectedNewDate, setSelectedNewDate] = useState('');
  const [showAddDataForm, setShowAddDataForm] = useState(false);
  const [comparisonUnits, setComparisonUnits] = useState([]);
  const [showCrossUnitComparer, setShowCrossUnitComparer] = useState(false);
  
  // --- CẬP NHẬT NGÀY MẶC ĐỊNH SAU KHI TẢI XONG CẤU HÌNH ---
  useEffect(() => {
    if (sheetsConfig && sheetsConfig.length > 1) {
      setSelectedNewDate(sheetsConfig[0].name);
      setSelectedOldDate(sheetsConfig[1].name);
    } else if (sheetsConfig && sheetsConfig.length > 0) {
      setSelectedNewDate(sheetsConfig[0].name);
    }
  }, [sheetsConfig]);

  // --- COMPUTED DATA (MEMOIZED) ---
  const unitOptions = useMemo(() => units.map(unit => ({ value: unit, label: unit })), [units]);

  const comparisonData = useMemo(() => {
    if (!selectedUnit || !selectedOldDate || !selectedNewDate || Object.keys(allData).length === 0) return [];
    
    const unitValue = selectedUnit.value;
    const dataNew = allData[selectedNewDate];
    const dataOld = allData[selectedOldDate];
    if (!dataNew || !dataOld) return [];

    const headersNew = Object.keys(dataNew[0] || {}), headersOld = Object.keys(dataOld[0] || {});
    const unitColNew = findColumnName(headersNew, ['don vi', 'tendonvi', 'ten']);
    const indicatorColNew = findColumnName(headersNew, ['chi so', 'description']);
    const percentColNew = findColumnName(headersNew, ['ty le %', 'ty le']);
    const scoreColNew = findColumnName(headersNew, ['diem danh gia', 'score']);
    const groupColNew = findColumnName(headersNew, ['nhom chi tieu']);
    const unitColOld = findColumnName(headersOld, ['don vi', 'tendonvi', 'ten']);
    const indicatorColOld = findColumnName(headersOld, ['chi so', 'description']);
    const percentColOld = findColumnName(headersOld, ['ty le %', 'ty le']);
    const scoreColOld = findColumnName(headersOld, ['diem danh gia', 'score']);

    if (!unitColNew || !indicatorColNew || !unitColOld || !indicatorColOld) return [];
    
    const filteredDataNew = dataNew.filter(row => row[unitColNew] === unitValue);
    const filteredDataOld = dataOld.filter(row => row[unitColOld] === unitValue);
    const mapOld = new Map(filteredDataOld.map(row => [normalizeString(row[indicatorColOld]), row]));
    
    return filteredDataNew.map((rowNew) => {
      const rowOld = mapOld.get(normalizeString(rowNew[indicatorColNew])) || {};
      const tyLeNew = parseFloat(String(rowNew[percentColNew] || '0').replace(',', '.')) || 0;
      const tyLeOld = parseFloat(String(rowOld[percentColOld] || '0').replace(',', '.')) || 0;
      const diemNew = parseFloat(String(rowNew[scoreColNew] || '0').replace(',', '.')) || 0;
      const diemOld = parseFloat(String(rowOld[scoreColOld] || '0').replace(',', '.')) || 0;
      return {
        'NHÓM CHỈ TIÊU': rowNew[groupColNew] || 'Chưa phân loại',
        'CHỈ SỐ': rowNew[indicatorColNew],
        tyLeNew, tyLeOld, thayDoiTyLe: tyLeNew - tyLeOld,
        diemNew, diemOld, thayDoiDiem: diemNew - diemOld,
      };
    });
  }, [selectedUnit, selectedOldDate, selectedNewDate, allData]);

  const groupedComparisonData = useMemo(() => {
    const filteredData = comparisonData.filter(
      row => !HIDDEN_INDICATORS.includes(row['CHỈ SỐ'])
    );
    return filteredData.reduce((acc, row) => {
      const groupName = row['NHÓM CHỈ TIÊU'];
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(row);
      return acc;
    }, {});
  }, [comparisonData]);

  const crossUnitComparison = useMemo(() => {
    if (comparisonUnits.length < 2 || !selectedNewDate || !allData[selectedNewDate]) {
        return { headers: [], data: {} };
    }
    const dataForDate = allData[selectedNewDate];
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

    const tableData = Object.keys(dataByIndicator).map(indicator => {
        const row = { 'CHỈ SỐ': indicator };
        let groupName = 'Chưa phân loại';
        comparisonUnits.forEach(unit => {
            const unitData = dataByIndicator[indicator]?.[unit];
            row[unit] = unitData?.score;
            if (unitData?.group) groupName = unitData.group;
        });
        row['NHÓM CHỈ TIÊU'] = groupName;
        return row;
    });

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
  }, [comparisonUnits, selectedNewDate, allData]);

  // --- EVENT HANDLERS ---
  const handleComparisonUnitChange = (e) => {
    const { value, checked } = e.target;
    setComparisonUnits(prev =>
      checked ? [...prev, value] : prev.filter(unit => unit !== value)
    );
  };
  
  const handleViewFullScreenComparison = () => {
    const { headers, data } = crossUnitComparison;
    if (headers.length <= 1) return;
    const currentStyles = Array.from(document.styleSheets).map(sheet => { try { return Array.from(sheet.cssRules).map(rule => rule.cssText).join(''); } catch (e) { return ''; } }).join('\n');
    const tableHeader = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
    const tableBody = `<tbody>${Object.entries(data).map(([groupName, rows]) => `<tr class="group-header-row"><td colspan="${headers.length}">${groupName}</td></tr>` + rows.map(row => `<tr>${headers.map(header => `<td>${header === 'CHỈ SỐ' ? row[header] : (typeof row[header] === 'number' ? row[header].toFixed(2) : '–')}</td>`).join('')}</tr>`).join('')).join('')}</tbody>`;
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`<html><head><title>Bảng so sánh chi tiết - ${selectedNewDate}</title><style>body { font-family: 'Segoe UI', sans-serif; padding: 2rem; background-color: #f0f2f5; } h1 { color: #0056b3; } ${currentStyles} td:first-child { position: static; } .table-container { box-shadow: none; }</style></head><body><h1>Bảng so sánh điểm giữa các đơn vị</h1><p>Dữ liệu tại ngày: <strong>${selectedNewDate}</strong></p><div class="card table-container"><table>${tableHeader}${tableBody}</table></div></body></html>`);
    newWindow.document.close();
  };

  const renderChange = (change) => {
    if (isNaN(change)) return <span>N/A</span>;
    if (change === 0) return <span className="change-neutral">0.00</span>;
    const isPositive = change > 0;
    return (<span className={isPositive ? 'change-positive' : 'change-negative'}>{isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}</span>);
  };
  
  // --- RENDER LOGIC ---
  if (loading) return <div className="container"><p className="status-message">{status}</p></div>;
  if (error) return <div className="container"><p className="status-message error">{error}</p></div>;

  return (
    <div className="container">
      {showAddDataForm && <AddDataForm onClose={() => setShowAddDataForm(false)} />}
      
      <Header onAddDataClick={() => setShowAddDataForm(true)} />
      
      <main>
        <Controls
            sheetsConfig={sheetsConfig}
            unitOptions={unitOptions}
            selectedUnit={selectedUnit}
            onUnitChange={setSelectedUnit}
            oldDate={selectedOldDate}
            onOldDateChange={(e) => setSelectedOldDate(e.target.value)}
            newDate={selectedNewDate}
            onNewDateChange={(e) => setSelectedNewDate(e.target.value)}
        />
        
        {selectedUnit ? (
          <>
            <div className="card chart-container">
                <ComparisonChart data={comparisonData} unitName={selectedUnit.label} />
            </div>

            <div className="card table-container">
              <h3>Bảng so sánh chi tiết: <strong>{selectedUnit.label}</strong></h3>
              <p>So sánh giữa ngày <strong>{selectedNewDate}</strong> và ngày <strong>{selectedOldDate}</strong></p>
              <table>
                <thead>
                  <tr>
                    <th rowSpan="2">CHỈ SỐ</th> <th colSpan="3">TỶ LỆ %</th> <th colSpan="3">ĐIỂM ĐÁNH GIÁ</th>
                  </tr>
                  <tr>
                    <th>Ngày cũ ({selectedOldDate})</th><th>Ngày mới ({selectedNewDate})</th><th>Thay đổi</th>
                    <th>Ngày cũ ({selectedOldDate})</th><th>Ngày mới ({selectedNewDate})</th><th>Thay đổi</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedComparisonData).map(([groupName, rows]) => (
                    <React.Fragment key={groupName}>
                      <tr className="group-header-row"><td colSpan="7">{groupName}</td></tr>
                      {rows.map((row, index) => {
                          const normalizedIndicator = normalizeString(row['CHỈ SỐ']);
                          const maxScore = MAX_SCORES[normalizedIndicator];
                          return(
                            <tr key={index}>
                              <td><div className="indicator-name">{row['CHỈ SỐ']}</div></td>
                              <td>{row.tyLeOld.toFixed(2)}</td><td>{row.tyLeNew.toFixed(2)}</td>
                              <td>{renderChange(row.thayDoiTyLe)}</td>
                              <td>{row.diemOld.toFixed(2)}{maxScore && <span className="max-score"> / {maxScore}</span>}</td>
                              <td>{row.diemNew.toFixed(2)}{maxScore && <span className="max-score"> / {maxScore}</span>}</td>
                              <td>{renderChange(row.thayDoiDiem)}</td>
                            </tr>
                          )
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
                  <button className="accordion-button" onClick={() => setShowCrossUnitComparer(!showCrossUnitComparer)}>
                    <span className="accordion-icon">{showCrossUnitComparer ? '➖' : '➕'}</span>
                    So sánh với các đơn vị khác
                  </button>
                  {showCrossUnitComparer && (
                    <div className="accordion-content">
                        <p>Chọn hai hoặc nhiều đơn vị để so sánh điểm tại ngày <strong>{selectedNewDate}</strong>.</p>
                        <div className="checkbox-container">
                            {units.map(unit => (
                            <div key={unit} className="checkbox-item">
                                <input type="checkbox" id={`compare-${unit}`} value={unit} checked={comparisonUnits.includes(unit)} onChange={handleComparisonUnitChange} />
                                <label htmlFor={`compare-${unit}`}>{unit}</label>
                            </div>
                            ))}
                        </div>

                        {comparisonUnits.length >= 2 && (
                          <>
                              <CrossUnitComparisonChart comparisonData={crossUnitComparison} />
                              <CrossUnitComparisonTable 
                                  comparisonData={crossUnitComparison} 
                                  selectedDate={selectedNewDate}
                                  onViewFullScreen={handleViewFullScreenComparison}
                              />
                          </>
                        )}
                    </div>
                  )}
            </div>
          </>
        ) : <p className="status-message">Vui lòng chọn một đơn vị để xem dữ liệu.</p>}
      </main>

      <Footer />
    </div>
  );
}

export default App;


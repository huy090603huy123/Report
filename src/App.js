import React, { useState, useEffect, useMemo } from 'react';
// --- THÊM IMPORT MỚI TỪ REACT-SELECT ---
import Select from 'react-select'; 
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Import services, utils, constants
import { fetchSheetsConfig, fetchSheetData } from './services/sheetService';
import { findColumnName, normalizeString } from './utils';
import { MAX_SCORES } from './constants';

// Import Components
import ComparisonChart from './components/ComparisonChart';
import CrossUnitComparisonTable from './components/CrossUnitComparisonTable';
import CrossUnitComparisonChart from './components/CrossUnitComparisonChart';
import AddDataForm from './components/AddDataForm';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- STYLE TÙY CHỈNH CHO REACT-SELECT ---
const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: '48px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '1rem',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#007bff',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#f1f8ff' : null,
    color: state.isSelected ? 'white' : 'black',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#888',
  }),
};


function App() {
  // --- STATE MANAGEMENT ---
  const [sheetsConfig, setSheetsConfig] = useState([]);
  const [allData, setAllData] = useState({});
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null); // Thay đổi thành null
  const [selectedOldDate, setSelectedOldDate] = useState('');
  const [selectedNewDate, setSelectedNewDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Đang khởi tạo...');
  const [error, setError] = useState(null);
  const [showAddDataForm, setShowAddDataForm] = useState(false);
  
  // State cho việc so sánh nhiều đơn vị
  const [comparisonUnits, setComparisonUnits] = useState([]);
  const [showCrossUnitComparer, setShowCrossUnitComparer] = useState(false);
  
  // --- DATA FETCHING ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setStatus('Đang tải cấu hình...');
        const config = await fetchSheetsConfig();
        setSheetsConfig(config);
        if (config && config.length > 1) {
            setSelectedNewDate(config[0].name);
            setSelectedOldDate(config[1].name);
        } else if (config && config.length > 0) {
            setSelectedNewDate(config[0].name);
        }

        setStatus('Đang tải dữ liệu báo cáo...');
        const results = await Promise.all(config.map(sheet => fetchSheetData(sheet)));
        
        const dataBySheet = {};
        results.forEach(sheet => { dataBySheet[sheet.name] = sheet.data; });
        setAllData(dataBySheet);

        const latestData = dataBySheet[config[0].name];
        if (latestData && latestData.length > 0) {
          const headers = Object.keys(latestData[0]);
          const unitColumnName = findColumnName(headers, ['don vi', 'tendonvi', 'ten']);
          if (unitColumnName) {
            const uniqueUnits = [...new Set(latestData.map(item => item[unitColumnName]).filter(Boolean))];
            setUnits(uniqueUnits.sort());
          } else {
            throw new Error("Không tìm thấy cột 'Đơn vị' trong sheet mới nhất.");
          }
        }
      } catch (err) {
        setError(`Lỗi: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // --- COMPUTED DATA (MEMOIZED) ---
  const unitOptions = useMemo(() => {
    return units.map(unit => ({ value: unit, label: unit }));
  }, [units]);

  const comparisonData = useMemo(() => {
    if (!selectedUnit || !selectedOldDate || !selectedNewDate || Object.keys(allData).length === 0) return [];
    
    const unitValue = selectedUnit.value; // Lấy giá trị từ object
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
    return comparisonData.reduce((acc, row) => {
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

    const currentStyles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules)
            .map(rule => rule.cssText)
            .join('');
        } catch (e) {
          return '';
        }
      })
      .join('\n');
    
    const tableHeader = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
    const tableBody = `<tbody>${Object.entries(data).map(([groupName, rows]) => 
        `<tr class="group-header-row"><td colspan="${headers.length}">${groupName}</td></tr>` +
        rows.map(row => `<tr>${headers.map(header => `
            <td>${header === 'CHỈ SỐ' ? row[header] : (typeof row[header] === 'number' ? row[header].toFixed(2) : '–')}</td>
        `).join('')}</tr>`).join('')
    ).join('')}</tbody>`;

    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head>
          <title>Bảng so sánh chi tiết - ${selectedNewDate}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 2rem; background-color: #f0f2f5; }
            h1 { color: #0056b3; }
            ${currentStyles} 
            td:first-child { position: static; }
            .table-container { box-shadow: none; }
          </style>
        </head>
        <body>
          <h1>Bảng so sánh điểm giữa các đơn vị</h1>
          <p>Dữ liệu tại ngày: <strong>${selectedNewDate}</strong></p>
          <div class="card table-container">
            <table>${tableHeader}${tableBody}</table>
          </div>
        </body>
      </html>
    `);
    newWindow.document.close();
  };

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
  
  // --- RENDER LOGIC ---
  if (loading) return <div className="container"><p className="status-message">{status}</p></div>;
  if (error) return <div className="container"><p className="status-message error">{error}</p></div>;

  return (
    <div className="container">
      {showAddDataForm && <AddDataForm onClose={() => setShowAddDataForm(false)} />}
      
      <header className="app-header">
        <h1>📊 Bảng điều khiển So sánh & Theo dõi Dữ liệu</h1>
        <button className="header-action-button" onClick={() => setShowAddDataForm(true)}>
          <span className="icon-plus"></span>
          Thêm dữ liệu mới
        </button>
      </header>
      
      <div className="card controls-grid">
        <div className="control-group">
          <label htmlFor="unit-select">1. Chọn Đơn vị</label>
          
          {/* --- THAY THẾ DROPDOWN CŨ BẰNG REACT-SELECT --- */}
          <Select
            id="unit-select"
            options={unitOptions}
            value={selectedUnit}
            onChange={setSelectedUnit}
            placeholder="-- Vui lòng chọn hoặc nhập để tìm kiếm --"
            isSearchable
            noOptionsMessage={() => "Không tìm thấy đơn vị"}
            styles={customSelectStyles}
          />

        </div>
        <div className="control-group">
          <label htmlFor="old-date-select">2. So sánh với Ngày (Cũ hơn)</label>
          <select id="old-date-select" value={selectedOldDate} onChange={(e) => setSelectedOldDate(e.target.value)} disabled={!selectedUnit}>
            {sheetsConfig.map(sheet => <option key={`${sheet.gid}-old`} value={sheet.name}>{sheet.name}</option>)}
          </select>
        </div>
        <div className="control-group">
          <label htmlFor="new-date-select">3. Chọn Ngày (Mới hơn)</label>
          <select id="new-date-select" value={selectedNewDate} onChange={(e) => setSelectedNewDate(e.target.value)} disabled={!selectedUnit}>
            {sheetsConfig.map(sheet => <option key={`${sheet.gid}-new`} value={sheet.name}>{sheet.name}</option>)}
          </select>
        </div>
      </div>
      
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
                            <td>
                              {row.diemOld.toFixed(2)}
                              {maxScore && <span className="max-score"> / {maxScore}</span>}
                            </td>
                            <td>
                              {row.diemNew.toFixed(2)}
                              {maxScore && <span className="max-score"> / {maxScore}</span>}
                            </td>
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
                              <input
                              type="checkbox"
                              id={`compare-${unit}`}
                              value={unit}
                              checked={comparisonUnits.includes(unit)}
                              onChange={handleComparisonUnitChange}
                              />
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
    </div>
  );
}

export default App;
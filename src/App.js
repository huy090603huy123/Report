import React, { useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- PHẦN CẤU HÌNH ---
const SPREADSHEET_ID = '1raMJ39PQ898AW1m9hBgTkyXi9dL7wXG0';
const CONFIG_SHEET_GID = '750537527';

// --- HÀM TIỆN ÍCH ---
const findColumnName = (headers, possibleNames) => {
  for (const name of possibleNames) {
    const found = headers.find(h => 
        h.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d") === name
    );
    if (found) return found;
  }
  return null;
};

const normalizeString = (str) => {
    if (typeof str !== 'string') return '';
    // Chuẩn hóa chuỗi: bỏ dấu, chuyển thành chữ thường để so sánh
    return str.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
};

// --- Component Biểu đồ ---
const ComparisonChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    const chartData = {
      labels: data.map(item => item['CHỈ SỐ']),
      datasets: [ {
          label: 'Thay đổi Điểm đánh giá',
          data: data.map(item => item.thayDoiDiem),
          backgroundColor: data.map(item => item.thayDoiDiem >= 0 ? 'rgba(40, 167, 69, 0.7)' : 'rgba(220, 53, 69, 0.7)'),
          borderColor: data.map(item => item.thayDoiDiem >= 0 ? 'rgba(40, 167, 69, 1)' : 'rgba(220, 53, 69, 1)'),
          borderWidth: 1,
      } ],
    };
    const options = {
      indexAxis: 'y', responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Biểu đồ so sánh mức độ thay đổi Điểm đánh giá' },
        tooltip: { callbacks: { label: context => `${context.dataset.label}: ${context.raw.toFixed(2)}` } }
      },
      scales: {
          x: { ticks: { font: { size: 10 } }, title: { display: true, text: 'Mức độ thay đổi' } },
          y: { ticks: { font: { size: 10 } } }
      }
    };
    return <Bar options={options} data={chartData} />;
};


function App() {
  const [sheetsConfig, setSheetsConfig] = useState([]);
  const [allData, setAllData] = useState({});
  const [comparisonData, setComparisonData] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedOldDate, setSelectedOldDate] = useState(''); 
  const [selectedNewDate, setSelectedNewDate] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Đang khởi tạo...');
  const [error, setError] = useState(null);

  // MỚI: Cấu hình điểm tối đa cho các chỉ số
  const MAX_SCORES = useMemo(() => ({
    'diem cong khai minh bach': 18,
    'diem dich vu truc tuyen': 22, // Tổng điểm từ DVC TT (12) và Thanh toán TT (10)
    'diem muc do hai long': 18,
    'diem so hoa ho so': 22,
  }), []);

  useEffect(() => {
    const configUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${CONFIG_SHEET_GID}`;
    setStatus('Đang tải cấu hình...');
    fetch(configUrl)
      .then(res => res.text()).then(text => {
        const rawJson = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
        if (!rawJson || !rawJson[1]) throw new Error("Lỗi `_config`.");
        const jsonData = JSON.parse(rawJson[1]);
        const headers = jsonData.table.cols.map(col => col.label);
        const rows = jsonData.table.rows.map(row => {
          const rowData = {};
          row.c.forEach((cell, index) => { rowData[headers[index]] = cell ? cell.v : null; });
          return { name: rowData['TEN_SHEET'], gid: String(rowData['GID']) };
        });
        if (rows.length < 2) throw new Error("Sheet `_config` cần ít nhất 2 dòng.");
        setSheetsConfig(rows);
        setSelectedNewDate(rows[0].name);
        setSelectedOldDate(rows[1].name);
      })
      .catch(err => { setError(`Không thể tải cấu hình: ${err.message}`); setLoading(false); });
  }, []);

  useEffect(() => {
    if (sheetsConfig.length === 0) return;
    setStatus('Đang tải dữ liệu báo cáo...');
    const fetchSheetData = (sheet) => {
      const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${sheet.gid}`;
      return fetch(url).then(res => res.text()).then(text => {
        const rawJson = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
        if (!rawJson || !rawJson[1]) throw new Error(`Lỗi JSON ở sheet ${sheet.name}`);
        const jsonData = JSON.parse(rawJson[1]);
        const headers = jsonData.table.cols.map(col => col.label).filter(Boolean);
        const rows = jsonData.table.rows.map(row => {
          const rowData = {};
          row.c.forEach((cell, index) => { if (headers[index]) rowData[headers[index]] = cell ? cell.v : null; });
          return rowData;
        });
        return { name: sheet.name, data: rows };
      });
    };
    Promise.all(sheetsConfig.map(fetchSheetData))
      .then(results => {
        const dataBySheet = {};
        results.forEach(sheet => { dataBySheet[sheet.name] = sheet.data; });
        setAllData(dataBySheet);
        const latestData = dataBySheet[sheetsConfig[0].name];
        if (latestData && latestData.length > 0) {
            const headers = Object.keys(latestData[0]);
            const unitColumnName = findColumnName(headers, ['don vi', 'tendonvi', 'ten']);
            if (unitColumnName) {
                const uniqueUnits = [...new Set(latestData.map(item => item[unitColumnName]).filter(Boolean))];
                setUnits(uniqueUnits.sort());
            } else { throw new Error("Không tìm thấy cột 'Đơn vị' trong sheet mới nhất."); }
        }
      })
      .catch(err => setError(`Lỗi xử lý dữ liệu: ${err.message}`))
      .finally(() => setLoading(false));
  }, [sheetsConfig]);

  useEffect(() => {
    if (!selectedUnit || !selectedOldDate || !selectedNewDate || Object.keys(allData).length === 0) {
      setComparisonData([]); return;
    }
    const dataNew = allData[selectedNewDate], dataOld = allData[selectedOldDate];
    if (!dataNew || !dataOld || dataNew.length === 0 || dataOld.length === 0) return;

    const headersNew = Object.keys(dataNew[0]), headersOld = Object.keys(dataOld[0]);
    const unitColNew = findColumnName(headersNew, ['don vi', 'tendonvi', 'ten']);
    const indicatorColNew = findColumnName(headersNew, ['chi so', 'description']);
    const percentColNew = findColumnName(headersNew, ['ty le %', 'ty le']);
    const scoreColNew = findColumnName(headersNew, ['diem danh gia', 'score']);
    const groupColNew = findColumnName(headersNew, ['nhom chi tieu']);
    const unitColOld = findColumnName(headersOld, ['don vi', 'tendonvi', 'ten']);
    const indicatorColOld = findColumnName(headersOld, ['chi so', 'description']);
    const percentColOld = findColumnName(headersOld, ['ty le %', 'ty le']);
    const scoreColOld = findColumnName(headersOld, ['diem danh gia', 'score']);

    if (!unitColNew || !indicatorColNew || !unitColOld || !indicatorColOld) return;
    
    const filteredDataNew = dataNew.filter(row => row[unitColNew] === selectedUnit);
    const filteredDataOld = dataOld.filter(row => row[unitColOld] === selectedUnit);
    const mapOld = new Map(filteredDataOld.map(row => [normalizeString(row[indicatorColOld]), row]));
    
    const compared = filteredDataNew.map((rowNew) => {
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
    setComparisonData(compared);
  }, [selectedUnit, selectedOldDate, selectedNewDate, allData, MAX_SCORES]);

  const groupedComparisonData = useMemo(() => {
    if (comparisonData.length === 0) return {};
    return comparisonData.reduce((acc, row) => {
      const groupName = row['NHÓM CHỈ TIÊU'];
      if (!acc[groupName]) { acc[groupName] = []; }
      acc[groupName].push(row);
      return acc;
    }, {});
  }, [comparisonData]);

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
  
  if (loading) return <div className="container"><p className="status-message">{status}</p></div>;
  if (error) return <div className="container"><p className="status-message error">{error}</p></div>;

  return (
    <div className="container">
      <header className="app-header"><h1>📊 Bảng điều khiển So sánh & Theo dõi Dữ liệu</h1></header>
      <div className="card controls-grid">
        <div className="control-group">
          <label htmlFor="unit-select">1. Chọn Đơn vị</label>
          <select id="unit-select" value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}>
            <option value="">-- Vui lòng chọn --</option>
            {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
          </select>
        </div>
        <div className="control-group">
          <label htmlFor="old-date-select">2. So sánh với Ngày (Cũ hơn)</label>
          <select id="old-date-select" value={selectedOldDate} onChange={(e) => setSelectedOldDate(e.target.value)}>
            {sheetsConfig.map(sheet => <option key={`${sheet.gid}-old`} value={sheet.name}>{sheet.name}</option>)}
          </select>
        </div>
        <div className="control-group">
          <label htmlFor="new-date-select">3. Chọn Ngày (Mới hơn)</label>
          <select id="new-date-select" value={selectedNewDate} onChange={(e) => setSelectedNewDate(e.target.value)}>
            {sheetsConfig.map(sheet => <option key={`${sheet.gid}-new`} value={sheet.name}>{sheet.name}</option>)}
          </select>
        </div>
      </div>
      {selectedUnit ? (
        <>
          <div className="card chart-container"><h3>Biểu đồ thay đổi điểm</h3><ComparisonChart data={comparisonData} /></div>
          <div className="card table-container">
            <h3>Bảng so sánh chi tiết: <strong>{selectedUnit}</strong></h3>
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
                       // CẬP NHẬT: Lấy điểm tối đa dựa trên tên chỉ số đã chuẩn hóa
                       const normalizedIndicator = normalizeString(row['CHỈ SỐ']);
                       const maxScore = MAX_SCORES[normalizedIndicator];
                       return(
                        <tr key={index}>
                          <td><div className="indicator-name">{row['CHỈ SỐ']}</div></td>
                          <td>{row.tyLeOld.toFixed(2)}</td><td>{row.tyLeNew.toFixed(2)}</td>
                          <td>{renderChange(row.thayDoiTyLe)}</td>
                          
                          {/* CẬP NHẬT: Hiển thị điểm tối đa nếu có */}
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
        </>
      ) : <p className="status-message">Vui lòng chọn một đơn vị và hai ngày để bắt đầu so sánh.</p>}
    </div>
  );
}

export default App;
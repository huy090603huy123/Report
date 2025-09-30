import React, { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { findColumnName, normalizeString } from '../../utils';
import { fetchSheet } from '../../store/slices/dataSlice'; // <-- Import action mới
import SingleUnitView from './SingleUnitView';
import MultiUnitComparer from './MultiUnitComparer';

const Dashboard = ({ selectedUnit, oldDate, newDate }) => {
  const dispatch = useDispatch();
  const { allData, sheetsConfig } = useSelector((state) => state.data);

  // useEffect để tải dữ liệu khi ngày được chọn thay đổi
  useEffect(() => {
    const datesToLoad = [oldDate, newDate].filter(Boolean); // Lọc ra các ngày hợp lệ

    datesToLoad.forEach(date => {
      // Nếu dữ liệu cho ngày này chưa có trong store
      if (!allData[date]) {
        // Tìm thông tin sheet (bao gồm gid) từ config
        const sheetInfo = sheetsConfig.find(sheet => sheet.name === date);
        if (sheetInfo) {
          // Dispatch action để tải dữ liệu cho sheet đó
          dispatch(fetchSheet(sheetInfo));
        }
      }
    });
  }, [oldDate, newDate, allData, sheetsConfig, dispatch]);


  // Logic tính toán dữ liệu so sánh (giữ nguyên)
  const comparisonData = useMemo(() => {
    // Thêm điều kiện kiểm tra dữ liệu đã tồn tại chưa
    if (!selectedUnit || !oldDate || !newDate || !allData[oldDate] || !allData[newDate]) {
      return [];
    }
    
    const unitValue = selectedUnit.value;
    const dataNew = allData[newDate];
    const dataOld = allData[oldDate];
    
    // ... (phần còn lại của hàm useMemo giữ nguyên)
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
  }, [selectedUnit, oldDate, newDate, allData]);

  // Hiển thị thông báo nếu dữ liệu đang được tải
  if (!allData[oldDate] || !allData[newDate]) {
      return <div className="card status-message">Đang tải dữ liệu so sánh...</div>;
  }

  return (
    <>
      <SingleUnitView
        comparisonData={comparisonData}
        unitName={selectedUnit.label}
        oldDate={oldDate}
        newDate={newDate}
      />
      <MultiUnitComparer selectedDate={newDate} />
    </>
  );
};

export default Dashboard;
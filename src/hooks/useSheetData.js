import { useState, useEffect } from 'react';
import { fetchSheetsConfig, fetchSheetData } from '../services/sheetService';
import { findColumnName } from '../utils';

export const useSheetData = () => {
    const [sheetsConfig, setSheetsConfig] = useState([]);
    const [allData, setAllData] = useState({});
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('Đang khởi tạo...');
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setStatus('Đang tải cấu hình...');
                const config = await fetchSheetsConfig();
                setSheetsConfig(config);

                setStatus('Đang tải dữ liệu báo cáo...');
                const results = await Promise.all(config.map(sheet => fetchSheetData(sheet)));

                const dataBySheet = {};
                results.forEach(sheet => { dataBySheet[sheet.name] = sheet.data; });
                setAllData(dataBySheet);

                if (config.length > 0) {
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
                }
            } catch (err) {
                setError(`Lỗi: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    return { sheetsConfig, allData, units, loading, status, error };
};
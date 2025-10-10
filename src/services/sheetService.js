import { SPREADSHEET_ID, CONFIG_SHEET_GID } from '../constants';
import { validateSheetData } from '../utils';

// Hàm nội bộ để xử lý chuỗi JSON từ Google Sheets
const parseGoogleSheetResponse = (text, sheetIdentifier) => {
    const rawJson = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
    if (!rawJson || !rawJson[1]) {
        throw new Error(`Lỗi phân tích JSON ở sheet ${sheetIdentifier}`);
    }
    const jsonData = JSON.parse(rawJson[1]);

    // Lấy tất cả các tiêu đề gốc, kể cả các tiêu đề trống
    const originalHeaders = jsonData.table.cols.map(col => col.label);

    const rows = jsonData.table.rows.map(row => {
      const rowData = {};
      if (row.c) {
        row.c.forEach((cell, index) => {
          const header = originalHeaders[index];
          // Chỉ xử lý nếu cột đó có tiêu đề
          if (header) {
            rowData[header] = cell ? (cell.f || cell.v) : null;
          }
        });
      }
      return rowData;
    });

    // Trả về chỉ các hàng đã được xử lý
    return { rows };
};


/**
 * Lấy dữ liệu từ một sheet cụ thể.
 * @param {{name: string, gid: string}} sheet - Object chứa tên và GID của sheet.
 * @returns {Promise<{name: string, data: object[]}>}
 */
export const fetchSheetData = async (sheet) => {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${sheet.gid}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Không thể tải sheet ${sheet.name}`);
    }
    const text = await response.text();
    const { rows } = parseGoogleSheetResponse(text, sheet.name);
    validateSheetData(rows, sheet.name);
    return { name: sheet.name, data: rows };
};

/**
 * Lấy cấu hình các sheet từ sheet `_config`.
 * @returns {Promise<{name: string, gid: string}[]>}
 */
export const fetchSheetsConfig = async () => {
    const configUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${CONFIG_SHEET_GID}`;
    const response = await fetch(configUrl);
     if (!response.ok) {
        throw new Error(`Không thể tải file cấu hình _config.`);
    }
    const text = await response.text();
    const { rows } = parseGoogleSheetResponse(text, '_config');

    // Lọc ra những dòng có đủ cả TEN_SHEET và GID
    const config = rows.map(row => ({
        name: row['TEN_SHEET'],
        gid: row['GID'] != null ? String(row['GID']) : null
    })).filter(row => row.name && row.gid != null);


    if (config.length < 1) {
        throw new Error("Sheet `_config` không chứa bất kỳ dòng cấu hình hợp lệ nào.");
    }

    return config;
};
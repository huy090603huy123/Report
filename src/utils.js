/**
 * Tìm tên cột chính xác trong header dựa trên danh sách các tên có thể có.
 */
export const findColumnName = (headers, possibleNames) => {
  for (const name of possibleNames) {
    const found = headers.find(h => 
        h.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d") === name
    );
    if (found) return found;
  }
  return null;
};

/**
 * Chuẩn hóa chuỗi: chuyển về chữ thường, bỏ dấu, bỏ khoảng trắng thừa.
 */
export const normalizeString = (str) => {
    if (typeof str !== 'string') return '';
    return str.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
};

// --- THÊM HÀM MỚI TẠI ĐÂY ---
/**
 * Kiểm tra dữ liệu từ sheet để đảm bảo có đủ các cột cần thiết.
 * @param {object[]} data - Mảng các dòng dữ liệu từ sheet.
 * @param {string} sheetName - Tên của sheet để hiển thị trong thông báo lỗi.
 */
export const validateSheetData = (data, sheetName) => {
  if (!data || data.length === 0) {
    // Không cần throw lỗi nếu sheet rỗng, chỉ cần bỏ qua
    return;
  }

  const headers = Object.keys(data[0]);

  const requiredColumns = [
    { key: 'unit', names: ['don vi', 'tendonvi', 'ten'], label: 'Đơn vị' },
    { key: 'indicator', names: ['chi so', 'description'], label: 'Chỉ số' },
    { key: 'score', names: ['diem danh gia', 'score'], label: 'Điểm đánh giá' },
    { key: 'group', names: ['nhom chi tieu'], label: 'Nhóm chỉ tiêu' }
  ];

  for (const col of requiredColumns) {
    if (!findColumnName(headers, col.names)) {
      throw new Error(
        `Lỗi dữ liệu: Sheet "${sheetName}" thiếu cột quan trọng: "${col.label}". Vui lòng kiểm tra lại file Google Sheets.`
      );
    }
  }
};

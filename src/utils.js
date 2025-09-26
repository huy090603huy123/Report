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

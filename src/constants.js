// Thay thế SPREADSHEET_ID cũ bằng ID mới từ file Google Sheets của bạn
export const SPREADSHEET_ID = '1dKdIvMNLo2IQbkAA1vdA7KnkmdGxwRqatmnTt2TZNcQ';

// GID của sheet cấu hình (_config) vẫn giữ nguyên
export const CONFIG_SHEET_GID = '750537527';

// Điểm tối đa cho các nhóm chỉ tiêu chính để hiển thị trên bảng
export const MAX_SCORES = {
  'diem cong khai minh bach': 18,
  'diem dich vu truc tuyen': 22,
  'diem muc do hai long': 18,
  'diem so hoa ho so': 22,
};

export const HIDDEN_INDICATORS = [
  'Tỷ lệ phản ánh, kiến nghị theo phân loại',
  'Tỷ lệ tăng trưởng số thủ tục hành chính có giao dịch thanh toán trực tuyến so với kì trước',
  'Tỷ lệ phản ánh, kiến nghị được phân theo địa bàn hành chính, ngành, lĩnh vực',

  'Tỷ lệ tăng trưởng cung cấp dịch vụ công trực tuyến',
  'Tỷ lệ tăng trưởng dịch vụ công trực tuyến có phát sinh hồ sơ',
  'Tỷ lệ thủ tục hành chính được công khai có đầy đủ các nội dung quy định về các bộ phận tạo thành của thủ tục hành chính',
  'Kết quả xử lý hồ sơ nộp trực tuyến đối với hồ sơ đang xử lý',

  // Bạn có thể thêm các tên chỉ số khác vào đây
];
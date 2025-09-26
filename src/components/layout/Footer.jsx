import React from 'react';
import './Footer.css'; // Import file CSS riêng cho Footer

const Footer = () => {
    return (
        <footer className="app-footer">
            <p className="footer-warning">
                <strong>Lưu ý quan trọng:</strong>
            </p>
            <p>
                Website này hiện đang lấy dữ liệu trực tiếp từ một file Google Sheets.
                Nhà phát triển không đảm bảo 100% thông tin hiển thị trên đây là chính xác tuyệt đối.
                Vì vậy, người dùng cần kiểm tra và đối chiếu kỹ lưỡng trước khi sử dụng.
            </p>
            <p>
                Do sử dụng nền tảng miễn phí, trang web có thể không ổn định hoặc ngừng hoạt động bất cứ lúc nào.
            </p>
        </footer>
    );
};

export default Footer;

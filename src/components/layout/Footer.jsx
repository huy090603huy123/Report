import React from 'react';
import './Footer.css'; // Import file CSS riêng cho Footer

const Footer = () => {
    return (
        <footer className="app-footer">
            <p className="footer-warning">
                <strong>Lưu ý quan trọng:</strong>
            </p>
            <p>
                Website này hiện đang lấy dữ liệu người dùng nhập vào.
                Nhà phát triển không đảm bảo 100% thông tin hiển thị trên đây là chính xác tuyệt đối.
                Vì vậy, thông tin trên trang này chỉ mang tính tham khảo.
            </p>
            <p>
                Phiên bản đang trong giai đoạn thí điểm..
            </p>
        </footer>
    );
};

export default Footer;

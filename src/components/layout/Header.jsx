import React from 'react';

const Header = ({ onAddDataClick }) => (
    <header className="app-header">
        <h1>📊 Theo dõi các chỉ tiêu theo quyết định 766/QĐ-TTg</h1>
        <button className="header-action-button" onClick={onAddDataClick}>
            <span className="icon-plus"></span>
            Thêm dữ liệu mới
        </button>
    </header>
);

export default Header;

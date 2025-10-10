// src/components/layout/Navbar.jsx
import React from 'react';
import './Navbar.css';

const Navbar = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="navbar">
      <a 
        href="#dashboard" 
        className={currentPage === 'dashboard' ? 'active' : ''} 
        onClick={() => setCurrentPage('dashboard')}
      >
        Bảng điều khiển
      </a>
      <a 
        href="#statistics" 
        className={currentPage === 'statistics' ? 'active' : ''} 
        onClick={() => setCurrentPage('statistics')}
      >
        Thống kê
      </a>
      <a 
        href="#about" 
        className={currentPage === 'about' ? 'active' : ''} 
        onClick={() => setCurrentPage('about')}
      >
        Giới thiệu
      </a>
    </nav>
  );
};

export default Navbar;
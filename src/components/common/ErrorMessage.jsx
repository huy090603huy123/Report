import React from 'react';
import { useDispatch } from 'react-redux';
import { fetchConfigAndUnits } from '../../store/slices/dataSlice';
import './ErrorMessage.css';

const ErrorMessage = ({ error }) => {
  const dispatch = useDispatch();

  const handleRetry = () => {
    dispatch(fetchConfigAndUnits());
  };

  return (
    <div className="error-container card">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Đã xảy ra lỗi</h3>
      <p className="error-message">{error || 'Không thể tải dữ liệu. Vui lòng kiểm tra lại kết nối mạng.'}</p>
      <button className="retry-button" onClick={handleRetry}>
        Thử lại
      </button>
    </div>
  );
};

export default ErrorMessage;
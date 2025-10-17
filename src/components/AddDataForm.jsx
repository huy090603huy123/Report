import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './AddDataForm.css';

// Đảm bảo bạn đã cập nhật URL này bằng URL triển khai mới nhất của bạn
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwVKE2Ju4MXk26H9sUyYawyAagWK45ZJ8syKayHYXnQnImr062th0Jngg4A-y5U5Bhn/exec';

const AddDataForm = ({ onClose }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const parts = dateString.split('-');
        if (parts.length !== 3) return '';
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setMessage('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            setMessage('Vui lòng chọn một file Excel.');
            return;
        }

        setIsSubmitting(true);
        setMessage('Đang lấy thông tin & xử lý file...');

        // Lấy địa chỉ IP của người dùng trước khi gửi
        let userIp = 'Không xác định';
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            if (ipResponse.ok) {
                const ipData = await ipResponse.json();
                userIp = ipData.ip;
            }
        } catch (ipError) {
            console.error("Không thể lấy địa chỉ IP:", ipError);
            // Vẫn tiếp tục dù không lấy được IP
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length === 0) {
                    setMessage('Lỗi: File Excel rỗng hoặc không có dữ liệu.');
                    setIsSubmitting(false);
                    return;
                }

                const parts = selectedDate.split('-');
                const formattedSheetName = `${parts[2]}${parts[1]}${parts[0]}`;

                const scriptPayload = {
                    sheetName: formattedSheetName,
                    data: jsonData,
                    ipAddress: userIp // Thêm IP vào dữ liệu gửi đi
                };
                
                setMessage('Đang gửi dữ liệu đến Google Sheet...');

                fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(scriptPayload),
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                })
                .then(res => res.json())
                .then(response => {
                    if (response.status === 'success' || response.status === 'skipped') {
                        setMessage(response.message);
                    } else {
                        setMessage(`Lỗi từ máy chủ: ${response.message}`);
                    }
                })
                .catch(err => {
                    setMessage(`Lỗi mạng hoặc không thể kết nối: ${err.message}`);
                })
                .finally(() => {
                    setIsSubmitting(false);
                });

            } catch (error) {
                setMessage(`Lỗi khi đọc file Excel: ${error.message}`);
                setIsSubmitting(false);
            }
        };

        reader.onerror = () => {
            setMessage('Không thể đọc file đã chọn.');
            setIsSubmitting(false);
        };
        
        reader.readAsArrayBuffer(selectedFile);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Thêm dữ liệu mới từ Excel</h2>
                <p>Chọn ngày (sẽ là tên sheet mới) và tải lên file Excel.</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="sheet-date">Ngày của dữ liệu</label>
                        <input type="date" id="sheet-date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} required />
                        <small style={{ marginTop: '5px', display: 'block', color: '#555' }}>
                            Ngày được chọn: <strong>{formatDateForDisplay(selectedDate)}</strong> (Ngày/Tháng/Năm)
                        </small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="excel-file">Chọn file Excel</label>
                        <input type="file" id="excel-file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} required />
                    </div>
                    <button type="submit" className="submit-button" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang xử lý...' : 'Thêm dữ liệu'}
                    </button>
                </form>
                {message && <p className="status-message-form">{message}</p>}
                <button className="close-button" onClick={onClose}>×</button>
            </div>
        </div>
    );
};

export default AddDataForm;
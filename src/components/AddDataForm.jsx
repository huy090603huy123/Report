import React, { useState } from 'react';
import * as XLSX from 'xlsx'; // Import thư viện xlsx
import './AddDataForm.css';

// !!! THAY THẾ URL CỦA BẠN VÀO ĐÂY !!!
// Dán URL bạn đã sao chép từ Google Apps Script ở Phần 2, Bước 3.
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyD4tyr7gRMeToN4JXDXvT_YDpU1ytw4ih9KmNc_6aJ2xfAoQAajhBycCoGbphZ9ciC/exec';

const AddDataForm = ({ onClose }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setMessage('');
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!selectedFile) {
            setMessage('Vui lòng chọn một file Excel.');
            return;
        }

        setIsSubmitting(true);
        setMessage('Đang đọc và xử lý file...');

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

                // --- THAY ĐỔI TẠI ĐÂY ---
                // Chuyển đổi định dạng ngày YYYY-MM-DD thành DDMMYYYY
                const parts = selectedDate.split('-'); // Tách chuỗi thành ['YYYY', 'MM', 'DD']
                const formattedSheetName = `${parts[2]}${parts[1]}${parts[0]}`; // Ghép lại thành DDMMYYYY
                // --- KẾT THÚC THAY ĐỔI ---

                const scriptPayload = {
                    sheetName: formattedSheetName, // Sử dụng tên đã được định dạng
                    data: jsonData
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
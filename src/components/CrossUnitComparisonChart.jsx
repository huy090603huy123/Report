// src/components/CrossUnitComparisonChart.jsx

import React from 'react';
import { Bar } from 'react-chartjs-2';
// --- Bỏ import LineElement và PointElement không cần thiết ---
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Đăng ký lại các thành phần cần thiết cho biểu đồ cột
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Hàm tạo màu (giữ nguyên)
const generatePastelColor = (index) => {
    const hue = (index * 137.508) % 360;
    return `hsla(${hue}, 70%, 75%, 0.8)`;
};

const generatePastelBorderColor = (index) => {
    const hue = (index * 137.508) % 360;
    return `hsla(${hue}, 70%, 60%, 1)`;
};

const CrossUnitComparisonChart = ({ comparisonData, selectedIndicators }) => {
    if (!comparisonData || comparisonData.headers.length <= 2 || !comparisonData.data['Tổng hợp']) {
        return null;
    }

    let generalDataRows = comparisonData.data['Tổng hợp'];

    // Lọc dữ liệu dựa trên các chỉ số được chọn (giữ nguyên)
    if (selectedIndicators && selectedIndicators.length > 0) {
        generalDataRows = generalDataRows.filter(row => selectedIndicators.includes(row['CHỈ SỐ']));
    }

    const unitNames = comparisonData.headers.filter(h => h !== 'CHỈ SỐ' && h !== 'NHÓM CHỈ TIÊU');

    // --- BỎ PHẦN TÍNH TOÁN ĐIỂM TRUNG BÌNH ---

    const chartData = {
        labels: generalDataRows.map(row => row['CHỈ SỐ']),
        // --- BỎ DATASET CỦA ĐƯỜNG TRUNG BÌNH RA KHỎI MẢNG ---
        datasets: unitNames.map((unit, index) => ({
            label: unit,
            data: generalDataRows.map(row => row[unit] || 0),
            backgroundColor: generatePastelColor(index),
            borderColor: generatePastelBorderColor(index),
            borderWidth: 1,
        })),
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Biểu đồ so sánh điểm TỔNG HỢP giữa các đơn vị',
                font: { size: 16 }
            },
            tooltip: {
                callbacks: {
                    label: context => `${context.dataset.label}: ${context.raw.toFixed(2)}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Điểm đánh giá'
                }
            },
            x: {
                ticks: {
                    autoSkip: false, 
                    maxRotation: 45,
                    minRotation: 30,
                }
            }
        },
    };

    return (
        <div className="card chart-container" style={{ marginBottom: '1.5rem', minHeight: '500px' }}>
             {generalDataRows.length > 0 ? (
                <div style={{ position: 'relative', height: '100%', minHeight: '500px' }}>
                    <Bar options={options} data={chartData} />
                </div>
            ) : (
                <p style={{textAlign: 'center', paddingTop: '50px'}}>Vui lòng chọn ít nhất một chỉ số để hiển thị biểu đồ.</p>
            )}
        </div>
    );
};

export default CrossUnitComparisonChart;
import React from 'react';
import { Bar } from 'react-chartjs-2';

// Hàm tạo màu ngẫu nhiên nhưng dễ nhìn cho các cột
const generatePastelColor = (index) => {
    const hue = (index * 137.508) % 360; // Dùng golden angle để màu sắc khác biệt
    return `hsla(${hue}, 70%, 75%, 0.8)`;
};

const generatePastelBorderColor = (index) => {
    const hue = (index * 137.508) % 360;
    return `hsla(${hue}, 70%, 60%, 1)`;
};

const CrossUnitComparisonChart = ({ comparisonData }) => {
    // Điều kiện hiển thị: có dữ liệu, có hơn 2 đơn vị, VÀ có nhóm 'Tổng hợp' trong dữ liệu
    if (!comparisonData || comparisonData.headers.length <= 2 || !comparisonData.data['Tổng hợp']) {
        return null;
    }

    // CHỈ LẤY DỮ LIỆU TỪ NHÓM "TỔNG HỢP"
    const generalDataRows = comparisonData.data['Tổng hợp'];

    // Lấy danh sách các đơn vị từ header (bỏ cột 'CHỈ SỐ')
    const unitNames = comparisonData.headers.filter(h => h !== 'CHỈ SỐ' && h !== 'NHÓM CHỈ TIÊU');

    const chartData = {
        labels: generalDataRows.map(row => row['CHỈ SỐ']),
        datasets: unitNames.map((unit, index) => ({
            label: unit,
            data: generalDataRows.map(row => row[unit] || 0), // Lấy dữ liệu điểm của đơn vị
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
                // Cập nhật lại tiêu đề biểu đồ
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
            <div style={{ position: 'relative', height: '100%', minHeight: '500px' }}>
                <Bar options={options} data={chartData} />
            </div>
        </div>
    );
};

export default CrossUnitComparisonChart;
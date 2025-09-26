import React from 'react';
import { Bar } from 'react-chartjs-2';

const ComparisonChart = ({ data, unitName }) => {
    // Lọc dữ liệu để chỉ lấy các chỉ số thuộc nhóm "Tổng hợp"
    const generalData = data.filter(item => item['NHÓM CHỈ TIÊU'] === 'Tổng hợp');

    if (!generalData || generalData.length === 0) {
        return <p>Không có dữ liệu tổng hợp để hiển thị.</p>;
    }

    const chartData = {
        labels: generalData.map(item => item['CHỈ SỐ']),
        datasets: [{
            label: 'Thay đổi Điểm đánh giá',
            data: generalData.map(item => item.thayDoiDiem),
            backgroundColor: generalData.map(item => item.thayDoiDiem >= 0 ? 'rgba(40, 167, 69, 0.7)' : 'rgba(220, 53, 69, 0.7)'),
            borderColor: generalData.map(item => item.thayDoiDiem >= 0 ? 'rgba(40, 167, 69, 1)' : 'rgba(220, 53, 69, 1)'),
            borderWidth: 1,
        }],
    };

    const options = {
        indexAxis: 'y', // Chuyển biểu đồ thành dạng thanh ngang để dễ đọc tên chỉ số
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: `Biểu đồ thay đổi điểm tổng hợp của ${unitName}`, // Cập nhật tiêu đề
                font: {
                    size: 16
                }
            },
            tooltip: {
                callbacks: {
                    label: context => `${context.dataset.label}: ${context.raw.toFixed(2)}`
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Mức độ thay đổi'
                }
            }
        }
    };

    return (
        <div style={{ position: 'relative', height: '400px' }}>
            <Bar options={options} data={chartData} />
        </div>
    );
};

export default ComparisonChart;
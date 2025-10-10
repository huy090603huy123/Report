// src/components/common/VisitorTrendChart.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import './VisitorTrendChart.css';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyD4tyr7gRMeToN4JXDXvT_YDpU1ytw4ih9KmNc_6aJ2xfAoQAajhBycCoGbphZ9ciC/exec';

const VisitorTrendChart = () => {
    const [dailyData, setDailyData] = useState([]);
    const [timeRange, setTimeRange] = useState(7); // 7, 30, or 90 days
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch(`${GOOGLE_SCRIPT_URL}?action=getDailyVisits`)
            .then(res => res.json())
            .then(result => {
                if (result.status === 'success') {
                    // Sắp xếp dữ liệu theo ngày tăng dần
                    const sortedData = result.data.sort((a, b) => new Date(a.date) - new Date(b.date));
                    setDailyData(sortedData);
                } else {
                    throw new Error(result.message || 'Không thể tải dữ liệu biểu đồ');
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const chartData = useMemo(() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - timeRange);

        const filteredData = dailyData.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= endDate;
        });

        const labels = filteredData.map(item => {
            const date = new Date(item.date);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        });
        const dataPoints = filteredData.map(item => item.visits);

        return {
            labels,
            datasets: [
                {
                    label: `Lượt truy cập trong ${timeRange} ngày qua`,
                    data: dataPoints,
                    fill: true,
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    tension: 0.3,
                    pointBackgroundColor: 'rgba(0, 123, 255, 1)',
                },
            ],
        };
    }, [dailyData, timeRange]);

    if (loading) return <div className="chart-loading">Đang tải dữ liệu biểu đồ...</div>;
    if (error) return <div className="chart-error">Lỗi: {error}</div>;

    return (
        <div className="visitor-trend-chart">
            <div className="chart-header">
                <h4>Xu hướng truy cập</h4>
                <div className="time-range-buttons">
                    <button onClick={() => setTimeRange(7)} className={timeRange === 7 ? 'active' : ''}>7 ngày</button>
                    <button onClick={() => setTimeRange(30)} className={timeRange === 30 ? 'active' : ''}>30 ngày</button>
                    <button onClick={() => setTimeRange(90)} className={timeRange === 90 ? 'active' : ''}>3 tháng</button>
                </div>
            </div>
            <div className="chart-container">
                 <Line data={chartData} options={{ maintainAspectRatio: false, responsive: true }} />
            </div>
        </div>
    );
};

export default VisitorTrendChart;
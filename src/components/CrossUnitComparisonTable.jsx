import React from 'react';

const CrossUnitComparisonTable = ({ comparisonData, selectedDate, onViewFullScreen }) => {
    if (!comparisonData || comparisonData.headers.length <= 1) return null;
    
    return (
        <div className="table-container" style={{marginTop: '1.5rem'}}>
            <div className="table-header-controls">
                <div>
                    <h4>Bảng so sánh điểm giữa các đơn vị đã chọn</h4>
                    <p>Dữ liệu tại ngày: <strong>{selectedDate}</strong></p>
                </div>
                <button 
                    onClick={onViewFullScreen} 
                    className="fullscreen-button"
                    title="Mở bảng trong một tab mới để xem toàn màn hình"
                >
                    ↗️ Xem toàn màn hình
                </button>
            </div>
            <table>
                <thead>
                    <tr>
                        {comparisonData.headers.map(header => <th key={header}>{header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(comparisonData.data).map(([groupName, rows]) => (
                        <React.Fragment key={groupName}>
                            <tr className="group-header-row"><td colSpan={comparisonData.headers.length}>{groupName}</td></tr>
                            {rows.map((row, index) => (
                                <tr key={index}>
                                    {comparisonData.headers.map(header => (
                                        <td key={header}>
                                            {header === 'CHỈ SỐ' 
                                                ? <div className="indicator-name">{row[header]}</div> 
                                                : (typeof row[header] === 'number' ? row[header].toFixed(2) : '–')
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CrossUnitComparisonTable;
import React from 'react';
import Select from 'react-select';

const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: '48px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '1rem',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#007bff',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#f1f8ff' : null,
    color: state.isSelected ? 'white' : 'black',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#888',
  }),
};

const Controls = ({ 
    unitOptions, 
    selectedUnit, 
    onUnitChange, 
    oldDate, 
    onOldDateChange, 
    newDate, 
    onNewDateChange, 
    sheetsConfig 
}) => (
    <div className="card controls-grid">
        <div className="control-group">
            <label htmlFor="unit-select">1. Chọn Đơn vị</label>
            <Select
                id="unit-select"
                options={unitOptions}
                value={selectedUnit}
                onChange={onUnitChange}
                placeholder="-- Vui lòng chọn hoặc nhập để tìm kiếm --"
                isSearchable
                noOptionsMessage={() => "Không tìm thấy đơn vị"}
                styles={customSelectStyles}
            />
        </div>
        <div className="control-group">
            <label htmlFor="old-date-select">2. So sánh ngày</label>
            <select id="old-date-select" value={oldDate} onChange={onOldDateChange} disabled={!selectedUnit}>
                {sheetsConfig.map(sheet => <option key={`${sheet.gid}-old`} value={sheet.name}>{sheet.name}</option>)}
            </select>
        </div>
        <div className="control-group">
            <label htmlFor="new-date-select">3. Với ngày</label>
            <select id="new-date-select" value={newDate} onChange={onNewDateChange} disabled={!selectedUnit}>
                {sheetsConfig.map(sheet => <option key={`${sheet.gid}-new`} value={sheet.name}>{sheet.name}</option>)}
            </select>
        </div>
    </div>
);

export default Controls;

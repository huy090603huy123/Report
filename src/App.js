import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Import actions
import { fetchConfigAndUnits  } from './store/slices/dataSlice'; 


import SkeletonLoader from './components/common/SkeletonLoader';
import ErrorMessage from './components/common/ErrorMessage';


// Import Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Controls from './components/controls/Controls';
import Dashboard from './components/dashboard/Dashboard'; // <-- Import component mới
import AddDataForm from './components/AddDataForm';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const dispatch = useDispatch();
  const { sheetsConfig, units, loading, error } = useSelector((state) => state.data);

  useEffect(() => {
    dispatch(fetchConfigAndUnits());
  }, [dispatch]);

  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedOldDate, setSelectedOldDate] = useState('');
  const [selectedNewDate, setSelectedNewDate] = useState('');
  const [showAddDataForm, setShowAddDataForm] = useState(false);

  useEffect(() => {
    if (sheetsConfig && sheetsConfig.length > 1) {
      setSelectedNewDate(sheetsConfig[0].name);
      setSelectedOldDate(sheetsConfig[1].name);
    } else if (sheetsConfig && sheetsConfig.length > 0) {
      setSelectedNewDate(sheetsConfig[0].name);
    }
  }, [sheetsConfig]);

  const unitOptions = useMemo(() => units.map(unit => ({ value: unit, label: unit })), [units]);

    if (loading) {
    return (
      <div className="container">
        <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <Header onAddDataClick={() => setShowAddDataForm(true)} />
        <ErrorMessage error={error} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="container">
      {showAddDataForm && <AddDataForm onClose={() => setShowAddDataForm(false)} />}
      
      <Header onAddDataClick={() => setShowAddDataForm(true)} />
      
      <main>
        <Controls
            sheetsConfig={sheetsConfig}
            unitOptions={unitOptions}
            selectedUnit={selectedUnit}
            onUnitChange={setSelectedUnit}
            oldDate={selectedOldDate}
            onOldDateChange={(e) => setSelectedOldDate(e.target.value)}
            newDate={selectedNewDate}
            onNewDateChange={(e) => setSelectedNewDate(e.target.value)}
        />
        
        {selectedUnit ? (
          <Dashboard 
            selectedUnit={selectedUnit}
            oldDate={selectedOldDate}
            newDate={selectedNewDate}
          />
        ) : <p className="status-message">Vui lòng chọn một đơn vị để xem dữ liệu.</p>}
      </main>

      <Footer />
    </div>
  );
}

export default App;
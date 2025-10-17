// src/components/common/VisitorCounter.jsx
import { useEffect } from 'react';
import { useDispatch } from 'react-redux'; // <-- Thêm vào
import { setVisitorCount } from '../../store/slices/dataSlice'; // <-- Thêm vào

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwVKE2Ju4MXk26H9sUyYawyAagWK45ZJ8syKayHYXnQnImr062th0Jngg4A-y5U5Bhn/exec';

const VisitorCounter = () => {
    const dispatch = useDispatch(); // <-- Thêm vào

    useEffect(() => {
        const hasVisitedInSession = sessionStorage.getItem('hasVisited');

        const updateCount = (action) => {
            fetch(`${GOOGLE_SCRIPT_URL}?action=${action}`, { method: 'GET' })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    // --- BẮT ĐẦU CODE MỚI ---
                    dispatch(setVisitorCount(data.count.toLocaleString()));
                    // --- KẾT THÚC CODE MỚI ---
                } else {
                    dispatch(setVisitorCount('N/A'));
                }
            })
            .catch(() => dispatch(setVisitorCount('N/A')));
        };

        if (!hasVisitedInSession) {
            sessionStorage.setItem('hasVisited', 'true');
            updateCount('recordVisit');
        } else {
            updateCount('getCount');
        }
    }, [dispatch]);

    return null; // Component này chỉ chạy logic, không hiển thị gì cả
};

export default VisitorCounter;
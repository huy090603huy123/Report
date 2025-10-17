// src/components/common/OnlineCounter.jsx
import { useEffect } from 'react';
import { useDispatch } from 'react-redux'; // <-- Thêm vào
import { database } from '../../firebaseConfig';
import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { setOnlineCount } from '../../store/slices/dataSlice'; // <-- Thêm vào

const OnlineCounter = () => {
    const dispatch = useDispatch(); // <-- Thêm vào

    useEffect(() => {
        const onlineUsersRef = ref(database, 'onlineUsers');
        const currentUserRef = ref(database, `onlineUsers/session-${Date.now()}`);

        const unsubscribe = onValue(onlineUsersRef, (snapshot) => {
            // --- BẮT ĐẦU CODE MỚI ---
            dispatch(setOnlineCount(snapshot.size));
            // --- KẾT THÚC CODE MỚI ---
        });

        const presenceRef = ref(database, '.info/connected');
        
        const presenceUnsubscribe = onValue(presenceRef, (snapshot) => {
            if (snapshot.val() === true) {
                set(currentUserRef, { onlineAt: serverTimestamp() });
                onDisconnect(currentUserRef).remove();
            }
        });

        return () => {
            unsubscribe();
            presenceUnsubscribe();
            set(currentUserRef, null); 
        };
    }, [dispatch]);

    return null; // Component này chỉ chạy logic, không hiển thị gì cả
};

export default OnlineCounter;
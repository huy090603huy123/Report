// src/components/common/OnlineCounter.jsx
import React, { useState, useEffect } from 'react';
import { database } from '../../firebaseConfig';
import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';

const OnlineCounter = () => {
    const [onlineCount, setOnlineCount] = useState('...');

    useEffect(() => {
        const onlineUsersRef = ref(database, 'onlineUsers');
        const currentUserRef = ref(database, `onlineUsers/session-${Date.now()}`);

        const unsubscribe = onValue(onlineUsersRef, (snapshot) => {
            setOnlineCount(snapshot.size);
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
    }, []);

    return <>{onlineCount}</>;
};

export default OnlineCounter;
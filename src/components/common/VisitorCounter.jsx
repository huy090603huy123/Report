// src/components/common/VisitorCounter.jsx
import React, { useState, useEffect, useRef } from 'react';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyD4tyr7gRMeToN4JXDXvT_YDpU1ytw4ih9KmNc_6aJ2xfAoQAajhBycCoGbphZ9ciC/exec';

const VisitorCounter = () => {
    const [visitorCount, setVisitorCount] = useState('...');
    const effectRan = useRef(false);

    useEffect(() => {
        if (process.env.NODE_ENV === "development" && effectRan.current === true) {
            return;
        }

        fetch(`${GOOGLE_SCRIPT_URL}?action=recordVisit`, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                setVisitorCount(data.count.toLocaleString());
            } else {
                setVisitorCount('N/A');
            }
        })
        .catch(() => setVisitorCount('N/A'));

        return () => {
            effectRan.current = true;
        };
    }, []);

    return <>{visitorCount}</>;
};

export default VisitorCounter;
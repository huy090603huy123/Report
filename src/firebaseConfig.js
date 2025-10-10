// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// !!! THAY THẾ BẰNG CẤU HÌNH FIREBASE CỦA BẠN !!!
// Dán đối tượng firebaseConfig bạn đã sao chép từ Firebase Console vào đây.
const firebaseConfig = {
 apiKey: "AIzaSyDbjTTIjZAHBHGfb3fyzjF6GGvA46vmv_k",
  authDomain: "phan-tich-du-lieu-counter.firebaseapp.com",
  databaseURL: "https://phan-tich-du-lieu-counter-default-rtdb.firebaseio.com",
  projectId: "phan-tich-du-lieu-counter",
  storageBucket: "phan-tich-du-lieu-counter.firebasestorage.app",
  messagingSenderId: "868407483279",
  appId: "1:868407483279:web:6d627bf222319ddcbc09fa"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
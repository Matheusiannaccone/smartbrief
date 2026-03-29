// config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbGItRydBzn_jdj_HmvHqeRssih7E5XUU",
  authDomain: "smart-brief-84c45.firebaseapp.com",
  projectId: "smart-brief-84c45",
  storageBucket: "smart-brief-84c45.firebasestorage.app",
  messagingSenderId: "1049988824096",
  appId: "1:1049988824096:web:6e6b25a686fd2fbc4dd045"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore();
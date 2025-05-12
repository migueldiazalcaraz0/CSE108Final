// firebase-config.js

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDD7CYqRQa84QVVgyiltx5Oo_3bgGRJc-4",
    authDomain: "cse1082nd.firebaseapp.com",
    projectId: "cse1082nd",
    storageBucket: "cse1082nd.firebasestorage.app",
    messagingSenderId: "62272277889",
    appId: "1:62272277889:web:d4be2dd7b65d8be72a6c80",
    measurementId: "G-C5RYNPFRQW"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
  
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDrIQzQMM9hRD5ze2ZGocmlTjw4orTphMA",
    authDomain: "cse108-f9ddb.firebaseapp.com",
    projectId: "cse108-f9ddb",
    storageBucket: "cse108-f9ddb.appspot.com",
    messagingSenderId: "1058963694650",
    appId: "1:1058963694650:web:3e4e31205646fbb6cb8103",
    measurementId: "G-3R35JZDDM2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage(); 
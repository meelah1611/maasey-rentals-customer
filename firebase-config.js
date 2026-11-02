// Firebase configuration for the MAASEY RENTALS project
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getFirestore} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
const app=initializeApp({
  apiKey:"AIzaSyBB7QB_7YikhSuZ21qpTZUvSbVAMtJJx_I",
  authDomain:"maasey-rentals.firebaseapp.com",
  projectId:"maasey-rentals",
  storageBucket:"maasey-rentals.firebasestorage.app",
  messagingSenderId:"510287929142",
  appId:"1:510287929142:web:9f8eed3698a964647c1d97",
  measurementId:"G-PPBE4HJBR7"
});
export const db=getFirestore(app), auth=getAuth(app);

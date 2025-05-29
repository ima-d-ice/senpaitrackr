// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth,GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC4cLRZiC9ir05KI-ldxcuLoI0PIMQ7Y4s",
  authDomain: "senpaitrackr.firebaseapp.com",
  projectId: "senpaitrackr",
  storageBucket: "senpaitrackr.firebasestorage.app",
  messagingSenderId: "742950448748",
  appId: "1:742950448748:web:eb56e7b1d61f2ee2c4b249",
  measurementId: "G-EMKS7RFCX2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
export { app, analytics, auth , provider, db };
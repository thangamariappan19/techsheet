// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDrqT5HBScp0v2_N43f5CaBR0ObqNZe9AI",
  authDomain: "techsheet-d41c2.firebaseapp.com",
  projectId: "techsheet-d41c2",
  storageBucket: "techsheet-d41c2.appspot.com",
  messagingSenderId: "290346011418",
  appId: "1:290346011418:web:d14e8600dbdc3cbb6ffaa3",
  measurementId: "G-RG39JLNYG7"
};
const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();
const auth = getAuth(app);

// Initialize Firebase
const db = getFirestore(app);

export { auth, provider, db };

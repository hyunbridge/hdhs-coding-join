import firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCyLcl_m5T7RNAksjS9leMNHPaYuQIJpjI",
  authDomain: "hdhs-coding.firebaseapp.com",
  projectId: "hdhs-coding",
  storageBucket: "hdhs-coding.appspot.com",
  messagingSenderId: "1024256369500",
  appId: "1:1024256369500:web:a8fed38e3988d8bcd15799",
  measurementId: "G-3PNLC27JWJ",
};

firebase.initializeApp(firebaseConfig);

export default firebase;

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBLhE9hu0vav5gdcuy5WXx4sBKTsJ9t2ow",
  authDomain: "pickle-connect-28780.firebaseapp.com",
  projectId: "pickle-connect-28780",
  storageBucket: "pickle-connect-28780.firebasestorage.app",
  messagingSenderId: "563771683765",
  appId: "1:563771683765:web:0c9bd0af99638bdb82dffc",
  measurementId: "G-R5HHDNS5HK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
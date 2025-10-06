
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAZsLqRARTHXAB2tnMWHCcaeBOu3P4EsHU",
  authDomain: "mychatapp-bc25d.firebaseapp.com",
  databaseURL: "https://mychatapp-bc25d-default-rtdb.firebaseio.com",
  projectId: "mychatapp-bc25d",
  storageBucket: "mychatapp-bc25d.firebasestorage.app",
  messagingSenderId: "688744499927",
  appId: "1:688744499927:web:18c97bd863316894ffbe92"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
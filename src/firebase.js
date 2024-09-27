import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7hOLii1weMpb6gY5T5VUc6Mc5ePpVHs0",
  authDomain: "task-manager-13ce3.firebaseapp.com",
  projectId: "task-manager-13ce3",
  storageBucket: "task-manager-13ce3.appspot.com",
  messagingSenderId: "420508093262",
  appId: "1:420508093262:web:724fddbe78447c03272c1f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };



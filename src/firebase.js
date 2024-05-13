// firebase.js
import firebase from 'firebase/compat/app'; // Adjust the import to use compat version
import 'firebase/compat/auth'; // Adjust the import
import 'firebase/compat/firestore'; // Add Firestore import
import 'firebase/compat/storage'; // Add Storage import


const firebaseConfig = {
    apiKey: "AIzaSyAekuVL9tDifeuXdhTEr2MYbAk2cnOnkqQ",
    authDomain: "rental-warehouse.firebaseapp.com",
    projectId: "rental-warehouse",
    storageBucket: "rental-warehouse.appspot.com",
    messagingSenderId: "316389674758",
    appId: "1:316389674758:web:4f338437c8966dbc499887"
};
const firebaseApp = firebase.initializeApp(firebaseConfig);
const auth = firebaseApp.auth();
const firestore = firebaseApp.firestore(); // Initialize Firestore
export const storage = firebase.storage(); // Initialize Firebase Storage
const GoogleAuthProvider = new firebase.auth.GoogleAuthProvider();

export { auth, firestore, GoogleAuthProvider  };

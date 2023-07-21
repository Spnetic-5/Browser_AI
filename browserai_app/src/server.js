import firebase from "firebase/app"
import "firebase/auth"
import 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBvtHZVKBeY6btKmkg3AzfrjTLtJkBW89M",
  authDomain: "browserai.firebaseapp.com",
  projectId: "browserai",
  storageBucket: "browserai.appspot.com",
  messagingSenderId: "607449644721",
  appId: "1:607449644721:web:93de34b8c823893b0aac90",
  measurementId: "G-BFXWGXSZHG"
};

// Initialize Firebase

const app = firebase.initializeApp(firebaseConfig)



export const auth = app.auth()
export const db = app.firestore()

export default { auth, db }

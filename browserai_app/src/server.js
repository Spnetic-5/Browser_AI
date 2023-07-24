import firebase from "firebase/app"
import "firebase/auth"
import 'firebase/firestore'

import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId
};

// Initialize Firebase

const app = firebase.initializeApp(firebaseConfig)



export const auth = app.auth()
export const db = app.firestore()

export default { auth, db }
